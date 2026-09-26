import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PropTypes from 'prop-types';
import * as tokens from '../../../theme/tokens.js';

const DisclaimerBanner = ({ text }) => {
    if (!text) return null;
    return (
        <Box sx={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1,
            px: 1.5,
            py: 1,
            borderRadius: 1.5,
            backgroundColor: 'rgba(245,158,11,0.06)',
            border: '1px solid rgba(245,158,11,0.2)',
            mt: 1.5,
        }}>
            <InfoOutlinedIcon sx={{ fontSize: 15, color: tokens.status.warning.main, mt: 0.15, flexShrink: 0 }} />
            <Typography sx={{ fontSize: '0.75rem', color: tokens.status.warning.text, lineHeight: 1.5 }}>{text}</Typography>
        </Box>
    );
};

DisclaimerBanner.propTypes = {
    text: PropTypes.string,
};

export default DisclaimerBanner;
