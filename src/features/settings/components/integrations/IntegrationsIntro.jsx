import PropTypes from 'prop-types';
import { Box, Chip, Paper, Typography } from '@mui/material';
import CableOutlinedIcon from '@mui/icons-material/CableOutlined';
import { GREEN } from '../../model/integrations.js';
import { useTranslation } from 'react-i18next';

/** What ATS integrations do, and how many connections the plan allows. */
const IntegrationsIntro = ({ catalog, catalogFailed }) => {
	const { t } = useTranslation();
	return (
		<>
		<Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2.5, p: 2 }}>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
				<CableOutlinedIcon sx={{ fontSize: 16, color: GREEN }} />
				<Typography sx={{ fontSize: '0.82rem', color: '#475569', flex: 1 }}>
					{t('atsIntegrations.intro')}
				</Typography>
				<Chip size="small" label={`${catalog.usedConnections}/${catalog.maxConnections}`} sx={{ fontWeight: 700 }} />
			</Box>
			{!catalogFailed && catalog.maxConnections === 0 && (
				<Typography sx={{ fontSize: '0.78rem', color: '#d97706', mt: 1 }}>
					{t('atsIntegrations.planUpsell')}
				</Typography>
			)}
		</Paper>
		</>
	);
};

IntegrationsIntro.propTypes = {
	catalog: PropTypes.any,
	catalogFailed: PropTypes.any,
};

export default IntegrationsIntro;
