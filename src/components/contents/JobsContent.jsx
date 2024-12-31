import React, { useState, useEffect, useRef } from 'react';
import {
	Box,
	Button,
	Modal,
	TextField,
	List,
	ListItem,
	ListItemText,
	IconButton,
	Typography,
	Paper,
	Divider,
	Switch,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslation } from 'react-i18next';
import apiClient from "../../../axiosConfig.js";
import { default as ReactQuill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const JobContent = () => {
	const { t } = useTranslation();
	const [openModal, setOpenModal] = useState(false);
	const [editModalOpen, setEditModalOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [jobs, setJobs] = useState([]);
	const [selectedJob, setSelectedJob] = useState(null);
	const [jobTitle, setJobTitle] = useState('');
	const [jobDescription, setJobDescription] = useState('');
	const editorRef = useRef(null);

	useEffect(() => {
		const fetchJobs = async () => {
			try {
				const response = await apiClient.get(import.meta.env.VITE_APP_API_JOB_POSTS_URL);
				setJobs(response.data.data.content);
			} catch (error) {
				console.error('Error fetching job posts:', error.toJSON());
			}
		};
		fetchJobs();
	}, []);

	const handleOpenModal = () => setOpenModal(true);
	const handleCloseModal = () => setOpenModal(false);
	const handleCloseEditModal = () => setEditModalOpen(false);
	const handleOpenDeleteDialog = () => setDeleteDialogOpen(true);
	const handleCloseDeleteDialog = () => setDeleteDialogOpen(false);

	const handleCreateJob = async () => {
		if (jobTitle && jobDescription) {
			const newJob = { title: jobTitle, description: jobDescription, status: 'open' };
			try {
				const response = await apiClient.post(import.meta.env.VITE_APP_API_JOB_POSTS_URL, newJob);
				const createdJob = response.data?.data || null;
				if (createdJob) {
					setJobs((prevJobs) => [...prevJobs, createdJob]);
					setJobTitle('');
					setJobDescription('');
					handleCloseModal();
				}
			} catch (error) {
				console.error('Error creating job post:', error);
			}
		}
	};


	const handleEditJob = async () => {
		if (selectedJob && jobTitle && jobDescription) {
			const updatedJob = {
				...selectedJob, // Keep existing job details
				title: jobTitle, // Updated title
				description: jobDescription, // Updated description from ReactQuill
			};

			try {
				console.log('Updated job:', updatedJob);
				await apiClient.put(`${import.meta.env.VITE_APP_API_JOB_POSTS_URL}/${selectedJob.id}`, updatedJob);

				// Update the job in the state
				const updatedJobs = jobs.map((job) =>
					job.id === selectedJob.id ? updatedJob : job
				);
				setJobs(updatedJobs);

				// Update the selected job
				setSelectedJob(updatedJob);

				handleCloseEditModal();
			} catch (error) {
				console.error('Error updating job post:', error);
			}
		} else {
			console.error('Job title or description is missing.');
		}
	};


	const handleDeleteJob = async () => {
		if (selectedJob) {
			try {
				await apiClient.delete(`${import.meta.env.VITE_APP_API_JOB_POSTS_URL}/${selectedJob.id}`);
				setJobs(jobs.filter((job) => job.id !== selectedJob.id));
				setSelectedJob(null);
				handleCloseDeleteDialog();
			} catch (error) {
				console.error('Error deleting job post:', error);
			}
		}
	};

	const handleToggleJobStatus = async () => {
		if (selectedJob) {
			const updatedStatus = selectedJob.status === 'open' ? 'closed' : 'open';
			try {
				await apiClient.patch(`${import.meta.env.VITE_APP_API_JOB_POSTS_URL}/${selectedJob.id}`, {
					status: updatedStatus,
				});
				const updatedJobs = jobs.map((job) =>
					job.id === selectedJob.id ? { ...job, status: updatedStatus } : job
				);
				setJobs(updatedJobs);
				setSelectedJob({ ...selectedJob, status: updatedStatus });
			} catch (error) {
				console.error('Error updating job status:', error);
			}
		}
	};

	const handleJobClick = (job) => {
		setSelectedJob(job);
		setJobTitle(job.title);
		setJobDescription(job.description);
	};

	return (
		<Box
			sx={{
				width: '70vw',
				height: '100vh',
				marginLeft: { xs: '5%', md: '15%' },
				marginRight: { xs: '5%', md: '15%' },
				marginTop: 5,
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'flex-start',
				color: '#232F3E',
				padding: 2,
			}}
		>
			<Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
				<Button
					startIcon={<AddCircleIcon />}
					variant="contained"
					color="success"
					onClick={handleOpenModal}
				>
					{t('jobContent.createJobPost')}
				</Button>
			</Box>

			<Modal open={openModal} onClose={handleCloseModal}>
				<Box
					sx={{
						position: 'absolute',
						top: '50%',
						left: '50%',
						transform: 'translate(-50%, -50%)',
						width: { xs: '90%', md: '40%' },
						backgroundColor: 'white',
						boxShadow: 24,
						p: 4,
					}}
				>
					<Typography variant="h6" gutterBottom>
						{t('jobContent.createJobPost')}
					</Typography>
					<TextField
						label={t('jobContent.jobTitle')}
						fullWidth
						margin="normal"
						value={jobTitle}
						onChange={(e) => setJobTitle(e.target.value)}
					/>

					<ReactQuill
						ref={editorRef}
						theme="snow"
						value={jobDescription}
						onChange={setJobDescription}
						style={{ height: '600px', marginBottom: '20px' }}
					/>
					<Button
						variant="contained"
						color="primary"
						fullWidth
						sx={{ mt: 2 }}
						onClick={handleCreateJob}
					>
						{t('jobContent.postJob')}
					</Button>
				</Box>
			</Modal>

			<Modal open={editModalOpen} onClose={handleCloseEditModal}>
				<Box
					sx={{
						position: 'absolute',
						top: '50%',
						left: '50%',
						transform: 'translate(-50%, -50%)',
						width: { xs: '90%', md: '40%' },
						backgroundColor: 'white',
						color: 'black',
						boxShadow: 24,
						p: 4,
					}}
				>
					<Typography variant="h6" gutterBottom>
						{t('jobContent.editJobPost')}
					</Typography>
					<TextField
						label={t('jobContent.jobTitle')}
						fullWidth
						margin="normal"
						value={jobTitle}
						onChange={(e) => setJobTitle(e.target.value)}
					/>

					<ReactQuill
						ref={editorRef}
						theme="snow"
						value={jobDescription}
						onChange={setJobDescription}
						style={{ height: '600px', marginBottom: '20px' }}
					/>
					<Button
						variant="contained"
						color="primary"
						fullWidth
						sx={{ mt: 2 }}
						onClick={handleEditJob}
					>
						{t('jobContent.updateJobPost')}
					</Button>
				</Box>
			</Modal>

			<Box sx={{ display: 'flex', width: '100%', mt: 4 }}>
				{/* Job List */}
				<Box sx={{ width: '40%', height: '75vh', backgroundColor: 'white', padding: 2, boxShadow: 1, overflowY: 'scroll' }}>
					<Typography variant="h5" gutterBottom>
						{t('jobContent.jobListTitle')}
					</Typography>
					<Divider />
					{jobs.length === 0 ? (
						<Typography>{t('jobContent.noJobPosts')}</Typography>
					) : (
						<List>
							{jobs.map((job, index) => (
								<React.Fragment key={job.id || index}>
									<ListItem button={"true"} onClick={() => handleJobClick(job)} sx={{cursor: 'pointer', position: 'relative'}}>
										<ListItemText primary={job.title} />
										<IconButton>
											<FiberManualRecordIcon color={job.status === 'open' ? 'success' : 'error'} />
										</IconButton>
									</ListItem>
									<Divider />
								</React.Fragment>
							))}
						</List>
					)}
				</Box>

				{/* Job Details */}
				<Paper sx={{ width: '55%', height: '75vh', padding: 2, boxShadow: 1, overflowY: 'scroll', marginLeft: 5 }}>
					{selectedJob ? (
						<>
							<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
								<Switch
									checked={selectedJob.status === 'open'}
									onChange={handleToggleJobStatus}
									color="success"
								/>
								<IconButton onClick={() => setEditModalOpen(true)}>
									<EditIcon />
								</IconButton>
							</Box>
							<Typography variant="h5" gutterBottom sx={{textAlign: 'justify'}}>
								{selectedJob.title}
							</Typography>
							<Typography
								component="div"
								dangerouslySetInnerHTML={{ __html: selectedJob?.description }}
								sx={{
									textAlign: 'justify', // Justify text
									lineHeight: 1.5, // Adjust line height for better readability
									marginTop: 2, // Add spacing from the title
									color: '#333', // Optional: Set a readable color
								}}
							/>

							<Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: 2 }}>
								<IconButton color="error" onClick={handleOpenDeleteDialog}>
									<DeleteIcon />
								</IconButton>
							</Box>
						</>
					) : (
						<Typography>{t('jobContent.selectJobToSeeDetails')}</Typography>
					)}
				</Paper>
			</Box>

			<Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
				<DialogTitle>{t('jobContent.deleteJobTitle')}</DialogTitle>
				<DialogContent>
					<DialogContentText>{t('jobContent.deleteJobConfirmation')}</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCloseDeleteDialog}>{t('jobContent.cancel')}</Button>
					<Button onClick={handleDeleteJob} color="error">
						{t('jobContent.confirm')}
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export default JobContent;
