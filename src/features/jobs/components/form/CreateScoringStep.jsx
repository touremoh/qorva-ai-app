import PropTypes from 'prop-types';
import { Box, Typography, CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { alpha } from '@mui/material/styles';
import JobScoringForm from './JobScoringForm.jsx';
import JobFormStepper from './JobFormStepper.jsx';
import * as tokens from '../../../../theme/tokens.js';

/** Create step 2: scoring rules, with the AI pre-fill overlay while drafting and a notice once applied. */
const CreateScoringStep = ({ aiPrefillBusy, aiPrefillApplied, scoringConfig, onScoringChange, onBack, onSkip, onSave, loading }) => {
	const { t } = useTranslation();
	return (
		<Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, backgroundColor: tokens.surface.paper, position: 'relative' }}>
			<JobFormStepper activeStep={1} />
			{aiPrefillBusy && (
				<Box sx={{
					position: 'absolute', inset: 0, zIndex: 5,
					backgroundColor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(1px)',
					display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', justifyContent: 'center', gap: 1.5,
				}}>
					<CircularProgress size={26} sx={{ color: tokens.brand.text }} />
					<Typography sx={{ fontSize: tokens.fontSize.body2, fontWeight: 600, color: tokens.ink.body }}>
						{t('jobContent.aiPrefill.drafting', 'AI is drafting your scoring rules…')}
					</Typography>
				</Box>
			)}
			{aiPrefillApplied && !aiPrefillBusy && (
				<Box sx={{
					mx: 2.5, mt: 1, px: 1.5, py: 0.75, borderRadius: 1.5,
					backgroundColor: alpha(tokens.brand.main, 0.08), border: `1px solid ${alpha(tokens.brand.main, 0.3)}`,
				}}>
					<Typography sx={{ fontSize: tokens.fontSize.small, color: tokens.brand.olive, fontWeight: 600 }}>
						{t('jobContent.aiPrefill.applied', 'AI-suggested scoring rules — review and adjust before saving.')}
					</Typography>
				</Box>
			)}
			<JobScoringForm
				scoringConfig={scoringConfig}
				onScoringChange={onScoringChange}
				onBack={onBack}
				onSkip={onSkip}
				onSave={onSave}
				loading={loading}
				saveLabel={t('jobContent.postJob')}
				t={t}
			/>
		</Box>
	);
};

CreateScoringStep.propTypes = {
	aiPrefillBusy: PropTypes.bool.isRequired,
	aiPrefillApplied: PropTypes.bool.isRequired,
	scoringConfig: PropTypes.object.isRequired,
	onScoringChange: PropTypes.func.isRequired,
	onBack: PropTypes.func.isRequired,
	onSkip: PropTypes.func.isRequired,
	onSave: PropTypes.func.isRequired,
	loading: PropTypes.bool.isRequired,
};

export default CreateScoringStep;
