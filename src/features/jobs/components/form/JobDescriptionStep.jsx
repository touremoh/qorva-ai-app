import PropTypes from 'prop-types';
import { Box, Button, TextField } from '@mui/material';
import { THEME_GREEN, THEME_GREEN_DARK, inputSx } from '../../model/jobForm.js';
import JobDescriptionEditor from './JobDescriptionEditor.jsx';
import JobFormStepper from './JobFormStepper.jsx';
import JdAiBuilder from './JdAiBuilder.jsx';
import { useTranslation } from 'react-i18next';
import * as tokens from '../../../../theme/tokens.js';

/** Step 1 of the job form: title, AI builder (create only) and description. */
const JobDescriptionStep = ({ createMode, handleJdDraft, jobDescription, jobTitle, onCancel, onNext, setJobDescription, setJobTitle }) => {
	const { t } = useTranslation();
	return (
		<>
		<Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, backgroundColor: tokens.surface.paper }}>
			<JobFormStepper activeStep={0} />
			<Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, sm: 3 } }}>
				<TextField
					label={t('jobContent.jobTitle')} fullWidth size="small" margin="normal"
					value={jobTitle} onChange={(e) => setJobTitle(e.target.value)}
					sx={{ mb: 2, ...inputSx }}
				/>

				{/* AI job-description builder — create mode only */}
				<JdAiBuilder createMode={createMode} jobTitle={jobTitle} onDraft={handleJdDraft} />
				<JobDescriptionEditor jobDescription={jobDescription} setJobDescription={setJobDescription} />
			</Box>
			<Box sx={{ flexShrink: 0, display: 'flex', gap: 1, px: { xs: 2, sm: 3 }, py: 2, borderTop: `1px solid ${tokens.line.main}`, backgroundColor: tokens.surface.paper }}>
				<Button onClick={onCancel}
					sx={{ textTransform: 'none', color: tokens.ink.muted, borderRadius: 1.5, fontSize: '0.84rem' }}>
					{t('jobContent.cancel')}
				</Button>
				<Box sx={{ flex: 1 }} />
				<Button variant="contained"
					disabled={!jobTitle.trim() || !jobDescription.trim() || jobDescription.trim() === '<p><br></p>'}
					onClick={onNext}
					sx={{
						textTransform: 'none', backgroundColor: THEME_GREEN,
						'&:hover': { backgroundColor: THEME_GREEN_DARK },
						borderRadius: 1.5, boxShadow: 'none', fontWeight: 600, fontSize: '0.84rem',
					}}>
					{t('jobContent.next')}
				</Button>
			</Box>
		</Box>
		</>
	);
};

JobDescriptionStep.propTypes = {
	createMode: PropTypes.any,
	handleJdDraft: PropTypes.func,
	jobDescription: PropTypes.any,
	jobTitle: PropTypes.any,
	onCancel: PropTypes.func,
	onNext: PropTypes.func,
	setJobDescription: PropTypes.func,
	setJobTitle: PropTypes.func,
};

export default JobDescriptionStep;
