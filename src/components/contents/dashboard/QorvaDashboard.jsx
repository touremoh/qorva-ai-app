import React, { useEffect, useMemo, useState } from 'react';
import {
	Avatar,
	Box,
	CircularProgress,
	IconButton,
	Paper,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Tooltip,
	Typography,
} from '@mui/material';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { Bar } from 'react-chartjs-2';
import {
	BarElement,
	CategoryScale,
	Chart as ChartJS,
	Legend,
	LinearScale,
	Title,
	Tooltip as ChartTooltip,
} from 'chart.js';
import { useTranslation } from 'react-i18next';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import LeaderboardOutlinedIcon from '@mui/icons-material/LeaderboardOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import { getDashboardData, getTopCandidatesPerJobPost } from '../../../services/dashboardService.js';
import QorvaChip from '../../commons/QorvaChip.jsx';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend);

const initialDashboardData = {
	subscriptionStatus: '',
	totalCVs: 0,
	totalJobsPosted: 0,
	totalUsers: 0,
	totalResumeAnalysis: 0,
	skillsReport: [],
	jobPostsReport: [],
	skillDepthReport: [],
	seniorityLevelReport: [],
	leadershipReport: [],
	learningVelocityReport: [],
};

const TALENT_INSIGHT_LABEL_MAP = {
	specialist: 'Specialist',
	tShaped: 'T-Shaped',
	generalist: 'Generalist',
	hybrid: 'Hybrid',
	senior: 'Senior',
	midLevel: 'Mid-Level',
	junior: 'Junior',
	lead: 'Lead',
	principal: 'Principal',
	manager: 'Manager',
	director: 'Director',
	executive: 'Executive',
	individualContributor: 'Individual Contributor',
	teamLead: 'Team Lead',
	none: 'None',
	crossFunctionalLeader: 'Cross-Functional',
	strategicLeader: 'Strategic Leader',
	executiveInfluence: 'Executive Influence',
	high: 'High',
	medium: 'Medium',
	veryHigh: 'Very High',
	low: 'Low',
	unknown: 'Unknown',
};

const TALENT_POOL_INSIGHT_CONFIG = (t) => [
	{ key: 'skillDepthReport',       label: t('dashboard.talent.skillDepth', 'Skill Depth'),         icon: LayersOutlinedIcon,     accent: '#8b5cf6', bg: 'rgba(139,92,246,0.08)'  },
	{ key: 'seniorityLevelReport',   label: t('dashboard.talent.seniorityLevel', 'Seniority Level'),  icon: TrendingUpOutlinedIcon, accent: '#3b82f6', bg: 'rgba(59,130,246,0.08)'  },
	{ key: 'leadershipReport',       label: t('dashboard.talent.leadership', 'Leadership'),            icon: GroupsOutlinedIcon,     accent: '#629C44', bg: 'rgba(98,156,68,0.08)'   },
	{ key: 'learningVelocityReport', label: t('dashboard.talent.learningVelocity', 'Learning Velocity'), icon: BoltOutlinedIcon,    accent: '#f59e0b', bg: 'rgba(245,158,11,0.08)'  },
];

const KPI_CONFIG = (t) => [
	{ key: 'totalCVs',            label: t('dashboard.kpi.totalCVs'),            icon: PeopleOutlinedIcon,        accent: '#629C44', bg: 'rgba(98,156,68,0.08)'  },
	{ key: 'totalJobsPosted',     label: t('dashboard.kpi.totalJobsPosted'),     icon: WorkOutlineOutlinedIcon,   accent: '#3b82f6', bg: 'rgba(59,130,246,0.08)' },
	{ key: 'totalUsers',          label: t('dashboard.kpi.totalUsers'),          icon: PersonOutlineOutlinedIcon, accent: '#8b5cf6', bg: 'rgba(139,92,246,0.08)' },
	{ key: 'totalResumeAnalysis', label: t('dashboard.kpi.totalResumeAnalysis'), icon: AssessmentOutlinedIcon,    accent: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
];

const scoreColor = (score) => {
	if (score >= 70) return { color: '#166534', bg: '#dcfce7' };
	if (score >= 40) return { color: '#854d0e', bg: '#fef9c3' };
	return { color: '#991b1b', bg: '#fee2e2' };
};

const medalColor = (rank) => {
	if (rank === 0) return '#f59e0b';
	if (rank === 1) return '#94a3b8';
	if (rank === 2) return '#cd7c2f';
	return '#e2e8f0';
};

const KPICard = ({ label, value, icon: Icon, accent, bg }) => (
	<Paper elevation={0} sx={{
		border: '1px solid #e2e8f0',
		borderLeft: `3px solid ${accent}`,
		borderRadius: 2.5, p: 2,
		display: 'flex', alignItems: 'center', gap: 1.5,
		transition: 'box-shadow 0.15s ease',
		'&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.07)' },
	}}>
		<Box sx={{ width: 42, height: 42, borderRadius: 2, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: bg }}>
			<Icon sx={{ fontSize: 20, color: accent }} />
		</Box>
		<Box sx={{ minWidth: 0 }}>
			<Typography sx={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
				{Number.isFinite(value) ? value.toLocaleString() : 0}
			</Typography>
			<Typography sx={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500, mt: 0.25, lineHeight: 1.3 }}>
				{label}
			</Typography>
		</Box>
	</Paper>
);

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

const SCROLLBAR_SX = {
	'&::-webkit-scrollbar': { width: 4, height: 4 },
	'&::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
	'&::-webkit-scrollbar-thumb': { backgroundColor: '#e2e8f0', borderRadius: 4 },
};

const JobCandidateCard = ({ job }) => {
	const candidates = job.topCandidates?.slice(0, 5) ?? [];
	return (
		<Box sx={{
			flex: '1 1 180px', minWidth: 180,
			border: '1px solid #e2e8f0', borderRadius: 2, overflow: 'hidden',
		}}>
			<Tooltip title={job.jobPostTitle} placement="top">
				<Box sx={{ px: 1.5, py: 1, backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
					<Typography sx={{
						fontSize: '0.76rem', fontWeight: 700, color: '#0f172a',
						overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
					}}>
						{job.jobPostTitle}
					</Typography>
				</Box>
			</Tooltip>
			<Box>
				{candidates.map((c, i) => {
					const { color, bg: scoreBg } = scoreColor(c.score);
					const initials = c.candidateName.split(' ').slice(0, 2).map(p => p[0] ?? '').join('').toUpperCase();
					return (
						<Box key={i} sx={{
							display: 'flex', alignItems: 'center', gap: 0.75,
							px: 1.25, py: 0.65,
							borderBottom: i < candidates.length - 1 ? '1px solid #f1f5f9' : 'none',
							'&:hover': { backgroundColor: 'rgba(98,156,68,0.04)' },
						}}>
							<Box sx={{
								width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
								backgroundColor: medalColor(i),
								display: 'flex', alignItems: 'center', justifyContent: 'center',
							}}>
								<Typography sx={{ fontSize: '0.52rem', fontWeight: 800, color: i < 3 ? '#fff' : '#94a3b8', lineHeight: 1 }}>
									{i + 1}
								</Typography>
							</Box>
							<Avatar sx={{
								width: 22, height: 22, fontSize: '0.55rem', fontWeight: 700, flexShrink: 0,
								backgroundColor: `${color}22`, color,
							}}>
								{initials}
							</Avatar>
							<Typography sx={{
								flex: 1, fontSize: '0.76rem', fontWeight: i === 0 ? 600 : 400, color: '#0f172a',
								overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0,
							}}>
								{c.candidateName}
							</Typography>
							<Box sx={{
								flexShrink: 0, px: 0.6, py: 0.15, borderRadius: 1,
								backgroundColor: scoreBg, color,
								fontSize: '0.65rem', fontWeight: 800, lineHeight: 1.5,
							}}>
								{c.score}%
							</Box>
						</Box>
					);
				})}
			</Box>
		</Box>
	);
};

const TopCandidatesTable = ({ t }) => {
	const [pageNumber, setPageNumber] = useState(0);
	const [jobs, setJobs] = useState([]);
	const [totalPages, setTotalPages] = useState(0);
	const [hasNext, setHasNext] = useState(false);
	const [pageLoading, setPageLoading] = useState(true);
	const [hasData, setHasData] = useState(false);

	const fetchPage = async (page) => {
		setPageLoading(true);
		try {
			const res = await getTopCandidatesPerJobPost(page, 5);
			const data = res?.data;
			const content = data?.content ?? [];
			if (content.length > 0) {
				setHasData(true);
				setJobs(content);
				setTotalPages(data.totalPages ?? 1);
				setHasNext(data.hasNext ?? false);
			} else {
				setHasData(false);
				setJobs([]);
			}
		} catch (e) {
			console.error('Error loading top candidates', e);
		} finally {
			setPageLoading(false);
		}
	};

	useEffect(() => { fetchPage(0); }, []); // eslint-disable-line react-hooks/exhaustive-deps

	const handlePrev = () => { const p = pageNumber - 1; setPageNumber(p); fetchPage(p); };
	const handleNext = () => { const p = pageNumber + 1; setPageNumber(p); fetchPage(p); };

	if (pageLoading && jobs.length === 0) return null;
	if (!hasData) return null;

	const paginationControls = totalPages > 1 ? (
		<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
			{pageLoading && <CircularProgress size={12} sx={{ color: '#94a3b8', mr: 0.5 }} />}
			<IconButton
				size="small"
				onClick={handlePrev}
				disabled={pageNumber === 0 || pageLoading}
				sx={{ color: '#64748b', p: 0.25, '&:hover': { backgroundColor: 'rgba(98,156,68,0.08)', color: '#629C44' } }}
			>
				<ChevronLeftRoundedIcon sx={{ fontSize: 18 }} />
			</IconButton>
			<Typography sx={{ fontSize: '0.72rem', color: '#94a3b8', minWidth: 32, textAlign: 'center' }}>
				{pageNumber + 1} / {totalPages}
			</Typography>
			<IconButton
				size="small"
				onClick={handleNext}
				disabled={!hasNext || pageLoading}
				sx={{ color: '#64748b', p: 0.25, '&:hover': { backgroundColor: 'rgba(98,156,68,0.08)', color: '#629C44' } }}
			>
				<ChevronRightRoundedIcon sx={{ fontSize: 18 }} />
			</IconButton>
		</Box>
	) : null;

	return (
		<Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2.5, p: 2.5, minWidth: 0 }}>
			<SectionHeader
				icon={EmojiEventsOutlinedIcon}
				label={t('dashboard.sections.topCandidates')}
				right={paginationControls}
			/>
			<Box sx={{
				display: 'flex', gap: 1.5, flexWrap: 'wrap',
				opacity: pageLoading ? 0.5 : 1, transition: 'opacity 0.15s',
			}}>
				{jobs.map((job) => (
					<JobCandidateCard key={job.jobPostTitle} job={job} />
				))}
			</Box>
		</Paper>
	);
};

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
				<Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155' }}>
					{label}
				</Typography>
			</Box>
			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.9 }}>
				{sorted.map(({ name, count, percentage }) => {
					const isUnknown = name === 'unknown';
					return (
						<Box key={name}>
							<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.35 }}>
								<Typography sx={{ fontSize: '0.69rem', color: isUnknown ? '#94a3b8' : '#475569', fontWeight: isUnknown ? 400 : 500 }}>
									{t(`dashboard.talent.labels.${name}`, TALENT_INSIGHT_LABEL_MAP[name] ?? name)}
								</Typography>
								<Typography sx={{ fontSize: '0.69rem', color: isUnknown ? '#94a3b8' : '#64748b', fontWeight: 600 }}>
									{count} · {percentage.toFixed(1)}%
								</Typography>
							</Box>
							<Box sx={{ height: 5, backgroundColor: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
								<Box sx={{
									height: '100%',
									width: `${percentage}%`,
									backgroundColor: isUnknown ? '#e2e8f0' : accent,
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

const TalentPoolInsightSection = ({ data, t }) => {
	const config = useMemo(() => TALENT_POOL_INSIGHT_CONFIG(t), [t]);
	const hasData = config.some(({ key }) => Array.isArray(data[key]) && data[key].length > 0);
	if (!hasData) return null;

	return (
		<Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2.5, p: 2.5 }}>
			<SectionHeader icon={InsightsOutlinedIcon} label={t('dashboard.sections.talentPoolInsight', 'Talent Pool Insight')} />
			<Box sx={{
				display: 'grid',
				gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
				gap: 3,
			}}>
				{config.map(({ key, label, icon, accent, bg }) => {
					const items = data[key];
					if (!Array.isArray(items) || items.length === 0) return null;
					return (
						<InsightCard key={key} label={label} icon={icon} accent={accent} bg={bg} items={items} t={t} />
					);
				})}
			</Box>
		</Paper>
	);
};

const QorvaDashboard = () => {
	const { t } = useTranslation();
	const [dashboardData, setDashboardData] = useState(initialDashboardData);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		(async () => {
			try {
				setLoading(true);
				setError('');
				const res = await getDashboardData();
				const data = res?.data?.data ?? res?.data ?? {};
				data.skillsReport = Array.isArray(data.skillsReport) ? data.skillsReport : [];
				data.jobPostsReport = Array.isArray(data.jobPostsReport) ? data.jobPostsReport : [];
				data.skillDepthReport = Array.isArray(data.skillDepthReport) ? data.skillDepthReport : [];
				data.seniorityLevelReport = Array.isArray(data.seniorityLevelReport) ? data.seniorityLevelReport : [];
				data.leadershipReport = Array.isArray(data.leadershipReport) ? data.leadershipReport : [];
				data.learningVelocityReport = Array.isArray(data.learningVelocityReport) ? data.learningVelocityReport : [];
				setDashboardData({ ...initialDashboardData, ...data });
			} catch (e) {
				console.error('Error loading dashboard data', e);
				setError(t('dashboard.errors.loadFailed'));
			} finally {
				setLoading(false);
			}
		})();
	}, [t]);

	const skillsBarData = useMemo(() => ({
		labels: dashboardData.skillsReport.map(s => s?.skill ?? ''),
		datasets: [{
			label: t('dashboard.skillsReport.label'),
			data: dashboardData.skillsReport.map(s => s?.totalMatch ?? 0),
			backgroundColor: 'rgba(98,156,68,0.75)',
			borderColor: '#629C44',
			borderWidth: 1,
			borderRadius: 4,
		}],
	}), [dashboardData.skillsReport, t]);

	const skillsBarOptions = useMemo(() => ({
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: { display: false },
			tooltip: {
				backgroundColor: '#0f172a',
				titleColor: '#94a3b8',
				bodyColor: '#ffffff',
				padding: 10,
				cornerRadius: 8,
			},
		},
		scales: {
			x: {
				grid: { display: false },
				ticks: { color: '#64748b', font: { size: 11 }, autoSkip: true, maxRotation: 0 },
			},
			y: {
				beginAtZero: true,
				grid: { color: '#f1f5f9' },
				ticks: { precision: 0, color: '#94a3b8', font: { size: 11 } },
			},
		},
	}), []);

	const kpiConfig = useMemo(() => KPI_CONFIG(t), [t]);

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', overflow: 'hidden', backgroundColor: '#f8fafc' }}>
			<Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, md: 3 }, display: 'flex', flexDirection: 'column', gap: 2.5 }}>

				{/* Toolbar */}
				<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
						<LeaderboardOutlinedIcon sx={{ fontSize: 20, color: '#629C44' }} />
						<Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>Dashboard</Typography>
					</Box>
					<QorvaChip statusCode={dashboardData.subscriptionStatus} />
				</Box>

				{/* Loading */}
				{loading && (
					<Stack alignItems="center" justifyContent="center" sx={{ flex: 1, py: 8 }} spacing={1.5}>
						<CircularProgress size={32} sx={{ color: '#629C44' }} />
						<Typography sx={{ fontSize: '0.82rem', color: '#94a3b8' }}>{t('dashboard.loading')}</Typography>
					</Stack>
				)}

				{/* Error */}
				{!loading && error && (
					<Paper elevation={0} sx={{ border: '1px solid #fee2e2', borderRadius: 2.5, p: 2.5 }}>
						<Typography sx={{ fontSize: '0.85rem', color: '#dc2626' }}>{error}</Typography>
					</Paper>
				)}

				{!loading && !error && (
					<>
						{/* KPI row */}
						<Box sx={{
							display: 'grid',
							gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
							gap: 2,
						}}>
							{kpiConfig.map(({ key, label, icon, accent, bg }) => (
								<KPICard key={key} label={label} value={dashboardData[key]} icon={icon} accent={accent} bg={bg} />
							))}
						</Box>

						{/* Talent pool insight */}
						<TalentPoolInsightSection data={dashboardData} t={t} />

						{/* Top candidates per job — self-fetches via /dashboard/top-candidates */}
						<TopCandidatesTable t={t} />

						{/* Skills chart + Job applications table */}
						<Box sx={{
							display: 'grid',
							gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: '1fr 380px' },
							gap: 2.5,
							alignItems: 'stretch',
						}}>
							{/* Skills bar chart */}
							<Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2.5, p: 2.5, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
								<SectionHeader icon={AssessmentOutlinedIcon} label={t('dashboard.sections.skillsReport')} />
								<Box sx={{ flex: 1, minHeight: 220, position: 'relative' }}>
									{dashboardData.skillsReport.length ? (
										<Bar data={skillsBarData} options={skillsBarOptions} />
									) : (
										<Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
											<Typography sx={{ fontSize: '0.82rem', color: '#94a3b8' }}>{t('dashboard.empty.skills')}</Typography>
										</Box>
									)}
								</Box>
							</Paper>

							{/* Job posts table */}
							<Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2.5, p: 2.5, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
								<SectionHeader icon={WorkOutlineOutlinedIcon} label={t('dashboard.sections.jobPostsReport')} />
								{dashboardData.jobPostsReport.length ? (
									<TableContainer sx={{ flex: 1, overflowY: 'auto' }}>
										<Table size="small" stickyHeader>
											<TableHead>
												<TableRow>
													<TableCell sx={{ fontWeight: 700, fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', py: 1 }}>
														{t('dashboard.table.jobPostTitle')}
													</TableCell>
													<TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', py: 1 }}>
														{t('dashboard.table.totalMatch')}
													</TableCell>
												</TableRow>
											</TableHead>
											<TableBody>
												{dashboardData.jobPostsReport.map((row, idx) => (
													<TableRow key={`${row.jobPostTitle}-${idx}`} sx={{ '&:hover': { backgroundColor: '#f8fafc' } }}>
														<TableCell sx={{ fontSize: '0.82rem', color: '#0f172a', py: 1, borderBottom: '1px solid #f1f5f9' }}>
															{row?.jobPostTitle ?? '—'}
														</TableCell>
														<TableCell align="right" sx={{ py: 1, borderBottom: '1px solid #f1f5f9' }}>
															<Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 32, height: 22, px: 1, borderRadius: 1.5, backgroundColor: 'rgba(98,156,68,0.10)', color: '#166534', fontSize: '0.75rem', fontWeight: 700 }}>
																{row?.totalMatch ?? 0}
															</Box>
														</TableCell>
													</TableRow>
												))}
											</TableBody>
										</Table>
									</TableContainer>
								) : (
									<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
										<Typography sx={{ fontSize: '0.82rem', color: '#94a3b8' }}>{t('dashboard.empty.jobPosts')}</Typography>
									</Box>
								)}
							</Paper>
						</Box>
					</>
				)}
			</Box>
		</Box>
	);
};

export default QorvaDashboard;
