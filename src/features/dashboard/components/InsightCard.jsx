import { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { TALENT_INSIGHT_LABEL_MAP } from '../model/dashboard.js';
import * as tokens from '../../../theme/tokens.js';

const InsightCard = ({ label, icon: Icon, accent, bg, items, t }) => {
	const sorted = useMemo(() => {
		const known = items.filter(i => i.name !== 'unknown').sort((a, b) => b.count - a.count);
		const unknown = items.filter(i => i.name === 'unknown');
		return [...known, ...unknown];
	}, [items]);

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
				<Box sx={{ width: 28, height: 28, borderRadius: 1.5, backgroundColor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
					<Icon sx={{ fontSize: 14, color: accent }} />
				</Box>
				<Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: tokens.ink.body }}>
					{label}
				</Typography>
			</Box>
			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.9 }}>
				{sorted.map(({ name, count, percentage }) => {
					const isUnknown = name === 'unknown';
					return (
						<Box key={name}>
							<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.35 }}>
								<Typography sx={{ fontSize: '0.69rem', color: isUnknown ? `${tokens.ink.subtle}` : `${tokens.ink.soft}`, fontWeight: isUnknown ? 400 : 500 }}>
									{t(`dashboard.talent.labels.${name}`, TALENT_INSIGHT_LABEL_MAP[name] ?? name)}
								</Typography>
								<Typography sx={{ fontSize: '0.69rem', color: isUnknown ? `${tokens.ink.subtle}` : `${tokens.ink.muted}`, fontWeight: 600 }}>
									{count} · {percentage.toFixed(1)}%
								</Typography>
							</Box>
							<Box sx={{ height: 5, backgroundColor: tokens.surface.muted, borderRadius: 4, overflow: 'hidden' }}>
								<Box sx={{
									height: '100%',
									width: `${percentage}%`,
									backgroundColor: isUnknown ? `${tokens.line.main}` : accent,
									borderRadius: 4,
									transition: 'width 0.6s ease',
									opacity: isUnknown ? 0.6 : 1,
								}} />
							</Box>
						</Box>
					);
				})}
			</Box>
		</Box>
	);
};
InsightCard.propTypes = {
	label: PropTypes.string.isRequired,
	icon: PropTypes.elementType.isRequired,
	accent: PropTypes.string.isRequired,
	bg: PropTypes.string.isRequired,
	items: PropTypes.arrayOf(PropTypes.shape({
		name: PropTypes.string,
		count: PropTypes.number,
		percentage: PropTypes.number,
	})).isRequired,
	t: PropTypes.func.isRequired,
};

export default InsightCard;
