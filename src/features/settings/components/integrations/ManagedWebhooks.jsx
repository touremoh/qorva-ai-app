import PropTypes from 'prop-types';
import { Box, Button, Typography } from '@mui/material';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import { useTranslation } from 'react-i18next';
import { BTN_GREEN_SX, GREEN } from '../../model/integrations.js';
import * as tokens from '../../../../theme/tokens.js';

/**
 * Status of webhooks Qorva registered itself. Success is one quiet line — there is nothing
 * for the tenant to do. Failure shows the provider's reason and a retry, because the usual
 * cause is fixable at their end (an API key created without the webhook permission).
 */
const ManagedWebhooks = ({ registered, error, busy, onRetry }) => {
	const { t } = useTranslation();
	if (registered) {
		return (
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
				<CheckCircleOutlineOutlinedIcon sx={{ fontSize: tokens.iconSize.sm, color: GREEN }} />
				<Typography sx={{ fontSize: tokens.fontSize.small, color: tokens.ink.soft }}>
					{t('atsIntegrations.guides.webhookManagedOk')}
				</Typography>
			</Box>
		);
	}
	return (
		<Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: 'rgba(217,119,6,0.06)', border: '1px solid rgba(217,119,6,0.25)' }}>
			<Typography sx={{ fontSize: tokens.fontSize.small, color: tokens.status.warning.text }}>
				{t('atsIntegrations.guides.webhookManagedFailed')}
			</Typography>
			{error && (
				<Typography sx={{ fontSize: tokens.fontSize.caption, color: tokens.status.warning.strong, mt: 0.5, wordBreak: 'break-word' }}>
					{error}
				</Typography>
			)}
			<Button size="small" variant="contained" disabled={busy} onClick={onRetry} sx={{ ...BTN_GREEN_SX, mt: 1 }}>
				{t('atsIntegrations.guides.webhookRetry')}
			</Button>
		</Box>
	);
};
ManagedWebhooks.propTypes = {
	registered: PropTypes.bool,
	error: PropTypes.string,
	busy: PropTypes.bool,
	onRetry: PropTypes.func.isRequired,
};

export default ManagedWebhooks;
