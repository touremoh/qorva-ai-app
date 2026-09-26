import PropTypes from 'prop-types';
import SectionHeader from '../../../shared/ui/SectionHeader.jsx';
import { Box, Paper, Typography } from '@mui/material';
import { PieChart } from '@mui/x-charts';
import ChecklistOutlinedIcon from '@mui/icons-material/ChecklistOutlined';
import UpdateOutlinedIcon from '@mui/icons-material/UpdateOutlined';
import Meter from './Meter.jsx';
import { FRESHNESS_COLORS, COMPLETENESS_GROUPS, FIELD_LABELS } from '../model/libraryQuality.js';
import { useTranslation } from 'react-i18next';
import * as tokens from '../../../theme/tokens.js';

/** Field completeness bars next to the resume-age breakdown. */
const CompletenessFreshnessRow = ({ completenessMetrics, freshnessMetrics, freshnessPieData }) => {
	const { t } = useTranslation();
	return (
		<>
		<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 2 }}>
			<Paper elevation={0} sx={{ border: `1px solid ${tokens.line.main}`, borderRadius: 2.5, p: 2.5 }}>
				<SectionHeader sx={{ pb: 1.5 }} icon={ChecklistOutlinedIcon} label={t('libraryQuality.sections.completeness', 'Field Completeness')} />
				<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 3 }}>
					{COMPLETENESS_GROUPS.map(({ key, fields }) => (
						<Box key={key} sx={{ display: 'flex', flexDirection: 'column', gap: 0.9 }}>
							<Typography sx={{ fontSize: tokens.fontSize.caption, fontWeight: 700, color: tokens.ink.subtle, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
								{t(`libraryQuality.groups.${key}`, key)}
							</Typography>
							{fields.map((field) => {
								const metric = completenessMetrics[field];
								if (!metric) return null;
								return (
									<Meter
										key={field}
										label={t(`libraryQuality.fields.${field}`, FIELD_LABELS[field] ?? field)}
										count={metric.count}
										percentage={metric.percentage}
										accent={metric.percentage >= 70 ? `${tokens.brand.main}` : metric.percentage >= 40 ? `${tokens.status.warning.bright}` : `${tokens.status.error.main}`}
									/>
								);
							})}
						</Box>
					))}
				</Box>
			</Paper>

			<Paper elevation={0} sx={{ border: `1px solid ${tokens.line.main}`, borderRadius: 2.5, p: 2.5 }}>
				<SectionHeader sx={{ pb: 1.5 }} icon={UpdateOutlinedIcon} label={t('libraryQuality.sections.freshness', 'Content Freshness')} />
				<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
					<PieChart
						series={[{ data: freshnessPieData, innerRadius: 38, outerRadius: 68, paddingAngle: 2, cornerRadius: 3 }]}
						width={200}
						height={160}
						margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
						slotProps={{ legend: { hidden: true } }}
					/>
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6, mt: 1.5, width: '100%' }}>
						{Object.entries(FRESHNESS_COLORS).map(([bucket, color]) => {
							const metric = freshnessMetrics[bucket];
							if (!metric || metric.count === 0) return null;
							return (
								<Box key={bucket} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
									<Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: color, flexShrink: 0 }} />
									<Typography sx={{ flex: 1, fontSize: tokens.fontSize.caption, color: tokens.ink.soft }}>
										{t(`libraryQuality.buckets.${bucket}`, bucket)}
									</Typography>
									<Typography sx={{ fontSize: tokens.fontSize.caption, color: tokens.ink.muted, fontWeight: 600 }}>
										{metric.count} · {Number(metric.percentage).toFixed(1)}%
									</Typography>
								</Box>
							);
						})}
					</Box>
				</Box>
			</Paper>
		</Box>
		</>
	);
};

CompletenessFreshnessRow.propTypes = {
	completenessMetrics: PropTypes.any,
	freshnessMetrics: PropTypes.any,
	freshnessPieData: PropTypes.any,
};

export default CompletenessFreshnessRow;
