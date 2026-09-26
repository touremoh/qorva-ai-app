import { useState } from 'react';
import { generateJobDescription } from '../../api/jobService.js';
import PropTypes from 'prop-types';
import { Box, Button, TextField, Typography, CircularProgress } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { THEME_GREEN, THEME_GREEN_DARK, inputSx } from '../../model/jobForm.js';
import { useTranslation } from 'react-i18next';

/** Collapsible AI builder that drafts the job description from a few inputs. */
const JdAiBuilder = ({ createMode, jobTitle, onDraft }) => {
	const { t, i18n } = useTranslation();
	const [aiBuilderOpen, setAiBuilderOpen] = useState(false);
	const [aiBuilderBusy, setAiBuilderBusy] = useState(false);
	const [aiSeniority, setAiSeniority] = useState('');
	const [aiSkills, setAiSkills] = useState('');
	const [aiLocation, setAiLocation] = useState('');
	const [aiContract, setAiContract] = useState('');
	const [aiNotes, setAiNotes] = useState('');

	const handleGenerateJd = async () => {
		if (!jobTitle.trim() || aiBuilderBusy) return;
		setAiBuilderBusy(true);
		try {
			const res = await generateJobDescription({
				title: jobTitle.trim(),
				seniority: aiSeniority.trim(),
				mustHaveSkills: aiSkills.trim(),
				location: aiLocation.trim(),
				contractType: aiContract.trim(),
				extraNotes: aiNotes.trim(),
				language: i18n.language,
			});
			const draft = res.data;
			if (draft?.description) {
				onDraft(draft);
				setAiBuilderOpen(false);
			}
		} catch (error) {
			console.error('Job description generation failed:', error);
		} finally {
			setAiBuilderBusy(false);
		}
	};

	return (
		<>
		{createMode && (
			<Box sx={{ mb: 2, border: '1px solid rgba(98,156,68,0.35)', borderRadius: 2, overflow: 'hidden' }}>
				<Box
					onClick={() => setAiBuilderOpen(prev => !prev)}
					sx={{
						display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 1,
						backgroundColor: 'rgba(98,156,68,0.06)', cursor: 'pointer',
						'&:hover': { backgroundColor: 'rgba(98,156,68,0.10)' },
					}}
				>
					<AutoAwesomeIcon sx={{ fontSize: 17, color: THEME_GREEN }} />
					<Typography sx={{ fontSize: '0.84rem', fontWeight: 600, color: '#166534' }}>
						{t('jobContent.aiBuilder.toggle', 'Generate the description with AI')}
					</Typography>
					<Box sx={{ flex: 1 }} />
					<Typography sx={{ fontSize: '0.76rem', color: '#629C44' }}>
						{aiBuilderOpen ? '−' : '+'}
					</Typography>
				</Box>
				{aiBuilderOpen && (
					<Box sx={{ px: 1.5, py: 1.5, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
						<Typography sx={{ fontSize: '0.76rem', color: '#64748b' }}>
							{t('jobContent.aiBuilder.hint', 'Fill in the job title above plus any details below — the draft lands in the editor for you to review.')}
						</Typography>
						<Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
							<TextField size="small" label={t('jobContent.aiBuilder.seniority', 'Seniority')}
								value={aiSeniority} onChange={(e) => setAiSeniority(e.target.value)}
								sx={{ flex: '1 1 160px', ...inputSx }} />
							<TextField size="small" label={t('jobContent.aiBuilder.contract', 'Contract type')}
								value={aiContract} onChange={(e) => setAiContract(e.target.value)}
								sx={{ flex: '1 1 160px', ...inputSx }} />
							<TextField size="small" label={t('jobContent.aiBuilder.location', 'Location / remote')}
								value={aiLocation} onChange={(e) => setAiLocation(e.target.value)}
								sx={{ flex: '1 1 160px', ...inputSx }} />
						</Box>
						<TextField size="small" label={t('jobContent.aiBuilder.mustHave', 'Must-have skills (comma-separated)')}
							value={aiSkills} onChange={(e) => setAiSkills(e.target.value)}
							fullWidth sx={inputSx} />
						<TextField size="small" label={t('jobContent.aiBuilder.notes', 'Anything else the description should mention')}
							value={aiNotes} onChange={(e) => setAiNotes(e.target.value)}
							fullWidth multiline minRows={2} sx={inputSx} />
						<Button
							variant="contained"
							disabled={!jobTitle.trim() || aiBuilderBusy}
							onClick={handleGenerateJd}
							startIcon={aiBuilderBusy ? <CircularProgress size={14} color="inherit" /> : <AutoAwesomeIcon sx={{ fontSize: 16 }} />}
							sx={{
								alignSelf: 'flex-start', textTransform: 'none', fontWeight: 600, fontSize: '0.8rem',
								backgroundColor: THEME_GREEN, '&:hover': { backgroundColor: THEME_GREEN_DARK },
								borderRadius: 1.5, boxShadow: 'none',
							}}
						>
							{aiBuilderBusy
								? t('jobContent.aiBuilder.generating', 'Drafting…')
								: t('jobContent.aiBuilder.generate', 'Generate draft')}
						</Button>
					</Box>
				)}
			</Box>
		)}
		</>
	);
};

JdAiBuilder.propTypes = {
	createMode: PropTypes.bool,
	jobTitle: PropTypes.string.isRequired,
	onDraft: PropTypes.func.isRequired,
};

export default JdAiBuilder;
