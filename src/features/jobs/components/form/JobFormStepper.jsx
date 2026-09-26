import PropTypes from 'prop-types';
import { Box, Step, StepLabel, Stepper } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { stepperSx } from '../../model/jobForm.js';
import * as tokens from '../../../../theme/tokens.js';

/** The two steps of creating or editing a job: basic info, then scoring rules. */
const JobFormStepper = ({ activeStep }) => {
	const { t } = useTranslation();
	return (
	<Box sx={{ px: { xs: 2, sm: 3 }, pt: 2, pb: 1.5, backgroundColor: tokens.surface.paper, borderBottom: `1px solid ${tokens.line.main}`, flexShrink: 0 }}>
		<Stepper activeStep={activeStep} sx={stepperSx}>
			<Step><StepLabel>{t('jobContent.stepBasicInfo')}</StepLabel></Step>
			<Step><StepLabel>{t('jobContent.stepScoringRules')}</StepLabel></Step>
		</Stepper>
	</Box>
	);
};

JobFormStepper.propTypes = { activeStep: PropTypes.number.isRequired };

export default JobFormStepper;
