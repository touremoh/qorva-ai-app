import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import { searchMentions } from '../../../services/mentionSearchService.js';

const DEBOUNCE_MS = 250;
const MAX_QUERY_LENGTH = 50;

const TRIGGER_TO_KIND = { '@': 'candidate', '#': 'job' };
const KIND_TO_TRIGGER = { candidate: '@', job: '#' };

const mentionKey = (m) => `${m.type}:${m.id}`;
const mentionPrefix = (type) => KIND_TO_TRIGGER[type] ?? '@';

const isCompletedMentionAt = (text, atPos, triggerChar, attachedMentions) => {
    if (!attachedMentions?.length) return false;
    const kind = TRIGGER_TO_KIND[triggerChar];
    if (!kind) return false;
    const scoped = attachedMentions.filter((m) => m.type === kind);
    const sorted = [...scoped].sort((a, b) => (b.name?.length ?? 0) - (a.name?.length ?? 0));
    for (const m of sorted) {
        if (!m.name) continue;
        const marker = `${triggerChar}${m.name}`;
        if (text.startsWith(marker, atPos)) {
            const nextChar = text[atPos + marker.length];
            if (nextChar === undefined || /\s/.test(nextChar)) return true;
        }
    }
    return false;
};

const findActiveMention = (text, caret, attachedMentions = []) => {
    if (caret == null || caret < 0) return null;
    let start = caret - 1;
    while (start >= 0) {
        const ch = text[start];
        if (ch === '\n') return null;
        if (ch === '@' || ch === '#') {
            const prev = start > 0 ? text[start - 1] : '';
            const atWordBoundary = prev === '' || /\s/.test(prev);
            if (!atWordBoundary) return null;
            if (isCompletedMentionAt(text, start, ch, attachedMentions)) {
                start -= 1;
                continue;
            }
            const query = text.slice(start + 1, caret);
            if (query.length > MAX_QUERY_LENGTH) return null;
            return { start, query, trigger: ch, kind: TRIGGER_TO_KIND[ch] };
        }
        start -= 1;
    }
    return null;
};

const MentionInput = ({
    value,
    onChange,
    mentions,
    onMentionsChange,
    onSubmit,
    disabled,
    placeholder,
    focusToken,
}) => {
    const [activeMention, setActiveMention] = useState(null); // { start, query }
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [highlightedIdx, setHighlightedIdx] = useState(0);

    const inputRef = useRef(null);
    const anchorRef = useRef(null);
    const debounceRef = useRef(null);
    const searchIdRef = useRef(0);

    const closePopper = useCallback(() => {
        setActiveMention(null);
        setOptions([]);
        setLoading(false);
        setHighlightedIdx(0);
    }, []);

    const runSearch = useCallback((query, kind) => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        setLoading(true);
        debounceRef.current = setTimeout(async () => {
            const id = ++searchIdRef.current;
            try {
                const results = await searchMentions(query, kind);
                if (id !== searchIdRef.current) return;
                setOptions(results);
                setHighlightedIdx(0);
            } catch {
                if (id === searchIdRef.current) setOptions([]);
            } finally {
                if (id === searchIdRef.current) setLoading(false);
            }
        }, DEBOUNCE_MS);
    }, []);

    useEffect(() => () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
    }, []);

    useEffect(() => {
        if (!focusToken) return;
        const el = inputRef.current;
        if (!el) return;
        el.focus();
        const len = el.value?.length ?? 0;
        try { el.setSelectionRange(len, len); } catch { /* older browsers */ }
    }, [focusToken]);

    useEffect(() => {
        if (!mentions?.length) return;
        const stillReferenced = mentions.filter((m) => value.includes(`${mentionPrefix(m.type)}${m.name}`));
        if (stillReferenced.length !== mentions.length) {
            onMentionsChange(stillReferenced);
        }
    }, [value, mentions, onMentionsChange]);

    const handleChange = (e) => {
        const nextValue = e.target.value;
        const nextCaret = e.target.selectionStart ?? nextValue.length;
        onChange(nextValue);

        const active = findActiveMention(nextValue, nextCaret, mentions);
        if (active) {
            setActiveMention(active);
            runSearch(active.query, active.kind);
        } else {
            closePopper();
        }
    };

    const insertMention = useCallback((option) => {
        if (!option || !activeMention) return;
        if (option.type !== activeMention.kind) return;
        const before = value.slice(0, activeMention.start);
        const afterStart = activeMention.start + 1 + activeMention.query.length;
        const after = value.slice(afterStart);
        const insertion = `${mentionPrefix(option.type)}${option.name} `;
        const nextValue = `${before}${insertion}${after}`;
        onChange(nextValue);

        const key = mentionKey(option);
        if (!mentions.some((m) => mentionKey(m) === key)) {
            onMentionsChange([...mentions, { type: option.type, id: option.id, name: option.name }]);
        }

        closePopper();

        setTimeout(() => {
            const el = inputRef.current;
            if (!el) return;
            const caret = before.length + insertion.length;
            el.focus();
            try { el.setSelectionRange(caret, caret); } catch { /* older browsers */ }
        }, 0);
    }, [activeMention, value, onChange, mentions, onMentionsChange, closePopper]);

    const removeMention = useCallback((m) => {
        onMentionsChange(mentions.filter((x) => mentionKey(x) !== mentionKey(m)));
        const marker = `${mentionPrefix(m.type)}${m.name}`;
        if (value.includes(marker)) {
            const withSpace = value.replace(`${marker} `, '');
            onChange(withSpace !== value ? withSpace : value.replace(marker, ''));
        }
    }, [mentions, value, onChange, onMentionsChange]);

    const handleKeyDown = (e) => {
        if (activeMention && options.length > 0) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setHighlightedIdx((i) => (i + 1) % options.length);
                return;
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setHighlightedIdx((i) => (i - 1 + options.length) % options.length);
                return;
            }
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                insertMention(options[highlightedIdx]);
                return;
            }
            if (e.key === 'Escape') {
                e.preventDefault();
                closePopper();
                return;
            }
        }
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSubmit?.();
        }
    };

    const popperOpen = !!activeMention;

    const iconFor = useMemo(() => ({
        candidate: <PersonOutlineIcon sx={{ fontSize: 18, color: '#629C44' }} />,
        job: <WorkOutlineIcon sx={{ fontSize: 18, color: '#629C44' }} />,
    }), []);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            <Box
                ref={anchorRef}
                sx={{
                    display: 'flex',
                    gap: 1,
                    alignItems: 'flex-end',
                    width: '100%',
                }}
            >
                <TextField
                    inputRef={inputRef}
                    fullWidth
                    multiline
                    maxRows={4}
                    value={value}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    onSelect={(e) => {
                        const caret = e.target.selectionStart ?? value.length;
                        const active = findActiveMention(value, caret, mentions);
                        if (active) {
                            if (!activeMention
                                || active.query !== activeMention.query
                                || active.start !== activeMention.start
                                || active.kind !== activeMention.kind) {
                                setActiveMention(active);
                                runSearch(active.query, active.kind);
                            }
                        } else if (activeMention) {
                            closePopper();
                        }
                    }}
                    placeholder={placeholder}
                    disabled={disabled}
                    variant="standard"
                    sx={{
                        '& .MuiInput-root': {
                            fontSize: '0.85rem',
                            color: '#1e293b',
                            '&::before, &::after': { display: 'none' },
                        },
                        '& .MuiInput-input': { py: 0.5 },
                    }}
                />
                <Tooltip title="Send (Enter)">
                    <span>
                        <IconButton
                            onClick={() => onSubmit?.()}
                            disabled={!value.trim() || disabled}
                            sx={{
                                width: 34,
                                height: 34,
                                backgroundColor: value.trim() && !disabled ? '#629C44' : 'transparent',
                                color: value.trim() && !disabled ? '#ffffff' : '#cbd5e1',
                                borderRadius: 2,
                                flexShrink: 0,
                                '&:hover': { backgroundColor: value.trim() && !disabled ? '#4d7a35' : 'rgba(0,0,0,0.04)' },
                                transition: 'all 0.15s ease',
                            }}
                        >
                            <SendOutlinedIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                    </span>
                </Tooltip>
            </Box>

            {mentions.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.75 }}>
                    {mentions.map((m) => (
                        <Chip
                            key={mentionKey(m)}
                            size="small"
                            icon={m.type === 'job' ? <WorkOutlineIcon sx={{ fontSize: 14 }} /> : <PersonOutlineIcon sx={{ fontSize: 14 }} />}
                            label={m.name}
                            onDelete={() => removeMention(m)}
                            sx={{
                                backgroundColor: 'rgba(98,156,68,0.08)',
                                color: '#1e293b',
                                border: '1px solid rgba(98,156,68,0.25)',
                                fontSize: '0.72rem',
                                height: 22,
                                '& .MuiChip-icon': { color: '#629C44', ml: '4px' },
                                '& .MuiChip-deleteIcon': {
                                    color: '#94a3b8',
                                    fontSize: 14,
                                    '&:hover': { color: '#ef4444' },
                                },
                            }}
                        />
                    ))}
                </Box>
            )}

            <Popper
                open={popperOpen}
                anchorEl={anchorRef.current}
                placement="top-start"
                modifiers={[{ name: 'offset', options: { offset: [0, 8] } }]}
                style={{ zIndex: 1400, width: anchorRef.current?.offsetWidth }}
            >
                <ClickAwayListener onClickAway={closePopper}>
                    <Paper
                        elevation={4}
                        sx={{
                            borderRadius: 2,
                            border: '1px solid #e2e8f0',
                            overflow: 'hidden',
                            maxHeight: 260,
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        {loading && options.length === 0 ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 2 }}>
                                <CircularProgress size={18} sx={{ color: '#629C44' }} />
                            </Box>
                        ) : options.length === 0 ? (
                            <Box sx={{ px: 2, py: 1.5 }}>
                                <Typography sx={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                                    No matches
                                </Typography>
                            </Box>
                        ) : (
                            <List dense sx={{ py: 0, overflowY: 'auto' }}>
                                {options.map((option, idx) => (
                                    <ListItemButton
                                        key={mentionKey(option)}
                                        selected={idx === highlightedIdx}
                                        onMouseEnter={() => setHighlightedIdx(idx)}
                                        onClick={() => insertMention(option)}
                                        sx={{
                                            gap: 1,
                                            py: 0.75,
                                            '&.Mui-selected': { backgroundColor: 'rgba(98,156,68,0.08)' },
                                            '&.Mui-selected:hover': { backgroundColor: 'rgba(98,156,68,0.12)' },
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 22, flexShrink: 0 }}>
                                            {iconFor[option.type]}
                                        </Box>
                                        <Box sx={{ minWidth: 0, flex: 1 }}>
                                            <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#1e293b', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {option.name}
                                            </Typography>
                                            {option.subtitle && (
                                                <Typography sx={{ fontSize: '0.7rem', color: '#94a3b8', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {option.subtitle}
                                                </Typography>
                                            )}
                                        </Box>
                                        <Typography sx={{ fontSize: '0.62rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                            {option.type}
                                        </Typography>
                                    </ListItemButton>
                                ))}
                            </List>
                        )}
                    </Paper>
                </ClickAwayListener>
            </Popper>
        </Box>
    );
};

export default MentionInput;
