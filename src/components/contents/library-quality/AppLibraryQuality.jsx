// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
	Alert,
	Box,
	Button,
	Chip,
	CircularProgress,
	Collapse,
	Paper,
	Typography,
} from '@mui/material';
import { PieChart } from '@mui/x-charts';
import { useTranslation } from 'react-i18next';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import ChecklistOutlinedIcon from '@mui/icons-material/ChecklistOutlined';
import UpdateOutlinedIcon from '@mui/icons-material/UpdateOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import { getLibraryQuality } from '../../../services/libraryQualityService.js';
import QualityIssueList from './QualityIssueList.jsx';
import QualityDuplicatesList from './QualityDuplicatesList.jsx';

const initialReport = {
	totalCVs: 0,
	overallScore: null,
	completeness: { score: 0, metrics: [] },
	freshness: { score: 0, metrics: [] },
	uniqueness: { score: 0, metrics: [] },
	parseConfidence: { score: 0, metrics: [] },
	issues: [],
};

const scoreColor = (score) => {
	if (score >= 70) return { color: '#166534', bg: '#dcfce7', accent: '#629C44' };
	if (score >= 40) return { color: '#854d0e', bg: '#fef9c3', accent: '#f59e0b' };
	return { color: '#991b1b', bg: '#fee2e2', accent: '#dc2626' };
};

const SEVERITY_CHIP = {
	CRITICAL: { color: '#991b1b', bg: '#fee2e2' },
	HIGH: { color: '#854d0e', bg: '#fef9c3' },
	MEDIUM: { color: '#475569', bg: '#f1f5f9' },
};

const FRESHNESS_COLORS = {
	UP_TO_DATE: '#629C44',
	REVIEW_SUGGESTED: '#f59e0b',
	OUTDATED: '#dc2626',
	UNKNOWN: '#94a3b8',
};

const COMPLETENESS_GROUPS = [
	{ key: 'critical', fields: ['email', 'phone', 'name', 'role'] },
	{ key: 'important', fields: ['workExperience', 'keySkills', 'careerStartYear', 'education'] },
	{ key: 'enrichment', fields: ['languages', 'certifications', 'salaryExpectation', 'linkedin', 'summary'] },
];

const FIELD_LABELS = {
	email: 'Email', phone: 'Phone', name: 'Name', role: 'Role',
	workExperience: 'Work Experience', keySkills: 'Key Skills', careerStartYear: 'Career Start Year',
	education: 'Education', languages: 'Languages', certifications: 'Certifications',
	salaryExpectation: 'Salary Expectation', linkedin: 'LinkedIn', summary: 'Summary',
};

const SectionHeader = ({ icon: Icon, label, right }) => (
	<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, pb: 1.5, borderBottom: '2px solid #629C44', flexShrink: 0 }}>
		<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
			<Icon sx={{ fontSize: 15, color: '#629C44' }} />
			<Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#629C44', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
				{label}
			</Typography>
		</Box>
		{right}
	</Box>
);

SectionHeader.propTypes = {
	icon: PropTypes.elementType.isRequired,
	label: PropTypes.string.isRequired,
	right: PropTypes.node,
};

const ScoreBadge = ({ score }) => {
	const { color, bg } = scoreColor(score);
	return (
		<Box sx={{ px: 1, py: 0.2, borderRadius: 1.5, backgroundColor: bg, color, fontSize: '0.8rem', fontWeight: 800, lineHeight: 1.6, flexShrink: 0 }}>
			{score}
		</Box>
	);
};

ScoreBadge.propTypes = {
	score: PropTypes.number.isRequired,
};

const DimensionCard = ({ label, score, icon: Icon, accent, bg, children }) => (
	<Paper elevation={0} sx={{
		border: '1px solid #e2e8f0',
		borderLeft: `3px solid ${accent}`,
		borderRadius: 2.5, p: 2,
		display: 'flex', flexDirection: 'column', gap: 1.25, minWidth: 0,
	}}>
		<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
				<Box sx={{ width: 32, height: 32, borderRadius: 1.5, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: bg }}>
					<Icon sx={{ fontSize: 16, color: accent }} />
				</Box>
				<Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155' }}>{label}</Typography>
			</Box>
			<ScoreBadge score={score} />
		</Box>
		{children}
	</Paper>
);

DimensionCard.propTypes = {
	label: PropTypes.string.isRequired,
	score: PropTypes.number.isRequired,
	icon: PropTypes.elementType.isRequired,
	accent: PropTypes.string.isRequired,
	bg: PropTypes.string.isRequired,
	children: PropTypes.node,
};

const Meter = ({ label, count, percentage, accent }) => (
	<Box>
		<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.35 }}>
			<Typography sx={{ fontSize: '0.69rem', color: '#475569', fontWeight: 500 }}>{label}</Typography>
			<Typography sx={{ fontSize: '0.69rem', color: '#64748b', fontWeight: 600 }}>
				{count} · {Number(percentage).toFixed(1)}%
			</Typography>
		</Box>
		<Box sx={{ height: 5, backgroundColor: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
			<Box sx={{ height: '100%', width: `${percentage}%`, backgroundColor: accent, borderRadius: 4, transition: 'width 0.6s ease' }} />
		</Box>
	</Box>
);

Meter.propTypes = {
	label: PropTypes.string.isRequired,
	count: PropTypes.number.isRequired,
	percentage: PropTypes.number.isRequired,
	accent: PropTypes.string.isRequired,
};

const AppLibraryQuality = () => {
	const { t } = useTranslation();
	const [report, setReport] = useState(initialReport);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [expandedIssue, setExpandedIssue] = useState(null);

	const fetchReport = async () => {
		setLoading(true);
		setError('');
		try {
			const res = await getLibraryQuality();
			const data = res.data?.data ?? res.data ?? {};
			setReport({
				...initialReport,
				...data,
				completeness: data.completeness ?? initialReport.completeness,
				freshness: data.freshness ?? initialReport.freshness,
				uniqueness: data.uniqueness ?? initialReport.uniqueness,
				parseConfidence: data.parseConfidence ?? initialReport.parseConfidence,
				issues: Array.isArray(data.issues) ? data.issues : [],
			});
		} catch {
			setError(t('libraryQuality.error', 'Could not load the library quality report. Please try again.'));
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchReport();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const metricsByName = (dimension) =>
		Object.fromEntries((dimension?.metrics ?? []).map((m) => [m.name, m]));

	const handleIssueAction = (issue) => {
		setExpandedIssue((prev) => (prev === issue.issueKey ? null : issue.issueKey));
	};

	if (loading) {
		return (
			<Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
				<CircularProgress size={28} />
			</Box>
		);
	}

	if (error) {
		return (
			<Box sx={{ p: 3 }}>
				<Alert severity="error" action={
					<Button color="inherit" size="small" onClick={fetchReport}>
						{t('libraryQuality.retry', 'Retry')}
					</Button>
				}>{error}</Alert>
			</Box>
		);
	}

	if (report.totalCVs === 0) {
		return (
			<Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1.5, p: 3 }}>
				<FactCheckOutlinedIcon sx={{ fontSize: 44, color: '#cbd5e1' }} />
				<Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: '#334155' }}>
					{t('libraryQuality.empty.title', 'No resumes yet')}
				</Typography>
				<Typography sx={{ fontSize: '0.8rem', color: '#64748b', textAlign: 'center', maxWidth: 380 }}>
					{t('libraryQuality.empty.subtitle', 'Upload resumes to your library to see its health score and get improvement suggestions.')}
				</Typography>
			</Box>
		);
	}

	const overall = report.overallScore ?? 0;
	const overallColors = scoreColor(overall);

	const dimensions = [
		{ key: 'completeness', score: report.completeness.score },
		{ key: 'freshness', score: report.freshness.score },
		{ key: 'uniqueness', score: report.uniqueness.score },
		{ key: 'parseConfidence', score: report.parseConfidence.score },
	];
	const weakest = dimensions.reduce((a, b) => (b.score < a.score ? b : a));
	const rating = t(`libraryQuality.verdict.${overall >= 85 ? 'excellent' : overall >= 70 ? 'good' : overall >= 40 ? 'fair' : 'poor'}`);
	const verdict = weakest.score < 70 && weakest.score <= overall - 10
		? t('libraryQuality.verdict.drag', '{{rating}} — {{dimension}} is dragging your score down.', {
			rating, dimension: t(`libraryQuality.dimensions.${weakest.key}`) })
		: t('libraryQuality.verdict.healthy', '{{rating}} — all dimensions look healthy.', { rating });

	const completenessMetrics = metricsByName(report.completeness);
	const freshnessMetrics = metricsByName(report.freshness);
	const uniquenessMetrics = metricsByName(report.uniqueness);
	const confidenceMetrics = metricsByName(report.parseConfidence);

	const freshnessPieData = Object.entries(FRESHNESS_COLORS)
		.map(([bucket, color], i) => ({
			id: i,
			label: t(`libraryQuality.buckets.${bucket}`, bucket),
			value: freshnessMetrics[bucket]?.count ?? 0,
			color,
		}))
		.filter((d) => d.value > 0);

	return (
		<Box sx={{ height: '100%', overflow: 'auto' }}>
		<Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>

			{/* Headline banner: overall health gauge + verdict */}
			<Paper elevation={0} sx={{
				border: '1px solid #e2e8f0', borderRadius: 2.5, p: 2.5,
				display: 'flex', alignItems: 'center', gap: 2.5, flexWrap: 'wrap',
			}}>
				<Box sx={{
					width: 86, height: 86, borderRadius: '50%', flexShrink: 0,
					backgroundColor: overallColors.bg,
					display: 'flex', alignItems: 'center', justifyContent: 'center',
					border: `3px solid ${overallColors.accent}`,
				}}>
					<Typography sx={{ fontSize: '1.7rem', fontWeight: 800, color: overallColors.color, lineHeight: 1 }}>
						{overall}
					</Typography>
				</Box>
				<Box sx={{ minWidth: 0 }}>
					<Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
						{t('libraryQuality.overall', 'Library Health')}
					</Typography>
					<Typography sx={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', mt: 0.25 }}>
						{verdict}
					</Typography>
					<Typography sx={{ fontSize: '0.72rem', color: '#94a3b8', mt: 0.25 }}>
						{t('libraryQuality.totalCVs', '{{count}} resumes analyzed', { count: report.totalCVs })}
					</Typography>
				</Box>
			</Paper>

			{/* Dimension cards */}
			<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2 }}>
				<DimensionCard
					label={t('libraryQuality.dimensions.completeness', 'Completeness')}
					score={report.completeness.score}
					icon={ChecklistOutlinedIcon} accent="#3b82f6" bg="rgba(59,130,246,0.08)">
					<Typography sx={{ fontSize: '0.68rem', color: '#64748b' }}>
						{t('libraryQuality.dimensions.completenessHint', 'Contact details and profile data present on your resumes.')}
					</Typography>
				</DimensionCard>

				<DimensionCard
					label={t('libraryQuality.dimensions.freshness', 'Freshness')}
					score={report.freshness.score}
					icon={UpdateOutlinedIcon} accent="#629C44" bg="rgba(98,156,68,0.08)">
					<Typography sx={{ fontSize: '0.68rem', color: '#64748b' }}>
						{t('libraryQuality.dimensions.freshnessHint', 'How current the resume content actually is.')}
					</Typography>
				</DimensionCard>

				<DimensionCard
					label={t('libraryQuality.dimensions.uniqueness', 'Uniqueness')}
					score={report.uniqueness.score}
					icon={ContentCopyOutlinedIcon} accent="#8b5cf6" bg="rgba(139,92,246,0.08)">
					<Typography sx={{ fontSize: '0.68rem', color: '#64748b' }}>
						{t('libraryQuality.dimensions.uniquenessHint', '{{count}} duplicate groups detected.', { count: uniquenessMetrics.duplicateGroups?.count ?? 0 })}
					</Typography>
				</DimensionCard>

				<DimensionCard
					label={t('libraryQuality.dimensions.parseConfidence', 'AI Confidence')}
					score={report.parseConfidence.score}
					icon={PsychologyOutlinedIcon} accent="#f59e0b" bg="rgba(245,158,11,0.08)">
					<Typography sx={{ fontSize: '0.68rem', color: '#64748b' }}>
						{t('libraryQuality.dimensions.parseConfidenceHint', '{{count}} resumes need review.', { count: (confidenceMetrics.lowConfidence?.count ?? 0) + (confidenceMetrics.missingAnalysis?.count ?? 0) })}
					</Typography>
				</DimensionCard>
			</Box>

			{/* Completeness + freshness detail */}
			<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 2 }}>
				<Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2.5, p: 2.5 }}>
					<SectionHeader icon={ChecklistOutlinedIcon} label={t('libraryQuality.sections.completeness', 'Field Completeness')} />
					<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 3 }}>
						{COMPLETENESS_GROUPS.map(({ key, fields }) => (
							<Box key={key} sx={{ display: 'flex', flexDirection: 'column', gap: 0.9 }}>
								<Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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
											accent={metric.percentage >= 70 ? '#629C44' : metric.percentage >= 40 ? '#f59e0b' : '#dc2626'}
										/>
									);
								})}
							</Box>
						))}
					</Box>
				</Paper>

				<Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2.5, p: 2.5 }}>
					<SectionHeader icon={UpdateOutlinedIcon} label={t('libraryQuality.sections.freshness', 'Content Freshness')} />
					<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
										<Typography sx={{ flex: 1, fontSize: '0.72rem', color: '#475569' }}>
											{t(`libraryQuality.buckets.${bucket}`, bucket)}
										</Typography>
										<Typography sx={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
											{metric.count} · {Number(metric.percentage).toFixed(1)}%
										</Typography>
									</Box>
								);
							})}
						</Box>
					</Box>
				</Paper>
			</Box>

			{/* Issues */}
			<Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2.5, p: 2.5 }}>
				<SectionHeader icon={ReportProblemOutlinedIcon} label={t('libraryQuality.sections.issues', 'Issues To Fix')} />
				{report.issues.length === 0 ? (
					<Typography sx={{ fontSize: '0.8rem', color: '#629C44', fontWeight: 600 }}>
						{t('libraryQuality.noIssues', 'No issues found — your library is in great shape!')}
					</Typography>
				) : (
					<Box sx={{ display: 'flex', flexDirection: 'column' }}>
						{report.issues.map((issue, index) => {
							const chip = SEVERITY_CHIP[issue.severity] ?? SEVERITY_CHIP.MEDIUM;
							const isDuplicates = issue.issueKey === 'DUPLICATES';
							const isExpanded = expandedIssue === issue.issueKey;
							return (
								<Box key={issue.issueKey} sx={{ borderBottom: index < report.issues.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, py: 1.1 }}>
										<Chip
											label={t(`libraryQuality.severity.${issue.severity}`, issue.severity)}
											size="small"
											sx={{ backgroundColor: chip.bg, color: chip.color, fontWeight: 700, fontSize: '0.62rem', height: 20 }}
										/>
										<Typography sx={{ flex: 1, fontSize: '0.8rem', color: '#334155', fontWeight: 500, minWidth: 0 }}>
											{t(`libraryQuality.issues.${issue.issueKey}`, issue.issueKey)}
										</Typography>
										<Typography sx={{ fontSize: '0.8rem', color: '#0f172a', fontWeight: 800 }}>
											{issue.count}
										</Typography>
										<Button
											size="small"
											onClick={() => handleIssueAction(issue)}
											endIcon={isExpanded ? <ExpandLessRoundedIcon sx={{ fontSize: 16 }} /> : <ExpandMoreRoundedIcon sx={{ fontSize: 16 }} />}
											sx={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'none', color: '#629C44' }}
										>
											{t('libraryQuality.view', 'View')}
										</Button>
									</Box>
									<Collapse in={isExpanded} timeout="auto" unmountOnExit>
										<Box sx={{ pb: 1.5, pl: 1 }}>
											{isDuplicates
												? <QualityDuplicatesList onChanged={fetchReport} />
												: <QualityIssueList issueKey={issue.issueKey} />}
										</Box>
									</Collapse>
								</Box>
							);
						})}
					</Box>
				)}
			</Paper>
		</Box>
		</Box>
	);
};

export default AppLibraryQuality;
