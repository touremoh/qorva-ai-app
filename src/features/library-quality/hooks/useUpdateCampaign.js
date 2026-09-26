import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getEmailTemplates } from '../../email-templates/api/emailTemplateService.js';
import { submitQualityJob } from '../api/libraryQualityService.js';

/**
 * The "request updates from candidates" flow: estimate for an issue, pick an invitation template,
 * then submit the campaign job and hand it to `trackJob`.
 */
export default function useUpdateCampaign(trackJob) {
	const { i18n } = useTranslation();
	const [busy, setBusy] = useState(false);
	const [campaignEstimate, setCampaignEstimate] = useState(null); // { issue, estimate }
	const [emailTemplates, setEmailTemplates] = useState([]);
	const [selectedTemplateId, setSelectedTemplateId] = useState(''); // '' = built-in Qorva message
	const [manageTemplatesOpen, setManageTemplatesOpen] = useState(false);

	const loadEmailTemplates = async () => {
		try {
			const res = await getEmailTemplates();
			const templates = (res.data?.data ?? res.data)?.templates ?? [];
			setEmailTemplates(templates);
			// Deselect a template that was deleted in the manage dialog.
			setSelectedTemplateId(prev => (prev && !templates.some(tpl => tpl.id === prev) ? '' : prev));
		} catch { /* picker falls back to the default message */ }
	};

	const handleCampaignRequest = async (issue) => {
		try {
			const res = await submitQualityJob('CANDIDATE_UPDATE_CAMPAIGN', issue.issueKey, true);
			const estimate = (res.data?.data ?? res.data)?.estimate;
			setCampaignEstimate({ issue, estimate });
			loadEmailTemplates();
		} catch (error) {
			console.error('Error estimating update campaign:', error);
		}
	};

	const handleCampaignConfirm = async () => {
		if (!campaignEstimate) return;
		setBusy(true);
		try {
			const language = (i18n.language || 'en').split('-')[0];
			const res = await submitQualityJob('CANDIDATE_UPDATE_CAMPAIGN', campaignEstimate.issue.issueKey, false, language,
				selectedTemplateId || undefined);
			const job = (res.data?.data ?? res.data)?.job;
			setCampaignEstimate(null);
			if (job) {
				trackJob(job);
			}
		} catch (error) {
			console.error('Error submitting update campaign:', error);
		} finally {
			setBusy(false);
		}
	};

	return {
		busy, campaignEstimate, setCampaignEstimate, emailTemplates, selectedTemplateId, setSelectedTemplateId,
		manageTemplatesOpen, setManageTemplatesOpen, loadEmailTemplates, handleCampaignRequest, handleCampaignConfirm,
	};
}
