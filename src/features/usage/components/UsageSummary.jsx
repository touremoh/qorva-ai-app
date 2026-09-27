import PropTypes from 'prop-types';
import { Box, Paper, Tooltip, Typography } from '@mui/material';
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';
import { useTranslation } from 'react-i18next';
import UsageMeterCard from './UsageMeterCard.jsx';
import { paceStatus } from '../model/usage.js';
import * as tokens from '../../../theme/tokens.js';

/** Usage per allowance for the current billing period, against the plan's limits. */
const UsageSummary = ({ data, featureConfig, templateUsage }) => {
	const { t, i18n } = useTranslation();
	return (
		<Paper elevation={0} sx={{ border: `1px solid ${tokens.line.main}`, borderRadius: 2.5, p: 2.5 }}>
			<Box sx={{
				display: 'grid',
				gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
				gap: 2,
			}}>
				{featureConfig.map(({ key, label, icon, accent, bg }) => {
					const feature = data.features?.[key];
					if (!feature) return null;
					const forecast = data.forecast?.[key];
					const status = paceStatus(feature, forecast);
					return (
						<UsageMeterCard
							key={key}
							meterKey={key}
							label={label}
							icon={icon}
							accent={accent}
							bg={bg}
							consumed={feature.consumed ?? 0}
							limit={feature.limit}
							pace={status ? { status, limitReachedOn: forecast?.limitReachedOn } : null}
							periodEnd={data.currentPeriodEnd}
							footer={
								<Tooltip title={t('dashboard.usage.cumulativeTooltip', 'All-time total across all periods')} arrow placement="top">
									<Typography sx={{ fontSize: tokens.fontSize.caption, color: tokens.ink.subtle, cursor: 'default' }}>
										{(feature.cumulative ?? 0).toLocaleString(i18n.language)} {t('dashboard.usage.allTime', 'all-time')}
									</Typography>
								</Tooltip>
							}
						/>
					);
				})}

				{/* Email templates: static plan cap (saved count), not a per-period consumption metric */}
				{templateUsage && (
					<UsageMeterCard
						meterKey="emailTemplates"
						label={t('header.emailTemplates', 'Email Templates')}
						icon={MarkEmailReadOutlinedIcon}
						accent={tokens.status.warning.bright}
						bg="rgba(245,158,11,0.08)"
						consumed={templateUsage.count}
						limit={templateUsage.limit}
						noLimitLabel={t('dashboard.usage.unlimited', 'Unlimited')}
						footer={
							<Typography sx={{ fontSize: tokens.fontSize.caption, color: tokens.ink.subtle }}>
								{t('dashboard.usage.planAllowance', 'plan allowance')}
							</Typography>
						}
					/>
				)}
			</Box>

			{data.lastUpdatedAt && (
				<Typography sx={{ mt: 1.75, fontSize: tokens.fontSize.caption, color: tokens.ink.faint, textAlign: 'right' }}>
					{t('dashboard.usage.lastUpdated', 'Last updated')}: {new Date(data.lastUpdatedAt).toLocaleString(i18n.language)}
				</Typography>
			)}
		</Paper>
	);
};

UsageSummary.propTypes = {
	data: PropTypes.object.isRequired,
	featureConfig: PropTypes.arrayOf(PropTypes.object).isRequired,
	templateUsage: PropTypes.shape({ count: PropTypes.number, limit: PropTypes.number }),
};

export default UsageSummary;
