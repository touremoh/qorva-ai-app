import PropTypes from 'prop-types';
import { Box, Chip, Tooltip, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { formatUsageDate, PACE_TONE } from '../model/usage.js';
import * as tokens from '../../../theme/tokens.js';

const WARNING_BORDER = 'rgba(245,158,11,0.25)';
const WARNING_FILL = 'rgba(245,158,11,0.03)';

/**
 * One allowance: what it counts, how much is used against the limit, and where it is heading.
 * `meterKey` names the explanations under `usage.meters.<key>` and the anchor the AI summary scrolls to.
 */
const UsageMeterCard = ({ meterKey, label, icon: Icon, accent, bg, consumed, limit, pace, periodEnd, footer, noLimitLabel }) => {
	const { t, i18n } = useTranslation();
	const metered = limit != null;
	const pct = metered && limit > 0 ? Math.min(100, (consumed / limit) * 100) : 0;
	const isWarning = metered && pct >= 80;
	const tone = pace ? PACE_TONE[pace.status] : null;
	const details = t(`usage.meters.${meterKey}.details`, { defaultValue: '' });
	const atLimit = t(`usage.meters.${meterKey}.atLimit`, { defaultValue: '' });
	const paceLabel = pace && t(`usage.pace.${pace.status}`, {
		date: formatUsageDate(pace.status === 'REACHED' ? periodEnd : pace.limitReachedOn, i18n.language),
	});

	return (
		<Box id={`usage-meter-${meterKey}`} data-testid={`usage-meter-${meterKey}`} sx={{
			border: `1px solid ${isWarning ? WARNING_BORDER : tokens.surface.muted}`,
			borderRadius: 2, p: 2, display: 'flex', flexDirection: 'column', scrollMarginTop: 16,
			backgroundColor: isWarning ? WARNING_FILL : tokens.surface.coolWhite,
		}}>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
				<Box sx={{ width: 32, height: 32, borderRadius: 1.5, backgroundColor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
					<Icon sx={{ fontSize: tokens.iconSize.md, color: accent }} />
				</Box>
				<Typography sx={{ flex: 1, fontSize: tokens.fontSize.small, fontWeight: 600, color: tokens.ink.body, lineHeight: 1.3 }}>
					{label}
				</Typography>
				{(details || atLimit) && (
					<Tooltip arrow placement="top" title={<>{details}{details && atLimit ? ' ' : ''}{atLimit}</>}>
						<InfoOutlinedIcon aria-label={t('usage.howCounted', 'How is this counted?')} sx={{ fontSize: tokens.iconSize.sm, color: tokens.ink.faintest, cursor: 'help' }} />
					</Tooltip>
				)}
			</Box>

			<Typography sx={{ fontSize: tokens.fontSize.caption, color: tokens.ink.subtle, mb: 1.5, minHeight: '2.6em' }}>
				{t(`usage.meters.${meterKey}.what`)}
			</Typography>

			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1 }}>
				<Typography sx={{ fontSize: tokens.fontSize.xxl, fontWeight: 800, color: tokens.ink.strong, lineHeight: 1 }}>
					{consumed.toLocaleString(i18n.language)}
				</Typography>
				<Typography sx={{ fontSize: tokens.fontSize.caption, color: tokens.ink.subtle, fontWeight: 500 }}>
					{metered ? `/ ${limit.toLocaleString(i18n.language)}` : (noLimitLabel ?? t('usage.notMetered', 'Not metered'))}
				</Typography>
			</Box>

			{metered && (
				<>
					<Box sx={{ height: 7, backgroundColor: tokens.line.main, borderRadius: 4, overflow: 'hidden', mb: 0.75 }}>
						<Box sx={{
							height: '100%', width: `${pct}%`, borderRadius: 4, transition: 'width 0.6s ease',
							backgroundColor: isWarning ? tokens.status.warning.bright : accent,
						}} />
					</Box>
					<Typography sx={{ fontSize: tokens.fontSize.caption, fontWeight: 600, color: isWarning ? tokens.status.warning.strong : tokens.ink.muted }}>
						{pct.toFixed(1)}% {t('dashboard.usage.used', 'used')}
					</Typography>
				</>
			)}

			<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mt: 'auto', pt: 1.25, flexWrap: 'wrap' }}>
				{tone ? (
					<Chip size="small" label={paceLabel} data-testid={`usage-pace-${meterKey}`}
						sx={{ height: 22, fontSize: tokens.fontSize.micro, fontWeight: 700, color: tone.color, backgroundColor: tone.bg }} />
				) : <span />}
				{footer}
			</Box>
		</Box>
	);
};

UsageMeterCard.propTypes = {
	meterKey: PropTypes.string.isRequired,
	label: PropTypes.string.isRequired,
	icon: PropTypes.elementType.isRequired,
	accent: PropTypes.string.isRequired,
	bg: PropTypes.string.isRequired,
	consumed: PropTypes.number.isRequired,
	limit: PropTypes.number,
	pace: PropTypes.shape({ status: PropTypes.string.isRequired, limitReachedOn: PropTypes.string }),
	periodEnd: PropTypes.string,
	footer: PropTypes.node,
	/** Shown instead of "Not metered" when a missing limit means something else (e.g. unlimited templates). */
	noLimitLabel: PropTypes.string,
};

export default UsageMeterCard;
