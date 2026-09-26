import { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import { searchMentions } from '../api/mentionSearchService.js';
import * as tokens from '../../../theme/tokens.js';
import { findActiveMention, mentionKey, mentionPrefix } from '../model/mentions.js';
import MentionChips from './MentionChips.jsx';
import MentionSuggestions from './MentionSuggestions.jsx';

const DEBOUNCE_MS = 250;

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
                            fontSize: tokens.fontSize.body2,
                            color: tokens.ink.heading,
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
                                backgroundColor: value.trim() && !disabled ? `${tokens.brand.main}` : 'transparent',
                                color: value.trim() && !disabled ? `${tokens.surface.paper}` : `${tokens.line.strong}`,
                                borderRadius: 2,
                                flexShrink: 0,
                                '&:hover': { backgroundColor: value.trim() && !disabled ? `${tokens.brand.deep}` : 'rgba(0,0,0,0.04)' },
                                transition: 'all 0.15s ease',
                            }}
                        >
                            <SendOutlinedIcon sx={{ fontSize: tokens.iconSize.md }} />
                        </IconButton>
                    </span>
                </Tooltip>
            </Box>

            {mentions.length > 0 && <MentionChips mentions={mentions} onRemove={removeMention} />}

            <MentionSuggestions
                open={popperOpen}
                anchorEl={anchorRef.current}
                loading={loading}
                options={options}
                highlightedIdx={highlightedIdx}
                onHighlight={setHighlightedIdx}
                onPick={insertMention}
                onClose={closePopper}
            />
        </Box>
    );
};

MentionInput.propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    mentions: PropTypes.arrayOf(PropTypes.shape({
        type: PropTypes.string,
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        name: PropTypes.string,
    })).isRequired,
    onMentionsChange: PropTypes.func.isRequired,
    onSubmit: PropTypes.func,
    disabled: PropTypes.bool,
    placeholder: PropTypes.string,
    focusToken: PropTypes.number,
};

export default MentionInput;
