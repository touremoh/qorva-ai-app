// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from 'react';
import {
	Alert,
	Box,
	Button,
	CircularProgress,
	Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import {
	performQualityAction,
	dismissQualityIssue,
	reopenQualityIssue,
	submitQualityJob,
	cancelQualityJob,
} from '../api/libraryQualityService.js';
import EmailTemplatesDialog from '../../email-templates/components/EmailTemplatesDialog.jsx';
import { scoreColor, FRESHNESS_COLORS, healthVerdict } from '../model/libraryQuality.js';
import ArchiveAllConfirmDialog from './ArchiveAllConfirmDialog.jsx';
import ReanalyzeConfirmDialog from './ReanalyzeConfirmDialog.jsx';
import CampaignConfirmDialog from './CampaignConfirmDialog.jsx';
import IssuesPanel from './IssuesPanel.jsx';
import JobProgressPanel from './JobProgressPanel.jsx';
import CompletenessFreshnessRow from './CompletenessFreshnessRow.jsx';
import DimensionGrid from './DimensionGrid.jsx';
import HealthBanner from './HealthBanner.jsx';
import useQualityReport from '../hooks/useQualityReport.js';
import useQualityJob from '../hooks/useQualityJob.js';
import useUpdateCampaign from '../hooks/useUpdateCampaign.js';
import * as tokens from '../../../theme/tokens.js';

const AppLibraryQuality = () => {
	const { t, i18n } = useTranslation();
	const { report, loading, error, fetchReport } = useQualityReport();
	const { activeJob, setActiveJob, trackJob } = useQualityJob(() => fetchReport());
	const [expandedIssue, setExpandedIssue] = useState(null);



	const metricsByName = (dimension) =>
		Object.fromEntries((dimension?.metrics ?? []).map((m) => [m.name, m]));

	const handleIssueAction = (issue) => {
		setExpandedIssue((prev) => (prev === issue.issueKey ? null : issue.issueKey));
	};

	const [archiveConfirm, setArchiveConfirm] = useState(null); // issue pending "archive all" confirmation
	const [actionBusy, setActionBusy] = useState(false);
	const [reanalyzeEstimate, setReanalyzeEstimate] = useState(null); // { issue, estimate }


	const handleReanalyzeRequest = async (issue) => {
		try {
			const res = await submitQualityJob('REANALYZE', issue.issueKey, true);
			const estimate = (res.data?.data ?? res.data)?.estimate;
			setReanalyzeEstimate({ issue, estimate });
		} catch (error) {
			console.error('Error estimating re-analysis:', error);
		}
	};

	const handleReanalyzeConfirm = async () => {
		if (!reanalyzeEstimate) return;
		setActionBusy(true);
		try {
			const res = await submitQualityJob('REANALYZE', reanalyzeEstimate.issue.issueKey, false);
			const job = (res.data?.data ?? res.data)?.job;
			setReanalyzeEstimate(null);
			if (job) {
				trackJob(job);
			}
		} catch (error) {
			console.error('Error submitting re-analysis job:', error);
		} finally {
			setActionBusy(false);
		}
	};

	const campaign = useUpdateCampaign(trackJob);


	const handleCancelJob = async () => {
		if (!activeJob) return;
		try {
			const res = await cancelQualityJob(activeJob.id);
			setActiveJob(res.data?.data ?? res.data);
			await fetchReport();
		} catch (error) {
			console.error('Error cancelling job:', error);
		}
	};

	const handleArchiveAll = async () => {
		if (!archiveConfirm) return;
		setActionBusy(true);
		try {
			await performQualityAction('ARCHIVE', { issueKey: archiveConfirm.issueKey });
			setArchiveConfirm(null);
			await fetchReport();
		} catch (error) {
			console.error('Error archiving resumes:', error);
		} finally {
			setActionBusy(false);
		}
	};

	const handleDismissToggle = async (issue) => {
		try {
			if (issue.dismissed) await reopenQualityIssue(issue.issueKey);
			else await dismissQualityIssue(issue.issueKey);
			await fetchReport();
		} catch (error) {
			console.error('Error updating issue state:', error);
		}
	};

	if (loading) {
		return (
			<Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
				<CircularProgress size={28} />
			</Box>
		);
	}

	if (error) {
		return (
			<Box sx={{ p: 3 }}>
				<Alert severity="error" action={
					<Button color="inherit" size="small" onClick={fetchReport}>
						{t('libraryQuality.retry', 'Retry')}
					</Button>
				}>{error}</Alert>
			</Box>
		);
	}

	if (report.totalCVs === 0) {
		return (
			<Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1.5, p: 3 }}>
				<FactCheckOutlinedIcon sx={{ fontSize: 44, color: tokens.ink.faint }} />
				<Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: tokens.ink.body }}>
					{t('libraryQuality.empty.title', 'No resumes yet')}
				</Typography>
				<Typography sx={{ fontSize: '0.8rem', color: tokens.ink.muted, textAlign: 'center', maxWidth: 380 }}>
					{t('libraryQuality.empty.subtitle', 'Upload resumes to your library to see its health score and get improvement suggestions.')}
				</Typography>
			</Box>
		);
	}

	const overall = report.overallScore ?? 0;
	const overallColors = scoreColor(overall);
	const verdict = healthVerdict(report, t);


	const completenessMetrics = metricsByName(report.completeness);
	const freshnessMetrics = metricsByName(report.freshness);
	const uniquenessMetrics = metricsByName(report.uniqueness);
	const confidenceMetrics = metricsByName(report.parseConfidence);

	const freshnessPieData = Object.entries(FRESHNESS_COLORS)
		.map(([bucket, color], i) => ({
			id: i,
			label: t(`libraryQuality.buckets.${bucket}`, bucket),
			value: freshnessMetrics[bucket]?.count ?? 0,
			color,
		}))
		.filter((d) => d.value > 0);

	return (
		<Box sx={{ height: '100%', overflow: 'auto' }}>
		<Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>

			{/* Headline banner: overall health gauge + verdict */}
			<HealthBanner
				overall={overall}
				overallColors={overallColors}
				report={report}
				verdict={verdict}
			/>

			{/* Dimension cards */}
			<DimensionGrid confidenceMetrics={confidenceMetrics} report={report} uniquenessMetrics={uniquenessMetrics} />

			{/* Completeness + freshness detail */}
			<CompletenessFreshnessRow completenessMetrics={completenessMetrics} freshnessMetrics={freshnessMetrics} freshnessPieData={freshnessPieData} />

			{/* Background job progress */}
			<JobProgressPanel activeJob={activeJob} handleCancelJob={handleCancelJob} />

			{/* Issues */}
			<IssuesPanel
				activeJob={activeJob}
				expandedIssue={expandedIssue}
				fetchReport={fetchReport}
				handleCampaignRequest={campaign.handleCampaignRequest}
				handleDismissToggle={handleDismissToggle}
				handleIssueAction={handleIssueAction}
				handleReanalyzeRequest={handleReanalyzeRequest}
				report={report}
				setArchiveConfirm={setArchiveConfirm}
			/>
		</Box>

		{/* Candidate-update campaign confirmation */}
		<CampaignConfirmDialog
			actionBusy={campaign.busy}
			campaignEstimate={campaign.campaignEstimate}
			emailTemplates={campaign.emailTemplates}
			handleCampaignConfirm={campaign.handleCampaignConfirm}
			selectedTemplateId={campaign.selectedTemplateId}
			setCampaignEstimate={campaign.setCampaignEstimate}
			setManageTemplatesOpen={campaign.setManageTemplatesOpen}
			setSelectedTemplateId={campaign.setSelectedTemplateId}
		/>

		{/* Re-analyze pre-flight confirmation */}
		<ReanalyzeConfirmDialog
			actionBusy={actionBusy}
			handleReanalyzeConfirm={handleReanalyzeConfirm}
			reanalyzeEstimate={reanalyzeEstimate}
			setReanalyzeEstimate={setReanalyzeEstimate}
		/>

		{/* Invitation email template management */}
		<EmailTemplatesDialog
			open={campaign.manageTemplatesOpen}
			onClose={() => { campaign.setManageTemplatesOpen(false); campaign.loadEmailTemplates(); }}
			language={(i18n.language || 'en').split('-')[0]}
		/>

		{/* Archive-all confirmation */}
		<ArchiveAllConfirmDialog
			actionBusy={actionBusy}
			archiveConfirm={archiveConfirm}
			handleArchiveAll={handleArchiveAll}
			setArchiveConfirm={setArchiveConfirm}
		/>
		</Box>
	);
};

export default AppLibraryQuality;
