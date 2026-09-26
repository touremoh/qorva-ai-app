import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import { alpha } from '@mui/material/styles';
import * as tokens from '../../../theme/tokens.js';
import { mentionKey } from '../model/mentions.js';

/** The attached mentions under the composer, each removable. */
const MentionChips = ({ mentions, onRemove }) => (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.75 }}>
        {mentions.map((m) => (
            <Chip
                key={mentionKey(m)}
                size="small"
                icon={m.type === 'job' ? <WorkOutlineIcon sx={{ fontSize: tokens.iconSize.sm }} /> : <PersonOutlineIcon sx={{ fontSize: tokens.iconSize.sm }} />}
                label={m.name}
                onDelete={() => onRemove(m)}
                sx={{
                    backgroundColor: alpha(tokens.brand.main, 0.08),
                    color: tokens.ink.heading,
                    border: `1px solid ${alpha(tokens.brand.main, 0.25)}`,
                    fontSize: tokens.fontSize.caption,
                    height: 22,
                    '& .MuiChip-icon': { color: tokens.brand.text, ml: '4px' },
                    '& .MuiChip-deleteIcon': {
                        color: tokens.ink.subtle,
                        fontSize: tokens.iconSize.sm,
                        '&:hover': { color: tokens.status.error.bright },
                    },
                }}
            />
        ))}
    </Box>
);

MentionChips.propTypes = {
    mentions: PropTypes.arrayOf(PropTypes.object).isRequired,
    onRemove: PropTypes.func.isRequired,
};

export default MentionChips;
