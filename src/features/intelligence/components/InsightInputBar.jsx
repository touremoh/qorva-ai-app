import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import MentionInput from './MentionInput.jsx';
import { useTranslation } from 'react-i18next';
import * as tokens from '../../../theme/tokens.js';
import { alpha } from '@mui/material/styles';

/** Question box with @-mentions and the send button. */
const InsightInputBar = ({ inputFocusToken, loading, loadingHistory, mentions, question, setMentions, setQuestion, submit }) => {
    const { t } = useTranslation();
    return (
        <>
        <Box sx={{
            px: { xs: 2, md: 3 },
            py: 1.5,
            backgroundColor: tokens.surface.paper,
            borderTop: `1px solid ${tokens.line.main}`,
            flexShrink: 0,
        }}>
            <Box sx={{ maxWidth: 820, mx: 'auto' }}>
                <Box sx={{
                    backgroundColor: tokens.surface.subtle,
                    border: `1.5px solid ${tokens.line.main}`,
                    borderRadius: 3,
                    px: 1.5,
                    py: 0.75,
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                    '&:focus-within': {
                        borderColor: tokens.brand.main,
                        boxShadow: `0 0 0 3px ${alpha(tokens.brand.main, 0.1)}`,
                        backgroundColor: tokens.surface.paper,
                    },
                }}>
                    <MentionInput
                        value={question}
                        onChange={setQuestion}
                        mentions={mentions}
                        onMentionsChange={setMentions}
                        onSubmit={() => submit()}
                        disabled={loading || loadingHistory}
                        placeholder={t('insight.input.placeholder')}
                        focusToken={inputFocusToken}
                    />
                </Box>
                <Typography sx={{ fontSize: '0.62rem', color: tokens.ink.faint, textAlign: 'center', mt: 0.6 }}>
                    {t('insight.input.hint')}
                </Typography>
            </Box>
        </Box>
        </>
    );
};

InsightInputBar.propTypes = {
    inputFocusToken: PropTypes.any,
    loading: PropTypes.bool,
    loadingHistory: PropTypes.any,
    mentions: PropTypes.any,
    question: PropTypes.any,
    setMentions: PropTypes.func,
    setQuestion: PropTypes.func,
    submit: PropTypes.any,
};

export default InsightInputBar;
