import { useState, useEffect } from 'react';
import { Box, Typography, LinearProgress, Tooltip } from '@mui/material';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import { useTranslation } from 'react-i18next';
import { getUsageMonitoring } from '../../services/usageMonitoringService.js';
import { openUpgradeDialog } from '../../utils/demoMode.js';

// Demo report generation is bounded by the Starter-tier quota. This chip shows
// the remaining screening-actions usage from GET /usage-monitoring/current,
// which returns the UsageMonitoringDTO directly (NOT wrapped in { data }).
// When exhausted, generation returns 403 and this doubles as an upgrade CTA.
const QuotaIndicator = () => {
	const { t } = useTranslation();
	const [screening, setScreening] = useState(null);

	useEffect(() => {
		let active = true;
		getUsageMonitoring()
			.then((res) => {
				if (active) setScreening(res.data?.features?.screeningActions ?? null);
			})
			.catch(() => {
				if (active) setScreening(null);
			});
		return () => { active = false; };
	}, []);

	if (!screening) return null;

	const { limit = 0, consumed = 0 } = screening;
	const exhausted = limit > 0 && consumed >= limit;
	const pct = limit > 0 ? Math.min(100, (consumed / limit) * 100) : 0;

	return (
		<Tooltip title={exhausted ? t('demo.quotaExhaustedTooltip', 'Report quota reached — upgrade for unlimited reports') : ''}>
			<Box
				onClick={exhausted ? () => openUpgradeDialog('quota') : undefined}
				sx={{
					display: 'flex', alignItems: 'center', gap: 1,
					px: 1.25, py: 0.6, borderRadius: 1.5,
					border: '1px solid',
					borderColor: exhausted ? 'rgba(220,38,38,0.35)' : 'rgba(98,156,68,0.3)',
					backgroundColor: exhausted ? 'rgba(220,38,38,0.05)' : 'rgba(98,156,68,0.05)',
					cursor: exhausted ? 'pointer' : 'default',
					minWidth: 150,
				}}
			>
				<BoltOutlinedIcon sx={{ fontSize: 16, color: exhausted ? '#dc2626' : '#629C44' }} />
				<Box sx={{ flex: 1, minWidth: 0 }}>
					<Typography sx={{ fontSize: '0.68rem', fontWeight: 600, color: exhausted ? '#991b1b' : '#166534', lineHeight: 1.2 }}>
						{t('demo.reportsQuota', 'Demo reports')}: {consumed}/{limit}
					</Typography>
					<LinearProgress
						variant="determinate"
						value={pct}
						sx={{
							mt: 0.4, height: 4, borderRadius: 3,
							backgroundColor: exhausted ? 'rgba(220,38,38,0.15)' : 'rgba(98,156,68,0.15)',
							'& .MuiLinearProgress-bar': {
								borderRadius: 3,
								backgroundColor: exhausted ? '#dc2626' : '#629C44',
							},
						}}
					/>
				</Box>
			</Box>
		</Tooltip>
	);
};

export default QuotaIndicator;
