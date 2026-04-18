import React, { useEffect, useMemo, useState } from 'react';
import {
	Box,
	CircularProgress,
	Paper,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
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
	Tooltip,
} from 'chart.js';
import { useTranslation } from 'react-i18next';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import LeaderboardOutlinedIcon from '@mui/icons-material/LeaderboardOutlined';
import apiClient from '../../../../axiosConfig.js';
import QorvaChip from '../../commons/QorvaChip.jsx';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const initialDashboardData = {
	subscriptionStatus: '',
	totalCVs: 0,
	totalJobsPosted: 0,
	totalUsers: 0,
	totalResumeAnalysis: 0,
	totalResumesProcessedCurrentMonth: 0,
	skillsReport: [],
	jobPostsReport: [],
};

const KPI_CONFIG = (t) => [
	{ key: 'totalCVs',                         label: t('dashboard.kpi.totalCVs'),                         icon: PeopleOutlinedIcon,       accent: '#629C44', bg: 'rgba(98,156,68,0.08)'   },
	{ key: 'totalJobsPosted',                  label: t('dashboard.kpi.totalJobsPosted'),                  icon: WorkOutlineOutlinedIcon,  accent: '#3b82f6', bg: 'rgba(59,130,246,0.08)'  },
	{ key: 'totalUsers',                       label: t('dashboard.kpi.totalUsers'),                       icon: PersonOutlineOutlinedIcon,accent: '#8b5cf6', bg: 'rgba(139,92,246,0.08)'  },
	{ key: 'totalResumeAnalysis',              label: t('dashboard.kpi.totalResumeAnalysis'),              icon: AssessmentOutlinedIcon,   accent: '#f59e0b', bg: 'rgba(245,158,11,0.08)'  },
	{ key: 'totalResumesProcessedCurrentMonth',label: t('dashboard.kpi.totalResumesProcessedCurrentMonth'),icon: TrendingUpOutlinedIcon,   accent: '#06b6d4', bg: 'rgba(6,182,212,0.08)'   },
];

const KPICard = ({ label, value, icon: Icon, accent, bg }) => (
	<Paper elevation={0} sx={{
		border: '1px solid #e2e8f0',
		borderLeft: `3px solid ${accent}`,
		borderRadius: 2.5, p: 2,
		display: 'flex', alignItems: 'center', gap: 1.5,
		transition: 'box-shadow 0.15s ease',
		'&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.07)' },
	}}>
		<Box sx={{
			width: 42, height: 42, borderRadius: 2, flexShrink: 0,
			display: 'flex', alignItems: 'center', justifyContent: 'center',
			backgroundColor: bg,
		}}>
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
				const res = await apiClient.get(import.meta.env.VITE_APP_API_DASHBOARD_DATA);
				const data = res?.data;
				data.skillsReport = Array.isArray(data.skillsReport) ? data.skillsReport : [];
				data.jobPostsReport = Array.isArray(data.jobPostsReport) ? data.jobPostsReport : [];
				setDashboardData(data);
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
						<Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>
							Dashboard
						</Typography>
					</Box>
					<QorvaChip statusCode={dashboardData.subscriptionStatus} />
				</Box>

				{/* Loading */}
				{loading && (
					<Stack alignItems="center" justifyContent="center" sx={{ flex: 1, py: 8 }} spacing={1.5}>
						<CircularProgress size={32} sx={{ color: '#629C44' }} />
						<Typography sx={{ fontSize: '0.82rem', color: '#94a3b8' }}>
							{t('dashboard.loading')}
						</Typography>
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
							gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)', md: 'repeat(5, 1fr)' },
							gap: 2,
						}}>
							{kpiConfig.map(({ key, label, icon, accent, bg }) => (
								<KPICard
									key={key}
									label={label}
									value={dashboardData[key]}
									icon={icon}
									accent={accent}
									bg={bg}
								/>
							))}
						</Box>

						{/* Charts row */}
						<Box sx={{
							display: 'grid',
							gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: '1fr 380px' },
							gap: 2.5,
							alignItems: 'stretch',
						}}>

							{/* Skills bar chart */}
							<Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2.5, p: 2.5, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, pb: 1.5, borderBottom: '2px solid #629C44', flexShrink: 0 }}>
									<AssessmentOutlinedIcon sx={{ fontSize: 15, color: '#629C44' }} />
									<Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#629C44', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
										{t('dashboard.sections.skillsReport')}
									</Typography>
								</Box>
								<Box sx={{ flex: 1, minHeight: 220, position: 'relative' }}>
									{dashboardData.skillsReport.length ? (
										<Bar data={skillsBarData} options={skillsBarOptions} />
									) : (
										<Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
											<Typography sx={{ fontSize: '0.82rem', color: '#94a3b8' }}>
												{t('dashboard.empty.skills')}
											</Typography>
										</Box>
									)}
								</Box>
							</Paper>

							{/* Job posts table */}
							<Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2.5, p: 2.5, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, pb: 1.5, borderBottom: '2px solid #629C44', flexShrink: 0 }}>
									<WorkOutlineOutlinedIcon sx={{ fontSize: 15, color: '#629C44' }} />
									<Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#629C44', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
										{t('dashboard.sections.jobPostsReport')}
									</Typography>
								</Box>
								{dashboardData.jobPostsReport.length ? (
									<TableContainer sx={{ flex: 1, overflowY: 'auto' }}>
										<Table size="small" stickyHeader>
											<TableHead>
												<TableRow>
													<TableCell sx={{
														fontWeight: 700, fontSize: '0.7rem', color: '#64748b',
														textTransform: 'uppercase', letterSpacing: '0.05em',
														backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', py: 1,
													}}>
														{t('dashboard.table.jobPostTitle')}
													</TableCell>
													<TableCell align="right" sx={{
														fontWeight: 700, fontSize: '0.7rem', color: '#64748b',
														textTransform: 'uppercase', letterSpacing: '0.05em',
														backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', py: 1,
													}}>
														{t('dashboard.table.totalMatch')}
													</TableCell>
												</TableRow>
											</TableHead>
											<TableBody>
												{dashboardData.jobPostsReport.map((row, idx) => (
													<TableRow
														key={`${row.jobPostTitle}-${idx}`}
														sx={{ '&:hover': { backgroundColor: '#f8fafc' } }}
													>
														<TableCell sx={{ fontSize: '0.82rem', color: '#0f172a', py: 1, borderBottom: '1px solid #f1f5f9' }}>
															{row?.jobPostTitle ?? '—'}
														</TableCell>
														<TableCell align="right" sx={{ py: 1, borderBottom: '1px solid #f1f5f9' }}>
															<Box sx={{
																display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
																minWidth: 32, height: 22, px: 1, borderRadius: 1.5,
																backgroundColor: 'rgba(98,156,68,0.10)', color: '#166534',
																fontSize: '0.75rem', fontWeight: 700,
															}}>
																{row?.totalMatch ?? 0}
															</Box>
														</TableCell>
													</TableRow>
												))}
											</TableBody>
										</Table>
									</TableContainer>
								) : (
									<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120 }}>
										<Typography sx={{ fontSize: '0.82rem', color: '#94a3b8' }}>
											{t('dashboard.empty.jobPosts')}
										</Typography>
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
