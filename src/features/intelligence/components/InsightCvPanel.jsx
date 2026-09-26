import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import AppCVDetails from '../../cv/components/AppCVDetails.jsx';

/** Side panel with the resume opened from an insight. */
const InsightCvPanel = ({ cvLoading, selectedCV, setSelectedCV }) => {
    return (
        <>
        {(selectedCV || cvLoading) && (
            <Box sx={{
                width: '42%',
                flexShrink: 0,
                borderLeft: '1px solid #e2e8f0',
                backgroundColor: '#f8fafc',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
            }}>
                {cvLoading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        <CircularProgress size={24} sx={{ color: '#629C44' }} />
                    </Box>
                ) : (
                    <AppCVDetails
                        cv={selectedCV}
                        onClose={() => setSelectedCV(null)}
                        onUpdate={(updated) => setSelectedCV(updated)}
                    />
                )}
            </Box>
        )}
        </>
    );
};

InsightCvPanel.propTypes = {
    cvLoading: PropTypes.any,
    selectedCV: PropTypes.any,
    setSelectedCV: PropTypes.func,
};

export default InsightCvPanel;
