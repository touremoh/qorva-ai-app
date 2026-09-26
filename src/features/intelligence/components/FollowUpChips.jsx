import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import PropTypes from 'prop-types';
import * as tokens from '../../../theme/tokens.js';

const FollowUpChips = ({ suggestions, onSelect }) => {
    if (!suggestions?.length) return null;
    return (
        <Box sx={{ mt: 1.5 }}>
            <Typography sx={{ fontSize: tokens.fontSize.caption, color: tokens.ink.subtle, textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.75 }}>
                Follow-up suggestions
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {suggestions.map((s, i) => (
                    <Chip
                        key={i}
                        label={s}
                        size="small"
                        icon={<AutoAwesomeOutlinedIcon sx={{ fontSize: tokens.iconSize.xs }} />}
                        onClick={() => onSelect?.(s)}
                        sx={{
                            fontSize: tokens.fontSize.caption,
                            height: 26,
                            backgroundColor: 'rgba(99,102,241,0.06)',
                            border: '1px solid rgba(99,102,241,0.2)',
                            color: tokens.status.accent.main,
                            cursor: 'pointer',
                            '&:hover': { backgroundColor: 'rgba(99,102,241,0.12)' },
                            '& .MuiChip-icon': { color: tokens.status.accent.main },
                        }}
                    />
                ))}
            </Box>
        </Box>
    );
};

FollowUpChips.propTypes = {
    suggestions: PropTypes.arrayOf(PropTypes.string),
    onSelect: PropTypes.func,
};

export default FollowUpChips;
