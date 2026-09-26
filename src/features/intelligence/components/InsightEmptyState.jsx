import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import InsightIntentCards from './InsightIntentCards.jsx';
import { useTranslation } from 'react-i18next';

/** First screen of a conversation: intent cards to start from. */
const InsightEmptyState = ({ isEmpty, setInputFocusToken, setQuestion }) => {
    const { t } = useTranslation();
    return (
        <>
        {isEmpty && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4, gap: 2 }}>
                <Box sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(98,156,68,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <ForumOutlinedIcon sx={{ fontSize: 26, color: '#629C44' }} />
                </Box>
                <Typography sx={{ fontWeight: 600, fontSize: '0.95rem', color: '#1e293b', textAlign: 'center' }}>
                    {t('insight.intro.title')}
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center', maxWidth: 480 }}>
                    {t('insight.intro.subtitle')}
                </Typography>
                <InsightIntentCards
                    onCardClick={(example) => {
                        setQuestion(example);
                        setInputFocusToken((n) => n + 1);
                    }}
                />
            </Box>
        )}
        </>
    );
};

InsightEmptyState.propTypes = {
    isEmpty: PropTypes.bool,
    setInputFocusToken: PropTypes.func,
    setQuestion: PropTypes.func,
};

export default InsightEmptyState;
