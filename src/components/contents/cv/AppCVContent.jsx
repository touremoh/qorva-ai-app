// eslint-disable-next-line no-unused-vars
import React, { useState } from 'react';
import {
	Box,
	Button,
	Modal,
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
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import AppCVDetails from "./AppCVDetails.jsx";
import cvEntriesMock from "../../../mocks.js";
import AppCVEntries from "./AppCVEntries.jsx";

const AppCVContent = () => {
	const { t } = useTranslation();
	const [cvEntries, setCvEntries] = useState(cvEntriesMock);
	const [selectedCV, setSelectedCV] = useState(null);
	const [openUploadModal, setOpenUploadModal] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [selectedFile, setSelectedFile] = useState(null);

	const handleUploadCV = (event) => {
		const file = event.target.files[0];
		if (file) {
			setSelectedFile(file);
			console.log('Uploading file: ', file);
			// Handle file upload logic here
		}
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
			{/* Section 1: Buttons for CV Upload */}
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
			</Box>

			{/* Modal for Uploading CV */}
			<Modal open={openUploadModal} onClose={() => setOpenUploadModal(false)}>
				<Box
					sx={{
						position: 'absolute',
						top: '50%',
						left: '50%',
						transform: 'translate(-50%, -50%)',
						width: { xs: '100%', md: '40%' },
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
					{selectedFile && (
						<Button
							variant="contained"
							color="primary"
							fullWidth
							sx={{ mt: 2 }}
							onClick={() => {
								setOpenUploadModal(false);
								setSelectedFile(null);
							}}
						>
							{t('appCVContent.saveAndClose')}
						</Button>
					)}
				</Box>
			</Modal>

			{/* Section 2: CV Entries List and Details */}
			<Box sx={{ display: 'flex', width: '100%', mt: 4 }}>
				{/* Section 2.1: CV List */}
				<AppCVEntries cvEntries={cvEntries} setDeleteDialogOpen={setDeleteDialogOpen} setSelectedCV={setSelectedCV} />

				{/* Section 2.2: CV Details */}
				<Paper sx={{ width: '70%', height: '75vh', padding: 2, boxShadow: 3, overflowY: 'scroll', backgroundColor: 'white', marginLeft: 5, alignItems: 'left' }}>
					<Typography variant="h5" gutterBottom>
						{t('appCVContent.cvDetailsTitle')}
					</Typography>
					<Divider sx={{ marginBottom: 3 }} />
					{selectedCV ? (
						<>
							<AppCVDetails cv={selectedCV} />
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

export default AppCVContent;
