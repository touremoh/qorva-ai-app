import PropTypes from 'prop-types';
import { Box, Button, CircularProgress } from '@mui/material';
import { THEME_GREEN, THEME_GREEN_DARK } from '../../model/jobForm.js';
import { useTranslation } from 'react-i18next';
import * as tokens from '../../../../theme/tokens.js';

/** Back, skip and save buttons pinned under the scoring form. */
const ScoringFormActions = ({ loading, onBack, onSave, onSkip, saveLabel }) => {
	const { t } = useTranslation();
	return (
		<>
		<Box sx={{
			flexShrink: 0,
			display: 'flex',
			gap: 1,
			px: { xs: 2, sm: 3 },
			py: 2,
			borderTop: `1px solid ${tokens.line.main}`,
			backgroundColor: tokens.surface.paper,
		}}>
			<Button onClick={onBack} disabled={loading}
				sx={{ textTransform: 'none', color: tokens.ink.muted, borderRadius: 1.5, fontSize: tokens.fontSize.body2 }}>
				{t('jobContent.back')}
			</Button>
			<Box sx={{ flex: 1 }} />
			<Button onClick={onSkip} disabled={loading}
				sx={{ textTransform: 'none', color: tokens.ink.subtle, borderRadius: 1.5, fontSize: tokens.fontSize.body2 }}>
				{t('jobContent.skipScoringRules')}
			</Button>
			<Button variant="contained" onClick={onSave} disabled={loading}
				sx={{
					textTransform: 'none', backgroundColor: THEME_GREEN,
					'&:hover': { backgroundColor: THEME_GREEN_DARK },
					borderRadius: 1.5, boxShadow: 'none', fontWeight: 600, fontSize: tokens.fontSize.body2, minWidth: 100,
				}}>
				{loading ? <CircularProgress size={16} color="inherit" /> : saveLabel}
			</Button>
		</Box>
		</>
	);
};

ScoringFormActions.propTypes = {
	loading: PropTypes.bool,
	onBack: PropTypes.func,
	onSave: PropTypes.func,
	onSkip: PropTypes.func,
	saveLabel: PropTypes.any,
};

export default ScoringFormActions;
