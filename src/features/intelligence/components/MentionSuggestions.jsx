import { useMemo } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Typography from '@mui/material/Typography';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import { alpha } from '@mui/material/styles';
import * as tokens from '../../../theme/tokens.js';
import { mentionKey } from '../model/mentions.js';

/** The mention search results, above the composer; the highlighted row follows the keyboard. */
const MentionSuggestions = ({ open, anchorEl, loading, options, highlightedIdx, onHighlight, onPick, onClose }) => {
    const iconFor = useMemo(() => ({
        candidate: <PersonOutlineIcon sx={{ fontSize: tokens.iconSize.lg, color: tokens.brand.text }} />,
        job: <WorkOutlineIcon sx={{ fontSize: tokens.iconSize.lg, color: tokens.brand.text }} />,
    }), []);

    return (
        <Popper
            open={open}
            anchorEl={anchorEl}
            placement="top-start"
            modifiers={[{ name: 'offset', options: { offset: [0, 8] } }]}
            style={{ zIndex: 1400, width: anchorEl?.offsetWidth }}
        >
            <ClickAwayListener onClickAway={onClose}>
                <Paper
                    elevation={4}
                    sx={{
                        borderRadius: 2,
                        border: `1px solid ${tokens.line.main}`,
                        overflow: 'hidden',
                        maxHeight: 260,
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    {loading && options.length === 0 ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 2 }}>
                            <CircularProgress size={18} sx={{ color: tokens.brand.text }} />
                        </Box>
                    ) : options.length === 0 ? (
                        <Box sx={{ px: 2, py: 1.5 }}>
                            <Typography sx={{ fontSize: tokens.fontSize.small, color: tokens.ink.subtle }}>
                                No matches
                            </Typography>
                        </Box>
                    ) : (
                        <List dense sx={{ py: 0, overflowY: 'auto' }}>
                            {options.map((option, idx) => (
                                <ListItemButton
                                    key={mentionKey(option)}
                                    selected={idx === highlightedIdx}
                                    onMouseEnter={() => onHighlight(idx)}
                                    onClick={() => onPick(option)}
                                    sx={{
                                        gap: 1,
                                        py: 0.75,
                                        '&.Mui-selected': { backgroundColor: alpha(tokens.brand.main, 0.08) },
                                        '&.Mui-selected:hover': { backgroundColor: alpha(tokens.brand.main, 0.12) },
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 22, flexShrink: 0 }}>
                                        {iconFor[option.type]}
                                    </Box>
                                    <Box sx={{ minWidth: 0, flex: 1 }}>
                                        <Typography sx={{ fontSize: tokens.fontSize.body2, fontWeight: 600, color: tokens.ink.heading, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {option.name}
                                        </Typography>
                                        {option.subtitle && (
                                            <Typography sx={{ fontSize: tokens.fontSize.caption, color: tokens.ink.subtle, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {option.subtitle}
                                            </Typography>
                                        )}
                                    </Box>
                                    <Typography sx={{ fontSize: tokens.fontSize.micro, color: tokens.ink.subtle, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                        {option.type}
                                    </Typography>
                                </ListItemButton>
                            ))}
                        </List>
                    )}
                </Paper>
            </ClickAwayListener>
        </Popper>
    );
};

MentionSuggestions.propTypes = {
    open: PropTypes.bool.isRequired,
    anchorEl: PropTypes.object,
    loading: PropTypes.bool.isRequired,
    options: PropTypes.arrayOf(PropTypes.object).isRequired,
    highlightedIdx: PropTypes.number.isRequired,
    onHighlight: PropTypes.func.isRequired,
    onPick: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default MentionSuggestions;
