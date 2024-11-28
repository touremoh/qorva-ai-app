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
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const AppCVContent = () => {
	const { t } = useTranslation();
	const [cvEntries, setCvEntries] = useState([]);
	const [selectedCV, setSelectedCV] = useState(null);
	const [openUploadModal, setOpenUploadModal] = useState(false);
	const [openCollectionModal, setOpenCollectionModal] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [collectionName, setCollectionName] = useState('');

	const handleUploadCV = (event) => {
		const file = event.target.files[0];
		if (file) {
			// Handle file upload logic here
		}
	};

	const handleOpenCollectionModal = () => setOpenCollectionModal(true);
	const handleCloseCollectionModal = () => setOpenCollectionModal(false);
	const handleCreateCollection = () => {
		// Logic for creating a CV collection
		handleCloseCollectionModal();
	};

	const handleDeleteCV = async () => {
		if (selectedCV) {
			try {
				await axios.delete(`${process.env.REACT_APP_API_DELETE_CV_ENTRY_URL}/${selectedCV.id}`);
				const updatedEntries = cvEntries.filter((cv) => cv.id !== selectedCV.id);
				setCvEntries(updatedEntries);
				setSelectedCV(null);
				setDeleteDialogOpen(false);
			} catch (error) {
				console.error('Error deleting CV entry:', error);
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
			{/* Section 1: Buttons for CV Upload and Collection */}
			<Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
				<Button
					startIcon={<AddCircleIcon />}
					variant="contained"
					color="success"
					onClick={() => setOpenUploadModal(true)}
					sx={{ borderRadius: '50px', mr: 2 }}
				>
					{t('appCVContent.uploadCV')}
				</Button>
				<Button
					startIcon={<AddCircleIcon />}
					variant="contained"
					color="success"
					onClick={handleOpenCollectionModal}
					sx={{ borderRadius: '50px' }}
				>
					{t('appCVContent.createCollection')}
				</Button>
			</Box>

			{/* Modal for Uploading CV */}
			<Modal open={openUploadModal} onClose={() => setOpenUploadModal(false)}>
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
						{t('appCVContent.uploadCV')}
					</Typography>
					<input
						type="file"
						accept="application/pdf"
						onChange={handleUploadCV}
					/>
				</Box>
			</Modal>

			{/* Modal for Creating CV Collection */}
			<Modal open={openCollectionModal} onClose={handleCloseCollectionModal}>
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
						{t('appCVContent.createCollection')}
					</Typography>
					<TextField
						label={t('appCVContent.collectionName')}
						fullWidth
						margin="normal"
						value={collectionName}
						onChange={(e) => setCollectionName(e.target.value)}
					/>
					<Button
						variant="contained"
						color="primary"
						fullWidth
						sx={{ mt: 2 }}
						onClick={handleCreateCollection}
					>
						{t('appCVContent.saveCollection')}
					</Button>
				</Box>
			</Modal>

			{/* Section 2: CV Entries List and Details */}
			<Box sx={{ display: 'flex', width: '100%', mt: 4 }}>
				{/* Section 2.1: CV List */}
				<Box sx={{ width: '40%', height: '60vh', backgroundColor: 'white', padding: 2, boxShadow: 1, overflowY: 'scroll' }}>
					<Typography variant="h5" gutterBottom>
						{t('appCVContent.cvListTitle')}
					</Typography>
					<Divider />
					{cvEntries.length === 0 ? (
						<Typography variant="body1">
							{t('appCVContent.noCVEntries')}
						</Typography>
					) : (
						<List>
							{cvEntries.map((cv, index) => (
								<ListItem
									divider={true}
									button
									key={index}
									onClick={() => setSelectedCV(cv)}
									sx={{ cursor: 'pointer' }}
								>
									<ListItemText primary={cv.personal_information.name} secondary={cv.personal_information.role} />
									<IconButton edge="end" color="error" onClick={() => setDeleteDialogOpen(true)}>
										<DeleteIcon />
									</IconButton>
								</ListItem>
							))}
						</List>
					)}
				</Box>

				{/* Section 2.2: CV Details */}
				<Paper sx={{ width: '55%', height: '60vh', padding: 2, boxShadow: 3, overflowY: 'scroll', backgroundColor: 'white', marginLeft: 5 }}>
					<Typography variant="h5" gutterBottom>
						{t('appCVContent.cvDetailsTitle')}
					</Typography>
					<Divider sx={{ marginBottom: 3 }} />
					{selectedCV ? (
						<>
							<Typography variant="h6">{selectedCV.personal_information.name}</Typography>
							<Typography variant="subtitle1">{selectedCV.personal_information.role}</Typography>
							<Typography variant="body2" sx={{ mt: 2 }}>
								{selectedCV.personal_information.summary}
							</Typography>
							{/* Render other CV details similarly */}
							<Box sx={{ marginTop: 4 }}>
								<Typography variant="h6">{t('appCVContent.attachment')}</Typography>
								<a href={selectedCV.attachment} target="_blank" rel="noopener noreferrer">
									{t('appCVContent.viewAttachment')}
								</a>
							</Box>
						</>
					) : (
						<Typography variant="body1">
							{t('appCVContent.selectCVToSeeDetails')}
						</Typography>
					)}
				</Paper>
			</Box>

			{/* Dialog for Confirming Deletion */}
			<Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
				<DialogTitle>{t('appCVContent.deleteCVTitle')}</DialogTitle>
				<DialogContent>
					<DialogContentText>
						{t('appCVContent.deleteConfirmation')}
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setDeleteDialogOpen(false)} color="primary">
						{t('appCVContent.cancel')}
					</Button>
					<Button onClick={handleDeleteCV} color="error">
						{t('appCVContent.confirm')}
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export default AppCVContent
