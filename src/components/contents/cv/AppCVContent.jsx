// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
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
	CircularProgress
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { useTranslation } from 'react-i18next';
import AppCVDetails from "./AppCVDetails.jsx";
import AppCVEntries from "./AppCVEntries.jsx";
import apiClient, { apiFormDataClient } from "../../../../axiosConfig.js";

const AppCVContent = () => {
	const { t } = useTranslation();
	const [cvEntries, setCvEntries] = useState([]);
	const [selectedCV, setSelectedCV] = useState(null);
	const [openUploadModal, setOpenUploadModal] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [selectedFiles, setSelectedFiles] = useState([]);
	const [isUploading, setIsUploading] = useState(false);
	const FILE_TYPE_PDF = 'application/pdf';
	const FILE_TYPE_WORD = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

	const fetchCVEntries = async (pageNumber = 0, pageSize = 10) => {
		try {
			const response = await apiClient.get(import.meta.env.VITE_APP_API_CV_URL, {
				headers: {
					Authorization: `Bearer ${localStorage.getItem('authToken')}`,
				},
				params: {
					pageNumber,
					pageSize
				}
			});
			setCvEntries(response.data.data.content);
		} catch (error) {
			console.error('Error fetching CV entries:', error);
		}
	};

	useEffect(() => {
		fetchCVEntries(0,500);
	}, []);

	const handleFileSelect = (event) => {
		const files = Array.from(event.target.files);
		const validFiles = files.filter(
			(file) => file.type === FILE_TYPE_PDF || file.type === FILE_TYPE_WORD
		);
		if (validFiles.length > 10) {
			console.error('You can upload a maximum of 10 files at a time.');
			return;
		}
		setSelectedFiles(validFiles);
	};

	const handleUploadCV = async () => {
		if (selectedFiles.length === 0) {
			console.error('No files selected.');
			return;
		}
		try {
			setIsUploading(true);

			const formData = new FormData();
			selectedFiles.forEach((file) => formData.append('files', file));

			const response = await apiFormDataClient.post(
				import.meta.env.VITE_APP_API_CV_UPLOAD_URL,
				formData,
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem('authToken')}`,
					},
				}
			);
			// Fetch the updated CV list after successful upload
			if (response.status === 200) {
				await fetchCVEntries(0, 500);
				setSelectedFiles([]);
			}
		} catch (error) {
			console.error('Error uploading files:', error);
		} finally {
			setIsUploading(false);
			setOpenUploadModal(false);
		}
	};

	const handleDeleteCV = async () => {
		if (selectedCV) {
			try {
				await apiClient.delete(`${import.meta.env.VITE_APP_API_CV_URL}/${selectedCV.id}`, {
					headers: {
						Authorization: `Bearer ${localStorage.getItem('authToken')}`,
					},
				});
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
					disabled={isUploading}
				>
					{isUploading ? <CircularProgress size={24} /> : t('appCVContent.uploadCV')}
				</Button>
			</Box>

			{/* Modal for Uploading CV */}
			<Modal open={openUploadModal} onClose={() => !isUploading && setOpenUploadModal(false)}>
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
					<Typography color={"textSecondary"} gutterBottom>
						{t('appCVContent.uploadCVInfo')}
					</Typography>
					<input
						type="file"
						accept=".pdf,.docx"
						multiple
						onChange={handleFileSelect}
						disabled={isUploading}
					/>
					{selectedFiles.length > 0 && (
						<Box>
							<Button
								variant="contained"
								color="primary"
								fullWidth
								sx={{ mt: 2 }}
								onClick={handleUploadCV}
								disabled={isUploading}
							>
								{isUploading ? <CircularProgress size={24} /> : t('appCVContent.uploadFiles')}
							</Button>
							{isUploading && (
								<Typography
									variant="body2"
									sx={{ mt: 2, textAlign: 'center', color: 'gray' }}
								>
									{t('appCVContent.uploadInProgress')}
								</Typography>
							)}
						</Box>
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
					<Button onClick={() => setDeleteDialogOpen(false)} color="primary" disabled={isUploading}>
						{t('appCVContent.cancel')}
					</Button>
					<Button onClick={handleDeleteCV} color="error" disabled={isUploading}>
						{t('appCVContent.confirm')}
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export default AppCVContent;
