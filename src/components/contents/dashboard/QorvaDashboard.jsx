import React, { useEffect, useMemo, useState } from 'react';
import {
	Box,
	Grid2,
	Paper,
	Typography,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	TableContainer,
	CircularProgress,
} from '@mui/material';
import { Bar } from 'react-chartjs-2';
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
} from 'chart.js';
import { useTranslation } from 'react-i18next';
import apiClient from '../../../../axiosConfig.js';
import QorvaChip from "../../commons/QorvaChip.jsx";

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

const QorvaDashboard = () => {
	const { t } = useTranslation();
	const [dashboardData, setDashboardData] = useState(initialDashboardData);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	// Fetch dashboard data
	useEffect(() => {
		(async function fetchData() {
			try {
				setLoading(true);
				setError('');
				const res = await apiClient.get(import.meta.env.VITE_APP_API_DASHBOARD_DATA);
				const data = res?.data;
				// Normalize arrays to avoid runtime errors
				data.skillsReport = Array.isArray(data.skillsReport) ? data.skillsReport : [];
				data.jobPostsReport = Array.isArray(data.jobPostsReport) ? data.jobPostsReport : [];
				setDashboardData(data);
			} catch (e) {
				console.error('Error loading dashboard data', e);
				setError(t('dashboard.errors.loadFailed', 'Failed to load dashboard data.'));
			} finally {
				setLoading(false);
			}
		})();
	}, [t]);

	// Build Skills chart (vertical bars)
	const skillsBarData = useMemo(() => {
		const labels = dashboardData.skillsReport.map(s => s?.skill ?? '');
		const values = dashboardData.skillsReport.map(s => s?.totalMatch ?? 0);
		return {
			labels,
			datasets: [
				{
					label: t('dashboard.skillsReport.label', 'Total matches'),
					data: values,
					backgroundColor: 'rgba(75, 192, 192, 0.6)',
					borderColor: 'rgba(75, 192, 192, 1)',
					borderWidth: 1,
				},
			],
		};
	}, [dashboardData.skillsReport, t]);

	const skillsBarOptions = useMemo(
		() => ({
			responsive: true,
			maintainAspectRatio: false,
			plugins: {
				legend: { display: true },
				title: {
					display: false,
					text: t('dashboard.skillsReport.title', 'Skills Report'),
				},
				tooltip: { enabled: true },
			},
			scales: {
				x: { ticks: { autoSkip: true, maxRotation: 0, minRotation: 0 } },
				y: { beginAtZero: true, ticks: { precision: 0 } },
			},
		}),
		[t]
	);

	return (
		<Box
			sx={{
				width: '100%',
				height: '100vh',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'flex-start',
				backgroundColor: 'transparent',
				color: '#232F3E',
				padding: 2,
				overflowX: 'none'
			}}
		>
			{/* Top bar with Subscription Status (top-right corner) */}
			<Box
				sx={{
					width: '100%',
					maxWidth: { lg: '1440px' },
					display: 'flex',
					justifyContent: 'flex-end',
					mb: 2,
				}}
			>
				<QorvaChip statusCode={dashboardData.subscriptionStatus}/>
			</Box>

			{/* Content area */}
			<Grid2
				container
				spacing={3}
				sx={{ width: { xs: '100%', md: '100%', lg: '1440px' }, mx: 'auto' }}
			>
				{/* Loading / Error */}
				{loading && (
					<Grid2 xs={12} sx={{ height: '100%', width: '100%' }}>
						<Stack alignItems="center" justifyContent="center" py={4}>
							<CircularProgress />
							<Typography variant="body2" sx={{ mt: 1 }}>
								{t('dashboard.loading', 'Loading dashboard…')}
							</Typography>
						</Stack>
					</Grid2>
				)}
				{!loading && error && (
					<Grid2 xs={12}>
						<Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
							<Typography color="error">{error}</Typography>
						</Paper>
					</Grid2>
				)}

				{!loading && !error && (
					<>
						{/* Top section: KPI paper widgets */}
						<Grid2 container xs={12} spacing={3} sx={{width: '100%'}}>
							{[
								{
									key: 'totalCVs',
									label: t('dashboard.kpi.totalCVs', 'CVs'),
									value: dashboardData.totalCVs,
								},
								{
									key: 'totalJobsPosted',
									label: t('dashboard.kpi.totalJobsPosted', 'Jobs Posts'),
									value: dashboardData.totalJobsPosted,
								},
								{
									key: 'totalUsers',
									label: t('dashboard.kpi.totalUsers', 'Users'),
									value: dashboardData.totalUsers,
								},
								{
									key: 'totalResumeAnalysis',
									label: t('dashboard.kpi.totalResumeAnalysis', 'Total Resumes Screenned'),
									value: dashboardData.totalResumeAnalysis,
								},
								{
									key: 'totalResumesProcessedCurrentMonth',
									label: t(
										'dashboard.kpi.totalResumesProcessedCurrentMonth',
										'Resume Screenned this month'
									),
									value: dashboardData.totalResumesProcessedCurrentMonth,
								},
							].map(({ key, label, value }) => (
								<Grid2 key={key} xs={12} sm={6} md={4} lg={2} sx={{width: '18.6%'}}>
									<Paper elevation={3} sx={{ p: 2, borderRadius: 2, textAlign: 'center' }}>
										<Typography variant="subtitle1" gutterBottom>
											{label}
										</Typography>
										<Typography variant="h4" color="green">
											{Number.isFinite(value) ? value : 0}
										</Typography>
									</Paper>
								</Grid2>
							))}
						</Grid2>

						{/* Second: Skills Report (vertical bar chart) */}
						<Grid2 xs={12} sx={{width: '100%'}}>
							<Paper elevation={3} sx={{ p: 2, borderRadius: 2, height: 380, width: '97.5%' }}>
								<Typography variant="h6" gutterBottom>
									{t('dashboard.sections.skillsReport', 'Skills Report')}
								</Typography>
								<Box sx={{ height: 300 }}>
									{dashboardData.skillsReport?.length ? (
										<Bar data={skillsBarData} options={skillsBarOptions} />
									) : (
										<Typography variant="body2" color="text.secondary">
											{t('dashboard.empty.skills', 'No skills data to display.')}
										</Typography>
									)}
								</Box>
							</Paper>
						</Grid2>

						{/* Third: Job Posts Report (table) */}
						<Grid2 xs={12} sx={{width: '100%'}} >
							<Paper elevation={3} sx={{ p: 2, borderRadius: 2, height: 380, width: '97.5%' }}>
								<Typography variant="h6" gutterBottom>
									{t('dashboard.sections.jobPostsReport', 'Application per Job Post')}
								</Typography>
								{dashboardData.jobPostsReport?.length ? (
									<TableContainer>
										<Table size="small" aria-label="job posts report table">
											<TableHead>
												<TableRow>
													<TableCell sx={{ fontWeight: 600 }}>
														{t('dashboard.table.jobPostTitle', 'Job Post Title')}
													</TableCell>
													<TableCell sx={{ fontWeight: 600 }} align="right">
														{t('dashboard.table.totalMatch', 'Application Count')}
													</TableCell>
												</TableRow>
											</TableHead>
											<TableBody>
												{dashboardData.jobPostsReport.map((row, idx) => (
													<TableRow key={`${row.jobPostTitle}-${idx}`}>
														<TableCell>{row?.jobPostTitle ?? '-'}</TableCell>
														<TableCell align="right">{row?.totalMatch ?? 0}</TableCell>
													</TableRow>
												))}
											</TableBody>
										</Table>
									</TableContainer>
								) : (
									<Typography variant="body2" color="text.secondary">
										{t('dashboard.empty.jobPosts', 'No job post data to display.')}
									</Typography>
								)}
							</Paper>
						</Grid2>
					</>
				)}
			</Grid2>
		</Box>
	);
};

export default QorvaDashboard;
