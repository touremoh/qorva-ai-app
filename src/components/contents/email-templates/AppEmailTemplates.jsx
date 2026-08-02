// eslint-disable-next-line no-unused-vars
import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';
import EmailTemplatesManager from './EmailTemplatesManager.jsx';

/** Dedicated menu section for managing candidate-update invitation email templates. */
const AppEmailTemplates = () => {
	const { t, i18n } = useTranslation();

	return (
		<Box sx={{ height: '100%', overflow: 'auto' }}>
			<Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2, minHeight: '100%' }}>
				<Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2.5, p: 2.5 }}>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
						<MarkEmailReadOutlinedIcon sx={{ fontSize: 18, color: '#629C44' }} />
						<Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
							{t('emailTemplates.pageTitle', 'Email Templates')}
						</Typography>
					</Box>
					<Typography sx={{ fontSize: '0.78rem', color: '#64748b' }}>
						{t('emailTemplates.pageSubtitle',
							'Craft the messages candidates receive when you request a profile update. Pick a template when launching an update campaign from Library Quality — or leave it unset to use the standard Qorva message.')}
					</Typography>
				</Paper>

				<Paper elevation={0} sx={{
					border: '1px solid #e2e8f0', borderRadius: 2.5, p: 2.5,
					display: 'flex', flexDirection: 'column', flex: 1, minHeight: 480,
				}}>
					<EmailTemplatesManager language={(i18n.language || 'en').split('-')[0]} />
				</Paper>
			</Box>
		</Box>
	);
};

export default AppEmailTemplates;
