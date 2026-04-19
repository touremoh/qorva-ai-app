import React, { useState, useEffect } from 'react';
import {
	Box,
	Button,
	TextField,
	List,
	ListItemButton,
	IconButton,
	Typography,
	Chip,
	Avatar,
	Tooltip,
	Switch,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	CircularProgress,
	InputAdornment,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';
import apiClient from '../../../../axiosConfig.js';
import { default as ReactQuill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { TENANT_ID } from '../../../constants.js';

// ─── Job form dialog (defined outside JobContent to keep stable identity) ─────

const JobFormDialog = ({ open, onClose, onSave, title, jobTitle, setJobTitle, jobDescription, setJobDescription, loading, saveLabel }) => (
	<Dialog
		open={open}
		onClose={onClose}
		maxWidth="md"
		fullWidth
		PaperProps={{ sx: { borderRadius: 3 } }}
	>
		<DialogTitle sx={{ px: 3, pt: 3, pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
			<Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>{title}</Typography>
			<IconButton size="small" onClick={onClose} sx={{ color: '#94a3b8' }}>
				<CloseIcon sx={{ fontSize: 18 }} />
			</IconButton>
		</DialogTitle>
		<DialogContent sx={{ px: 3, pb: 1 }}>
			<TextField
				label="Job Title"
				fullWidth
				size="small"
				margin="normal"
				value={jobTitle}
				onChange={(e) => setJobTitle(e.target.value)}
				sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
			/>
			<Box sx={{
				'.ql-container': { borderRadius: '0 0 8px 8px', fontSize: '0.88rem' },
				'.ql-toolbar': { borderRadius: '8px 8px 0 0', borderColor: '#e2e8f0' },
				'.ql-container.ql-snow': { borderColor: '#e2e8f0', minHeight: 280 },
			}}>
				<ReactQuill
					theme="snow"
					value={jobDescription}
					onChange={setJobDescription}
					style={{ color: '#0f172a' }}
				/>
			</Box>
		</DialogContent>
		<DialogActions sx={{ px: 3, pb: 3, pt: 2, gap: 1 }}>
			<Button onClick={onClose} disabled={loading} sx={{ textTransform: 'none', color: '#64748b', borderRadius: 1.5 }}>
				Cancel
			</Button>
			<Button
				variant="contained"
				onClick={onSave}
				disabled={loading || !jobTitle || !jobDescription}
				sx={{
					textTransform: 'none',
					backgroundColor: '#629C44',
					'&:hover': { backgroundColor: '#528035' },
					borderRadius: 1.5,
					boxShadow: 'none',
					fontWeight: 600,
					minWidth: 110,
				}}
			>
				{loading ? <CircularProgress size={18} color="inherit" /> : saveLabel}
			</Button>
		</DialogActions>
	</Dialog>
);

// ─── Main component ───────────────────────────────────────────────────────────

const JobContent = () => {
	const { t } = useTranslation();
	const [createOpen, setCreateOpen] = useState(false);
	const [editOpen, setEditOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [jobs, setJobs] = useState([]);
	const [selectedJob, setSelectedJob] = useState(null);
	const [jobTitle, setJobTitle] = useState('');
	const [jobDescription, setJobDescription] = useState('');
	const [search, setSearch] = useState('');
	const [loading, setLoading] = useState(false);

	const fetchJobs = async () => {
		try {
			const response = await apiClient.get(`${import.meta.env.VITE_APP_API_JOB_POSTS_URL}`);
			setJobs(response.data.data.content);
		} catch (error) {
			console.error('Error fetching job posts:', error);
		}
	};

	useEffect(() => {
		fetchJobs().then(r => console.log('All jobs fetched', r));
	}, []);

	const resetForm = () => { setJobTitle(''); setJobDescription(''); };

	const handleCreateJob = async () => {
		if (!jobTitle || !jobDescription) return;
		setLoading(true);
		try {
			const response = await apiClient.post(import.meta.env.VITE_APP_API_JOB_POSTS_URL, {
				title: jobTitle,
				description: jobDescription,
				status: 'open',
			});
			const created = response.data?.data;
			if (created) {
				setJobs(prev => [...prev, created]);
				resetForm();
				setCreateOpen(false);
			}
		} catch (error) {
			console.error('Error creating job post:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleEditJob = async () => {
		if (!selectedJob || !jobTitle || !jobDescription) return;
		setLoading(true);
		try {
			const updated = { ...selectedJob, title: jobTitle, description: jobDescription };
			await apiClient.put(`${import.meta.env.VITE_APP_API_JOB_POSTS_URL}/${selectedJob.id}`, updated);
			setJobs(jobs.map(j => j.id === selectedJob.id ? updated : j));
			setSelectedJob(updated);
			setEditOpen(false);
		} catch (error) {
			console.error('Error updating job post:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleDeleteJob = async () => {
		if (!selectedJob) return;
		try {
			await apiClient.delete(`${import.meta.env.VITE_APP_API_JOB_POSTS_URL}/${selectedJob.id}`);
			setJobs(jobs.filter(j => j.id !== selectedJob.id));
			setSelectedJob(null);
			setDeleteDialogOpen(false);
		} catch (error) {
			console.error('Error deleting job post:', error);
		}
	};

	const handleToggleStatus = async () => {
		if (!selectedJob) return;
		const next = selectedJob.status === 'open' ? 'closed' : 'open';
		try {
			await apiClient.patch(`${import.meta.env.VITE_APP_API_JOB_POSTS_URL}/${selectedJob.id}`, { status: next });
			setJobs(jobs.map(j => j.id === selectedJob.id ? { ...j, status: next } : j));
			setSelectedJob({ ...selectedJob, status: next });
		} catch (error) {
			console.error('Error updating job status:', error);
		}
	};

	const handleJobClick = (job) => {
		setSelectedJob(job);
		setJobTitle(job.title);
		setJobDescription(job.description);
	};

	const filtered = jobs.filter(j => j.title?.toLowerCase().includes(search.toLowerCase()));

	const jobInitials = (title = '') =>
		title.split(' ').map(w => w[0]).filter(Boolean).join('').slice(0, 2).toUpperCase();

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', overflow: 'hidden', backgroundColor: '#f8fafc' }}>
			{/* Toolbar */}
			<Box sx={{
				display: 'flex',
				alignItems: 'center',
				gap: 1.5,
				px: 2.5,
				py: 1.5,
				backgroundColor: '#ffffff',
				borderBottom: '1px solid #e2e8f0',
				flexShrink: 0,
			}}>
				<Button
					startIcon={<AddIcon />}
					variant="contained"
					onClick={() => { resetForm(); setCreateOpen(true); }}
					sx={{
						backgroundColor: '#629C44',
						'&:hover': { backgroundColor: '#528035' },
						borderRadius: 1.5,
						textTransform: 'none',
						fontWeight: 600,
						fontSize: '0.84rem',
						boxShadow: 'none',
						px: 2,
					}}
				>
					{t('jobContent.createJobPost')}
				</Button>
			</Box>

			{/* Split pane */}
			<Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
				{/* Left panel — job list */}
				<Box sx={{ width: { xs: 180, sm: 220, md: 300 }, flexShrink: 0, borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: '#ffffff' }}>
					<Box sx={{ px: 1.5, pt: 1.5, pb: 1, flexShrink: 0 }}>
						<TextField
							size="small"
							fullWidth
							placeholder={t('jobContent.jobListTitle')}
							value={search}
							onChange={e => setSearch(e.target.value)}
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">
										<SearchIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
									</InputAdornment>
								),
								sx: { fontSize: '0.82rem', borderRadius: 1.5 },
							}}
						/>
					</Box>

					{filtered.length === 0 ? (
						<Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
							<Typography sx={{ fontSize: '0.84rem', color: '#94a3b8' }}>
								{t('jobContent.noJobPosts')}
							</Typography>
						</Box>
					) : (
						<List disablePadding sx={{ flex: 1, overflowY: 'auto', px: 1 }}>
							{filtered.map((job) => {
								const active = selectedJob?.id === job.id;
								const isOpen = job.status === 'open';
								return (
									<ListItemButton
										key={job.id}
										onClick={() => handleJobClick(job)}
										sx={{
											borderRadius: 1.5,
											mb: 0.5,
											px: 1.5,
											py: 1,
											borderLeft: active ? '3px solid #629C44' : '3px solid transparent',
											backgroundColor: active ? 'rgba(98,156,68,0.07)' : 'transparent',
											'&:hover': { backgroundColor: active ? 'rgba(98,156,68,0.10)' : '#f8fafc' },
										}}
									>
										<Avatar sx={{
											width: 32,
											height: 32,
											fontSize: '0.68rem',
											fontWeight: 700,
											backgroundColor: active ? '#629C44' : '#e2e8f0',
											color: active ? '#ffffff' : '#64748b',
											mr: 1.5,
											flexShrink: 0,
										}}>
											{jobInitials(job.title)}
										</Avatar>
										<Box sx={{ flex: 1, minWidth: 0 }}>
											<Typography sx={{
												fontSize: '0.84rem',
												fontWeight: active ? 600 : 500,
												color: '#0f172a',
												overflow: 'hidden',
												textOverflow: 'ellipsis',
												whiteSpace: 'nowrap',
											}}>
												{job.title}
											</Typography>
											<Chip
												label={isOpen ? 'Open' : 'Closed'}
												size="small"
												sx={{
													mt: 0.25,
													height: 18,
													fontSize: '0.68rem',
													fontWeight: 600,
													borderRadius: 0.75,
													backgroundColor: isOpen ? 'rgba(98,156,68,0.12)' : 'rgba(239,68,68,0.10)',
													color: isOpen ? '#3a6827' : '#dc2626',
												}}
											/>
										</Box>
									</ListItemButton>
								);
							})}
						</List>
					)}
				</Box>

				{/* Right panel — job details */}
				<Box sx={{ flex: 1, overflow: 'auto', backgroundColor: '#f8fafc' }}>
					{selectedJob ? (
						<Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
							{/* Action bar */}
							<Box sx={{
								display: 'flex',
								alignItems: 'center',
								flexWrap: 'wrap',
								gap: 1,
								px: 2.5,
								py: 1.25,
								backgroundColor: '#ffffff',
								borderBottom: '1px solid #e2e8f0',
								flexShrink: 0,
							}}>
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
									<Typography sx={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500, display: { xs: 'none', sm: 'block' } }}>
										{selectedJob.status === 'open' ? 'Open' : 'Closed'}
									</Typography>
									<Switch
										checked={selectedJob.status === 'open'}
										onChange={handleToggleStatus}
										size="small"
										sx={{
											'& .MuiSwitch-switchBase.Mui-checked': { color: '#629C44' },
											'& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#629C44' },
										}}
									/>
								</Box>
								<Box sx={{ flexGrow: 1, minWidth: 4 }} />
								<Box sx={{ display: 'flex', gap: 1, flexShrink: 0, ml: 'auto' }}>
									<Tooltip title={t('jobContent.editJobPost')}>
										<IconButton
											size="small"
											onClick={() => setEditOpen(true)}
											sx={{ border: '1px solid #e2e8f0', borderRadius: 1.5, color: '#64748b', '&:hover': { backgroundColor: '#f1f5f9' } }}
										>
											<EditOutlinedIcon sx={{ fontSize: 16 }} />
										</IconButton>
									</Tooltip>
									<Tooltip title={t('jobContent.deleteJobTitle')}>
										<IconButton
											size="small"
											onClick={() => setDeleteDialogOpen(true)}
											sx={{ border: '1px solid #fecaca', borderRadius: 1.5, color: '#ef4444', '&:hover': { backgroundColor: '#fef2f2' } }}
										>
											<DeleteOutlineIcon sx={{ fontSize: 16 }} />
										</IconButton>
									</Tooltip>
								</Box>
							</Box>

							{/* Job content */}
							<Box sx={{ flex: 1, overflowY: 'auto', p: 3, textAlign: 'left' }}>
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
									<Avatar sx={{ width: 44, height: 44, fontSize: '0.9rem', fontWeight: 700, backgroundColor: '#629C44', color: '#fff' }}>
										{jobInitials(selectedJob.title)}
									</Avatar>
									<Box>
										<Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#0f172a', lineHeight: 1.2 }}>
											{selectedJob.title}
										</Typography>
										<Chip
											label={selectedJob.status === 'open' ? 'Open' : 'Closed'}
											size="small"
											sx={{
												mt: 0.5,
												height: 20,
												fontSize: '0.70rem',
												fontWeight: 600,
												borderRadius: 0.75,
												backgroundColor: selectedJob.status === 'open' ? 'rgba(98,156,68,0.12)' : 'rgba(239,68,68,0.10)',
												color: selectedJob.status === 'open' ? '#3a6827' : '#dc2626',
											}}
										/>
									</Box>
								</Box>

								<Box sx={{
									'& p': { fontSize: '0.88rem', lineHeight: 1.8, color: '#334155', mb: 1 },
									'& ul, & ol': { pl: 2.5, mb: 1 },
									'& li': { fontSize: '0.88rem', lineHeight: 1.8, color: '#334155', mb: 0.25 },
									'& strong': { fontWeight: 700, color: '#0f172a' },
									'& h1, & h2, & h3': { color: '#0f172a', mt: 2, mb: 1 },
								}}
									dangerouslySetInnerHTML={{ __html: selectedJob.description }}
								/>
							</Box>
						</Box>
					) : (
						<Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
							<WorkOutlineOutlinedIcon sx={{ fontSize: 40, color: '#cbd5e1' }} />
							<Typography sx={{ fontSize: '0.88rem', color: '#94a3b8' }}>
								{t('jobContent.selectJobToSeeDetails')}
							</Typography>
						</Box>
					)}
				</Box>
			</Box>

			{/* Create dialog */}
			<JobFormDialog
				open={createOpen}
				onClose={() => setCreateOpen(false)}
				onSave={handleCreateJob}
				title={t('jobContent.createJobPost')}
				jobTitle={jobTitle}
				setJobTitle={setJobTitle}
				jobDescription={jobDescription}
				setJobDescription={setJobDescription}
				loading={loading}
				saveLabel={t('jobContent.postJob')}
			/>

			{/* Edit dialog */}
			<JobFormDialog
				open={editOpen}
				onClose={() => setEditOpen(false)}
				onSave={handleEditJob}
				title={t('jobContent.editJobPost')}
				jobTitle={jobTitle}
				setJobTitle={setJobTitle}
				jobDescription={jobDescription}
				setJobDescription={setJobDescription}
				loading={loading}
				saveLabel={t('jobContent.updateJobPost')}
			/>

			{/* Delete confirmation */}
			<Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} PaperProps={{ sx: { borderRadius: 2.5 } }}>
				<DialogTitle sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
					{t('jobContent.deleteJobTitle')}
				</DialogTitle>
				<DialogContent>
					<DialogContentText sx={{ fontSize: '0.88rem', color: '#64748b' }}>
						{t('jobContent.deleteJobConfirmation')}
					</DialogContentText>
				</DialogContent>
				<DialogActions sx={{ px: 2, pb: 2, gap: 1 }}>
					<Button onClick={() => setDeleteDialogOpen(false)} sx={{ textTransform: 'none', color: '#64748b', borderRadius: 1.5 }}>
						{t('jobContent.cancel')}
					</Button>
					<Button onClick={handleDeleteJob} variant="contained" color="error" sx={{ textTransform: 'none', borderRadius: 1.5, boxShadow: 'none' }}>
						{t('jobContent.confirm')}
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export default JobContent;
