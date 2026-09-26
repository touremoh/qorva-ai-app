import { useEffect, useMemo, useState } from 'react';
import SectionHeader from '../../../shared/ui/SectionHeader.jsx';
import {
	Box,
	CircularProgress,
	Paper,
	Stack,
	Typography,
} from '@mui/material';
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
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import LeaderboardOutlinedIcon from '@mui/icons-material/LeaderboardOutlined';
import { getDashboardData } from '../api/dashboardService.js';
import QorvaChip from '../../../components/commons/QorvaChip.jsx';
import KPICard from './KPICard.jsx';
import TopCandidatesTable from './TopCandidatesTable.jsx';
import JobPostsReportTable from './JobPostsReportTable.jsx';
import TalentPoolInsightSection from './TalentPoolInsightSection.jsx';
import { initialDashboardData, KPI_CONFIG } from '../model/dashboard.js';
import * as tokens from '../../../theme/tokens.js';
import { alpha } from '@mui/material/styles';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend);

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
			backgroundColor: alpha(tokens.brand.main, 0.75),
			borderColor: tokens.brand.main,
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
				backgroundColor: tokens.ink.strong,
				titleColor: tokens.onDark.subtle,
				bodyColor: tokens.surface.paper,
				padding: 10,
				cornerRadius: 8,
			},
		},
		scales: {
			x: {
				grid: { display: false },
				ticks: { color: tokens.ink.muted, font: { size: 12 }, autoSkip: true, maxRotation: 0 },
			},
			y: {
				beginAtZero: true,
				grid: { color: tokens.surface.muted },
				ticks: { precision: 0, color: tokens.ink.subtle, font: { size: 12 } },
			},
		},
	}), []);

	const kpiConfig = useMemo(() => KPI_CONFIG(t), [t]);

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', overflow: 'hidden', backgroundColor: tokens.surface.subtle }}>
			<Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, md: 3 }, display: 'flex', flexDirection: 'column', gap: 2.5 }}>

				{/* Toolbar */}
				<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
						<LeaderboardOutlinedIcon sx={{ fontSize: tokens.iconSize.lg, color: tokens.brand.text }} />
						<Typography sx={{ fontWeight: 700, fontSize: tokens.fontSize.body, color: tokens.ink.strong }}>Dashboard</Typography>
					</Box>
					<QorvaChip statusCode={dashboardData.subscriptionStatus} />
				</Box>

				{/* Loading */}
				{loading && (
					<Stack alignItems="center" justifyContent="center" sx={{ flex: 1, py: 8 }} spacing={1.5}>
						<CircularProgress size={32} sx={{ color: tokens.brand.text }} />
						<Typography sx={{ fontSize: tokens.fontSize.body2, color: tokens.ink.subtle }}>{t('dashboard.loading')}</Typography>
					</Stack>
				)}

				{/* Error */}
				{!loading && error && (
					<Paper elevation={0} sx={{ border: `1px solid ${tokens.status.error.tint}`, borderRadius: 2.5, p: 2.5 }}>
						<Typography sx={{ fontSize: tokens.fontSize.body2, color: tokens.status.error.main }}>{error}</Typography>
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
							<Paper elevation={0} sx={{ border: `1px solid ${tokens.line.main}`, borderRadius: 2.5, p: 2.5, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
								<SectionHeader sx={{ pb: 1.5 }} icon={AssessmentOutlinedIcon} label={t('dashboard.sections.skillsReport')} />
								<Box sx={{ flex: 1, minHeight: 220, position: 'relative' }}>
									{dashboardData.skillsReport.length ? (
										<Bar data={skillsBarData} options={skillsBarOptions} />
									) : (
										<Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
											<Typography sx={{ fontSize: tokens.fontSize.body2, color: tokens.ink.subtle }}>{t('dashboard.empty.skills')}</Typography>
										</Box>
									)}
								</Box>
							</Paper>

							{/* Job posts table — paged client-side */}
							<JobPostsReportTable rows={dashboardData.jobPostsReport} t={t} />
						</Box>
					</>
				)}
			</Box>
		</Box>
	);
};

export default QorvaDashboard;
