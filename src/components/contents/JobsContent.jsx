// eslint-disable-next-line no-unused-vars
import React, { useState } from 'react';
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
	DialogTitle
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import EditIcon from '@mui/icons-material/Edit';
import { useTranslation } from 'react-i18next';
import DeleteIcon from '@mui/icons-material/Delete';
//import axios from 'axios';


const JobContent = () => {
	const { t } = useTranslation();
	const [openModal, setOpenModal] = useState(false);
	const [editModalOpen, setEditModalOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [jobs, setJobs] = useState([]);
	const [selectedJob, setSelectedJob] = useState(null);
	const [jobTitle, setJobTitle] = useState('');
	const [jobDescription, setJobDescription] = useState('');


	const handleOpenEditModal = () => {
		if (selectedJob) {
			setJobTitle(selectedJob.title);
			setJobDescription(selectedJob.description);
			setEditModalOpen(true);
		}
	};

	const handleOpenModal = () => setOpenModal(true);
	const handleCloseModal = () => setOpenModal(false);
	const handleCloseEditModal = () => setEditModalOpen(false);
	const handleOpenDeleteDialog = () => setDeleteDialogOpen(true);
	const handleCloseDeleteDialog = () => setDeleteDialogOpen(false);

	const handleCreateJob = () => {
		if (jobTitle && jobDescription) {
			const newJob = {
				title: jobTitle,
				description: jobDescription,
				status: 'open',
			};
			setJobs([...jobs, newJob]);
			setJobTitle('');
			setJobDescription('');
			handleCloseModal();
		}
	};

	const handleJobClick = (job) => {
		setSelectedJob(job);
	};

	const handleEditJob = () => {
		if (selectedJob) {
			const updatedJobs = jobs.map((job) =>
				job.id === selectedJob.id ? { ...job, title: jobTitle, description: jobDescription } : job
			);
			setJobs(updatedJobs);
			setSelectedJob({ ...selectedJob, title: jobTitle, description: jobDescription });
			handleCloseEditModal();
		}
	};

	const handleToggleJobStatus = async () => {
		if (selectedJob) {
			const updatedStatus = selectedJob.status === 'open' ? 'closed' : 'open';
			try {
				// await axios.patch(`${process.env.REACT_APP_API_UPDATE_JOB_POST_URL}/${selectedJob.id}`, {
				// 	status: updatedStatus
				// });
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

	const handleDeleteJob = async () => {
		if (selectedJob) {
			try {
				// await axios.delete(`${process.env.REACT_APP_API_DELETE_JOB_POST_URL}/${selectedJob.id}`);
				const updatedJobs = jobs.filter((job) => job.id !== selectedJob.id);
				setJobs(updatedJobs);
				setSelectedJob(null);
				handleCloseDeleteDialog();
			} catch (error) {
				console.error('Error deleting job post:', error);
			}
		}
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
				backgroundColor: 'transparent',
				color: '#232F3E',
				padding: 2,
			}}
		>
			{/* Section 1: Create Job Button */}
			<Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
				<Button
					startIcon={<AddCircleIcon />}
					variant="contained"
					color="success"
					onClick={handleOpenModal}
					sx={{ borderRadius: '50px' }}
				>
					{t('jobContent.createJobPost')}
				</Button>
			</Box>

			{/* Modal for Creating Job Post */}
			<Modal open={openModal} onClose={handleCloseModal}>
				<Box
					sx={{
						position: 'absolute',
						top: '50%',
						left: '50%',
						transform: 'translate(-50%, -50%)',
						width: { xs: '90%', md: '40%' },
						backgroundColor: 'white',
						color: '#232F3E',
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
					<TextField
						label={t('jobContent.jobDescription')}
						fullWidth
						margin="normal"
						multiline
						rows={4}
						value={jobDescription}
						onChange={(e) => setJobDescription(e.target.value)}
						sx={{ resize: 'both' }}
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

			{/* Modal for Editing Job Post */}
			<Modal open={editModalOpen} onClose={handleCloseEditModal}>
				<Box
					sx={{
						position: 'absolute',
						top: '50%',
						left: '50%',
						transform: 'translate(-50%, -50%)',
						width: { xs: '90%', md: '40%' },
						backgroundColor: 'white',
						boxShadow: 24,
						color: '#232F3E',
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
					<TextField
						label={t('jobContent.jobDescription')}
						fullWidth
						margin="normal"
						multiline={true}
						minRows={10}
						value={jobDescription}
						onChange={(e) => setJobDescription(e.target.value)}
						sx={{resize: 'vertical'}}
					/>
					<Button
						variant="contained"
						color="primary"
						fullWidth
						sx={{ mt: 2 }}
						onClick={handleEditJob}
					>
						{t('jobContent.postJob')}
					</Button>
				</Box>
			</Modal>

			{/* Section 2: Job Listings and Details */}
			<Box sx={{ display: 'flex', width: '100%', mt: 4 }}>
				{/* Section 2.1: Job List */}
				<Box sx={{ width: '40%', height: '70vh', backgroundColor: 'white', padding: 2, boxShadow: 1, overflowY: 'scroll' }}>
					<Typography variant="h5" gutterBottom>
						{t('jobContent.jobListTitle')}
					</Typography>
					<Divider />
					{jobs.length === 0 ? (
						<Typography variant="body1">
							{t('jobContent.noJobPosts')}
						</Typography>
					) : (
						<List>
							{jobs.map((job, index) => (
								<ListItem
									divider={true}
									button
									key={index}
									onClick={() => handleJobClick(job)}
									sx={{ cursor: 'pointer' }}
								>
									<ListItemText primary={job.title} />
									<IconButton edge="end">
										<FiberManualRecordIcon color={job.status === 'open' ? 'success' : 'error'} />
									</IconButton>
								</ListItem>
							))}
						</List>
					)}
				</Box>

				{/* Section 2.2: Job Details */}
				<Paper sx={{ width: '55%', height: '70vh', padding: 2, boxShadow: 3, overflowY: 'scroll', backgroundColor: 'white', marginLeft: 5 }}>
					<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
						<Typography variant="h5" gutterBottom>
							{t('jobContent.jobDetailsTitle')}
						</Typography>
						{selectedJob && (
							<IconButton edge="end" onClick={handleOpenEditModal}>
								<EditIcon />
							</IconButton>
						)}
					</Box>
					<Divider sx={{marginBottom: 3}} />
					{selectedJob ? (
						<>
							<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
								<Typography variant="h5">{selectedJob.title}</Typography>
								<Switch
									checked={selectedJob.status === 'open'}
									onChange={handleToggleJobStatus}
									color="success"
									sx={{ borderRadius: 5 }}
								/>
							</Box>
							<Typography variant="inherit" align={'justify'} sx={{ mt: 2, height: '83%' }}>
								{selectedJob.description}
							</Typography>

							<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 0}}>
								<div></div>
								<IconButton
									edge="end"
									color="error"
									onClick={handleOpenDeleteDialog} >
									<DeleteIcon />
								</IconButton>

							</Box>
						</>
					) : (
						<Typography variant="body1">
							{t('jobContent.selectJobToSeeDetails')}
						</Typography>
					)}
				</Paper>
			</Box>

			{/* Dialog for Confirming Deletion */}
			<Dialog
				open={deleteDialogOpen}
				onClose={handleCloseDeleteDialog}
			>
				<DialogTitle>{t('jobContent.deleteJobTitle')}</DialogTitle>
				<DialogContent>
					<DialogContentText>
						{t('jobContent.deleteJobConfirmation')}
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCloseDeleteDialog} color="primary">
						{t('jobContent.cancel')}
					</Button>
					<Button onClick={handleDeleteJob} color="error">
						{t('jobContent.confirm')}
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export default JobContent;
