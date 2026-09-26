import PropTypes from 'prop-types';
import ConfirmDialog from '../../../shared/ui/ConfirmDialog.jsx';
import { Box, Button, DialogContentText, MenuItem, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';

/** Confirms emailing candidates an update link, with the invitation template to use. */
const CampaignConfirmDialog = ({ actionBusy, campaignEstimate, emailTemplates, handleCampaignConfirm, selectedTemplateId, setCampaignEstimate, setManageTemplatesOpen, setSelectedTemplateId }) => {
	const { t } = useTranslation();
	return (
		<>
		<ConfirmDialog
			open={Boolean(campaignEstimate)}
			title={t('libraryQuality.campaign.confirmTitle', 'Request updates from candidates')}
			cancelLabel={t('appCVContent.cancel')}
			confirmLabel={t('libraryQuality.campaign.confirmSend', 'Send requests')}
			onCancel={() => setCampaignEstimate(null)}
			onConfirm={handleCampaignConfirm}
			busy={actionBusy}
			confirmDisabled={(campaignEstimate?.estimate?.affectedCount ?? 0) === 0}
		>
			<DialogContentText sx={{ fontSize: '0.88rem', color: '#64748b' }}>
				{t('libraryQuality.campaign.confirmBody',
					'This will email up to {{count}} candidates a secure link to refresh their availability, salary expectations, and resume. Candidates without an email address, unsubscribed candidates, and those with a pending request are skipped automatically.',
					{ count: campaignEstimate?.estimate?.affectedCount ?? 0 })}
			</DialogContentText>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
				<TextField
					select fullWidth size="small"
					label={t('libraryQuality.campaign.template', 'Email template')}
					value={selectedTemplateId}
					onChange={(e) => setSelectedTemplateId(e.target.value)}
				>
					<MenuItem value="">
						{t('libraryQuality.campaign.defaultTemplate', 'Standard Qorva message')}
					</MenuItem>
					{emailTemplates.map((template) => (
						<MenuItem key={template.id} value={template.id}>{template.name}</MenuItem>
					))}
				</TextField>
				<Button
					size="small"
					onClick={() => setManageTemplatesOpen(true)}
					sx={{ textTransform: 'none', fontSize: '0.72rem', fontWeight: 600, color: '#629C44', flexShrink: 0 }}>
					{t('libraryQuality.campaign.manageTemplates', 'Manage…')}
				</Button>
			</Box>
		</ConfirmDialog>
		</>
	);
};

CampaignConfirmDialog.propTypes = {
	actionBusy: PropTypes.any,
	campaignEstimate: PropTypes.any,
	emailTemplates: PropTypes.any,
	handleCampaignConfirm: PropTypes.func,
	selectedTemplateId: PropTypes.any,
	setCampaignEstimate: PropTypes.func,
	setManageTemplatesOpen: PropTypes.func,
	setSelectedTemplateId: PropTypes.func,
};

export default CampaignConfirmDialog;
