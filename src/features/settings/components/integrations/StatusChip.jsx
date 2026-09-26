import PropTypes from 'prop-types';
import { Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { GREEN } from '../../model/integrations.js';

const StatusChip = ({ status }) => {
	const { t } = useTranslation();
	const byStatus = {
		CONNECTED: { color: GREEN, bg: 'rgba(98,156,68,0.1)', label: t('atsIntegrations.status.connected') },
		AUTH_ERROR: { color: '#dc2626', bg: 'rgba(220,38,38,0.08)', label: t('atsIntegrations.status.authError') },
		DISABLED: { color: '#64748b', bg: '#f1f5f9', label: t('atsIntegrations.status.disabled') },
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
