// eslint-disable-next-line no-unused-vars
import React from 'react';
import PropTypes from 'prop-types';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useTranslation } from 'react-i18next';
import EmailTemplatesManager from '../email-templates/EmailTemplatesManager.jsx';

/**
 * Quick access to template management from the campaign dialog. The full-page manager
 * lives in the "Email Templates" menu section; both share EmailTemplatesManager.
 */
const EmailTemplatesDialog = ({ open, onClose, language }) => {
	const { t } = useTranslation();

	return (
		<Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 2.5 } }}>
			<DialogTitle sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
				{t('emailTemplates.title', 'Invitation email templates')}
			</DialogTitle>
			<DialogContent sx={{ display: 'flex', flexDirection: 'column', minHeight: 460 }}>
				{open && <EmailTemplatesManager language={language} />}
			</DialogContent>
			<DialogActions sx={{ px: 2, pb: 1.5 }}>
				<Button onClick={onClose}
					sx={{ textTransform: 'none', color: '#64748b', borderRadius: 1.5 }}>
					{t('emailTemplates.close', 'Close')}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

EmailTemplatesDialog.propTypes = {
	open: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	language: PropTypes.string,
};

export default EmailTemplatesDialog;
