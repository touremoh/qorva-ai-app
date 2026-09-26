import { useState } from 'react';
import ConfirmDialog from '../../../shared/ui/ConfirmDialog.jsx';
import {
	Box,
	Typography,
	CircularProgress,
} from '@mui/material';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import { useTranslation } from 'react-i18next';
import { createJob, updateJob, patchJobStatus, deleteJob, suggestScoringRules } from '../api/jobService.js';
import { isDemoUser } from '../../../utils/demoMode.js';
import 'react-quill/dist/quill.snow.css';
import { descriptionToHtml, jdTextToHtml, sanitizeDescription } from '../../../utils/jobDescription.js';
import { emptyScoringConfig, loadScoringConfig, buildScoringPayload } from '../model/scoringConfig.js';
import JobScoringForm from './form/JobScoringForm.jsx';
import JobDetailPanel from './detail/JobDetailPanel.jsx';
import JobListPanel from './list/JobListPanel.jsx';
import JobsToolbar from './list/JobsToolbar.jsx';
import useJobList from '../hooks/useJobList.js';
import JobFormStepper from './form/JobFormStepper.jsx';
import JobDescriptionStep from './form/JobDescriptionStep.jsx';
import * as tokens from '../../../theme/tokens.js';
import { alpha } from '@mui/material/styles';

// ─── Shared style constants ───────────────────────────────────────────────────

const JobContent = () => {
	const { t, i18n } = useTranslation();
	const demo = isDemoUser();
	const [createMode, setCreateMode] = useState(false);
	const [createStep, setCreateStep] = useState(0);
	const [editMode, setEditMode] = useState(false);
	const [editStep, setEditStep] = useState(0);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [selectedJob, setSelectedJob] = useState(null);
	const {
		jobs, setJobs, jobsLoading, search, setSearch, searchDebounceRef,
		currentPage, setCurrentPage, totalPages, totalElements, fetchJobs, handlePageChange,
	} = useJobList();
	const [jobTitle, setJobTitle] = useState('');
	const [jobDescription, setJobDescription] = useState('');
	const [scoringConfig, setScoringConfig] = useState(emptyScoringConfig());
	// AI job-description builder (create mode only): a few structured inputs draft the
	// whole post — title, description, and scoring rules for step 2 (unmetered).

	// AI pre-fill of scoring rules (create mode only). lastSuggestedFor guards against
	// re-billing an LLM call when the user bounces Back/Next without changing the description.
	const [aiPrefillBusy, setAiPrefillBusy] = useState(false);
	const [aiPrefillApplied, setAiPrefillApplied] = useState(false);
	const [lastSuggestedFor, setLastSuggestedFor] = useState(null);
	const [detailTab, setDetailTab] = useState(0);
	const [loading, setLoading] = useState(false);

	const resetForm = () => {
		setJobTitle(''); setJobDescription('');
		setAiPrefillApplied(false); setAiPrefillBusy(false); setLastSuggestedFor(null);
	};



	// ── Create flow ──────────────────────────────────────────────────────────────

	const handleStartCreate = () => {
		resetForm();
		setScoringConfig(emptyScoringConfig());
		setCreateStep(0);
		setCreateMode(true);
		setSelectedJob(null);
		setEditMode(false);
	};

	const handleCancelCreate = () => {
		setCreateMode(false);
		setCreateStep(0);
		resetForm();
		setScoringConfig(emptyScoringConfig());
	};


	// Applies an AI draft: title, description, and the scoring rules the backend suggested with it.
	const handleJdDraft = (draft) => {
		const html = jdTextToHtml(draft.description);
		if (draft.title) setJobTitle(draft.title);
		setJobDescription(html);
		// The backend already suggested scoring rules for this draft (free) — apply
		// them and mark the draft as suggested so step 2 skips the metered re-suggest.
		if (draft.scoringRules) {
			setScoringConfig(loadScoringConfig({ scoringRules: draft.scoringRules }));
			setAiPrefillApplied(true);
			setLastSuggestedFor(`${draft.title || jobTitle}::${html}`);
		}
	};

	/**
	 * Create-mode "Next": advance immediately, then let AI draft the scoring rules —
	 * only when the form is still untouched and the description changed since the last
	 * suggestion. Failures fall back silently to the empty form (accelerator, not blocker).
	 */
	const handleCreateNext = async () => {
		setCreateStep(1);
		const descriptionKey = `${jobTitle}::${jobDescription}`;
		const formUntouched = JSON.stringify(scoringConfig) === JSON.stringify(emptyScoringConfig()) || aiPrefillApplied;
		if (!jobDescription || !formUntouched || descriptionKey === lastSuggestedFor) return;
		setAiPrefillBusy(true);
		try {
			const res = await suggestScoringRules(jobTitle, sanitizeDescription(jobDescription));
			const suggestion = res.data?.data ?? res.data;
			if (suggestion) {
				setScoringConfig(loadScoringConfig({ scoringRules: suggestion }));
				setAiPrefillApplied(true);
				setLastSuggestedFor(descriptionKey);
			}
		} catch (error) {
			console.error('Scoring rules pre-fill failed (falling back to manual setup):', error);
		} finally {
			setAiPrefillBusy(false);
		}
	};

	const handleCreateJob = async (withScoringConfig) => {
		if (!jobTitle || !jobDescription) return;
		setLoading(true);
		try {
			const payload = {
				title: jobTitle,
				description: sanitizeDescription(jobDescription),
				status: 'open',
				language: i18n.language,
			};
			if (withScoringConfig) payload.scoringRules = buildScoringPayload(scoringConfig);
			const response = await createJob(payload);
			const created = response.data?.data;
			if (created) {
				handleCancelCreate();
				setSearch('');
				setCurrentPage(1);
				fetchJobs('', 0);
				setSelectedJob(created);
			}
		} catch (error) {
			console.error('Error creating job post:', error);
		} finally {
			setLoading(false);
		}
	};

	// ── Edit flow ────────────────────────────────────────────────────────────────

	const handleStartEdit = () => {
		setScoringConfig(loadScoringConfig(selectedJob));
		setEditStep(0);
		setEditMode(true);
		setCreateMode(false);
	};

	const handleCancelEdit = () => {
		setEditMode(false);
		setEditStep(0);
		if (selectedJob) {
			setJobTitle(selectedJob.title);
			setJobDescription(descriptionToHtml(selectedJob.description));
		}
		setScoringConfig(emptyScoringConfig());
	};

	const handleEditJob = async (withScoringConfig) => {
		if (!selectedJob || !jobTitle || !jobDescription) return;
		setLoading(true);
		try {
			const { scoringConfig: _sc, scoringRules: _sr, ...jobBase } = selectedJob;
			const payload = {
				...jobBase,
				title: jobTitle,
				description: sanitizeDescription(jobDescription),
				language: i18n.language,
			};
			if (withScoringConfig) payload.scoringRules = buildScoringPayload(scoringConfig);
			await updateJob(selectedJob.id, payload);
			setJobs(jobs.map(j => j.id === selectedJob.id ? payload : j));
			setSelectedJob(payload);
			setEditMode(false);
			setEditStep(0);
		} catch (error) {
			console.error('Error updating job post:', error);
		} finally {
			setLoading(false);
		}
	};

	// ── Other handlers ────────────────────────────────────────────────────────────

	const handleDeleteJob = async () => {
		if (!selectedJob) return;
		try {
			await deleteJob(selectedJob.id);
			setSelectedJob(null);
			setDeleteDialogOpen(false);
			const nextPage = jobs.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
			setCurrentPage(nextPage);
			fetchJobs(search, nextPage - 1);
		} catch (error) {
			console.error('Error deleting job post:', error);
		}
	};

	const handleToggleStatus = async () => {
		if (!selectedJob) return;
		const next = selectedJob.status === 'open' ? 'closed' : 'open';
		try {
			await patchJobStatus(selectedJob.id, next);
			setJobs(jobs.map(j => j.id === selectedJob.id ? { ...j, status: next } : j));
			setSelectedJob({ ...selectedJob, status: next });
		} catch (error) {
			console.error('Error updating job status:', error);
		}
	};

	const handleJobClick = (job) => {
		setSelectedJob(job);
		setJobTitle(job.title);
		setJobDescription(descriptionToHtml(job.description));
		setDetailTab(0);
		setCreateMode(false);
		setEditMode(false);
	};



	const step1Form = (onCancel, onNext) => (
		<JobDescriptionStep
			createMode={createMode}
			handleJdDraft={handleJdDraft}
			jobDescription={jobDescription}
			jobTitle={jobTitle}
			onCancel={onCancel}
			onNext={onNext}
			setJobDescription={setJobDescription}
			setJobTitle={setJobTitle}
		/>
	);

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', overflow: 'hidden', backgroundColor: tokens.surface.subtle }}>
			{/* Toolbar */}
			<JobsToolbar demo={demo} handleStartCreate={handleStartCreate} />

			{/* Split pane */}
			<Box sx={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>

				{/* Left panel — job list */}
				<JobListPanel
					createMode={createMode}
					currentPage={currentPage}
					editMode={editMode}
					fetchJobs={fetchJobs}
					handleJobClick={handleJobClick}
					handlePageChange={handlePageChange}
					jobs={jobs}
					jobsLoading={jobsLoading}
					search={search}
					searchDebounceRef={searchDebounceRef}
					selectedJob={selectedJob}
					setCurrentPage={setCurrentPage}
					setSearch={setSearch}
					totalElements={totalElements}
					totalPages={totalPages}
				/>

				{/* Right panel */}
				<Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: tokens.surface.subtle }}>

					{/* ── Create: Step 1 ── */}
					{createMode && createStep === 0 && step1Form(handleCancelCreate, handleCreateNext)}

					{/* ── Create: Step 2 ── */}
					{createMode && createStep === 1 && (
						<Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, backgroundColor: tokens.surface.paper, position: 'relative' }}>
							<JobFormStepper activeStep={1} />
							{aiPrefillBusy && (
								<Box sx={{
									position: 'absolute', inset: 0, zIndex: 5,
									backgroundColor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(1px)',
									display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1.5,
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
								setScoringConfig={setScoringConfig}
								onBack={() => setCreateStep(0)}
								onSkip={() => handleCreateJob(false)}
								onSave={() => handleCreateJob(true)}
								loading={loading}
								saveLabel={t('jobContent.postJob')}
								t={t}
							/>
						</Box>
					)}

					{/* ── Edit: Step 1 ── */}
					{editMode && editStep === 0 && step1Form(handleCancelEdit, () => setEditStep(1))}

					{/* ── Edit: Step 2 ── */}
					{editMode && editStep === 1 && (
						<Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, backgroundColor: tokens.surface.paper }}>
							<JobFormStepper activeStep={1} />
							<JobScoringForm
								scoringConfig={scoringConfig}
								setScoringConfig={setScoringConfig}
								onBack={() => setEditStep(0)}
								onSkip={() => handleEditJob(false)}
								onSave={() => handleEditJob(true)}
								loading={loading}
								saveLabel={t('jobContent.updateJobPost')}
								t={t}
							/>
						</Box>
					)}

					{/* ── Job detail ── */}
					<JobDetailPanel
						createMode={createMode}
						demo={demo}
						detailTab={detailTab}
						editMode={editMode}
						handleStartEdit={handleStartEdit}
						handleToggleStatus={handleToggleStatus}
						selectedJob={selectedJob}
						setDeleteDialogOpen={setDeleteDialogOpen}
						setDetailTab={setDetailTab}
					/>

					{/* ── Empty state ── */}
					{!createMode && !editMode && !selectedJob && (
						<Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
							<WorkOutlineOutlinedIcon sx={{ fontSize: 40, color: tokens.ink.faint }} />
							<Typography sx={{ fontSize: tokens.fontSize.body2, color: tokens.ink.subtle }}>{t('jobContent.selectJobToSeeDetails')}</Typography>
						</Box>
					)}
				</Box>
			</Box>

			{/* Delete confirmation */}
			<ConfirmDialog
				open={deleteDialogOpen}
				title={t('jobContent.deleteJobTitle')}
				cancelLabel={t('jobContent.cancel')}
				confirmLabel={t('jobContent.confirm')}
				onCancel={() => setDeleteDialogOpen(false)}
				onConfirm={handleDeleteJob}
				tone="danger"
			>
				{t('jobContent.deleteJobConfirmation')}
			</ConfirmDialog>
		</Box>
	);
};

export default JobContent;
