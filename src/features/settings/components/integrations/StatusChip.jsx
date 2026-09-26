import PropTypes from 'prop-types';
import { Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { GREEN } from '../../model/integrations.js';
import * as tokens from '../../../../theme/tokens.js';
import { alpha } from '@mui/material/styles';

const StatusChip = ({ status }) => {
	const { t } = useTranslation();
	const byStatus = {
		CONNECTED: { color: GREEN, bg: alpha(tokens.brand.main, 0.1), label: t('atsIntegrations.status.connected') },
		AUTH_ERROR: { color: tokens.status.error.main, bg: 'rgba(220,38,38,0.08)', label: t('atsIntegrations.status.authError') },
		DISABLED: { color: tokens.ink.muted, bg: tokens.surface.muted, label: t('atsIntegrations.status.disabled') },
	};
	const s = byStatus[status];
	if (!s) return null;
	return (
		<Chip size="small" label={s.label} sx={{
			height: 20, fontSize: '0.65rem', fontWeight: 700, color: s.color, backgroundColor: s.bg,
		}} />
	);
};
StatusChip.propTypes = {
	status: PropTypes.string,
};

export default StatusChip;
