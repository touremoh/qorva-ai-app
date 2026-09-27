import PropTypes from 'prop-types';
import { Box, Button, Chip, Paper, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import { hasPermission } from '../../../shared/lib/session.js';
import { isDemoUser } from '../../../utils/demoMode.js';
import { daysUntil, formatUsageDate } from '../model/usage.js';
import * as tokens from '../../../theme/tokens.js';

/** The plan this usage is measured against: tier, billing cycle, period, and why the page matters. */
const UsagePlanHeader = ({ data }) => {
	const { t, i18n } = useTranslation();
	const navigate = useNavigate();
	const tier = data.subscriptionTier || t('usage.plan.unknownTier', 'Current plan');
	const demo = isDemoUser();
	const daysLeft = daysUntil(data.currentPeriodEnd);

	return (
		<Paper elevation={0} data-testid="usage-plan" sx={{ border: `1px solid ${tokens.line.main}`, borderRadius: 2.5, p: 2.5, height: '100%', boxSizing: 'border-box' }}>
			<Typography sx={{ fontSize: tokens.fontSize.caption, fontWeight: 700, color: tokens.ink.muted, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
				{t('usage.plan.label', 'Your plan')}
			</Typography>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mt: 0.75 }}>
				<Chip
					icon={<WorkspacePremiumOutlinedIcon sx={{ fontSize: tokens.iconSize.sm }} />}
					label={demo ? t('usage.plan.demo', 'Demo account · {{tier}} limits', { tier }) : tier}
					sx={{ fontWeight: 700, fontSize: tokens.fontSize.small, color: tokens.brand.text, backgroundColor: tokens.brand.tint, '& .MuiChip-icon': { color: tokens.brand.text } }}
				/>
				{data.billingCycle && (
					<Typography sx={{ fontSize: tokens.fontSize.caption, color: tokens.ink.subtle }}>
						{t(`usage.plan.cycle.${data.billingCycle}`, data.billingCycle)}
					</Typography>
				)}
			</Box>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 1.25, flexWrap: 'wrap' }}>
				<CalendarTodayOutlinedIcon sx={{ fontSize: tokens.iconSize.xs, color: tokens.ink.subtle }} />
				<Typography sx={{ fontSize: tokens.fontSize.caption, color: tokens.ink.body, fontWeight: 500 }}>
					{t('usage.plan.period', '{{start}} – {{end}}', {
						start: formatUsageDate(data.currentPeriodStart, i18n.language),
						end: formatUsageDate(data.currentPeriodEnd, i18n.language),
					})}
				</Typography>
				<Typography sx={{ fontSize: tokens.fontSize.caption, color: tokens.ink.subtle }}>
					· {t('usage.plan.daysLeft', '{{count}} days left', { count: daysLeft })}
				</Typography>
			</Box>
			<Typography sx={{ fontSize: tokens.fontSize.body2, color: tokens.ink.body, mt: 1.5, lineHeight: 1.55 }}>
				{t('usage.plan.purpose', 'Your plan includes an allowance of AI work for each billing period. Here is how much you have used, what each number counts, and what happens at the limit.')}
			</Typography>
			{!demo && hasPermission('UPDATE_SUBSCRIPTION') && (
				<Button
					size="small"
					onClick={() => navigate('/app/settings?tab=billing')}
					sx={{ mt: 1.25, px: 0, textTransform: 'none', fontWeight: 600, color: tokens.brand.text }}
				>
					{t('usage.plan.managePlan', 'Manage plan')}
				</Button>
			)}
		</Paper>
	);
};

UsagePlanHeader.propTypes = {
	data: PropTypes.shape({
		subscriptionTier: PropTypes.string,
		billingCycle: PropTypes.string,
		currentPeriodStart: PropTypes.string,
		currentPeriodEnd: PropTypes.string,
	}).isRequired,
};

export default UsagePlanHeader;
