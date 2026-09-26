import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import * as tokens from '../../../theme/tokens.js';

/** Shown while the insight answer is being prepared. */
const InsightTyping = ({ loading }) => {
    return (
        <>
        {loading && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, py: 1 }}>
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.4,
                    px: 1.5,
                    py: 0.75,
                    backgroundColor: tokens.surface.paper,
                    border: `1px solid ${tokens.surface.coolAlt}`,
                    borderRadius: '18px 18px 18px 4px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}>
                    {[0, 1, 2].map(dot => (
                        <Box key={dot} sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            backgroundColor: tokens.brand.main,
                            animation: 'pulse 1.4s ease-in-out infinite',
                            animationDelay: `${dot * 0.2}s`,
                            '@keyframes pulse': {
                                '0%, 80%, 100%': { opacity: 0.3, transform: 'scale(0.8)' },
                                '40%': { opacity: 1, transform: 'scale(1)' },
                            },
                        }} />
                    ))}
                </Box>
                <Typography sx={{ fontSize: '0.72rem', color: tokens.ink.subtle }}>
                    Analyzing…
                </Typography>
            </Box>
        )}
        </>
    );
};

InsightTyping.propTypes = {
    loading: PropTypes.bool,
};

export default InsightTyping;
