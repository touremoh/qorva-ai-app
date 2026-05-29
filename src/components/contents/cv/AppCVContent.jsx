import React, { useState, useEffect, useRef } from 'react';
import {
	Box,
	Button,
	Typography,
	CircularProgress,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	DialogActions,
	IconButton,
	Tooltip,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import ViewListIcon from '@mui/icons-material/ViewList';
import TableRowsIcon from '@mui/icons-material/TableRows';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AppCVDetails from './AppCVDetails.jsx';
import AppCVEntries from './AppCVEntries.jsx';
import { getCVs, uploadCVs, deleteCV } from '../../../services/cvService.js';

const MAX_FILES = 100;
const FILE_TYPE_PDF = 'application/pdf';
const FILE_TYPE_WORD = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

const AppCVContent = () => {
	const { t } = useTranslation();
	const [cvEntries, setCvEntries] = useState([]);
	const [totalPages, setTotalPages] = useState(0);
	const [totalElements, setTotalElements] = useState(0);
	const [selectedCV, setSelectedCV] = useState(null);
	const [viewMode, setViewMode] = useState('list');
	const [openUploadModal, setOpenUploadModal] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [selectedFiles, setSelectedFiles] = useState([]);
	const [isUploading, setIsUploading] = useState(false);
	const [isDragging, setIsDragging] = useState(false);
	const fileInputRef = useRef(null);

	const fetchCVEntries = async () => {
		try {
			const response = await getCVs({ pageSize: 25 });
			setCvEntries(response.data.data.content);
			setTotalPages(response.data.data.totalPages ?? 0);
			setTotalElements(response.data.data.totalElements ?? 0);
		} catch (error) {
			console.error('Error fetching CV entries:', error);
		}
	};

	useEffect(() => {
		fetchCVEntries().then(r => console.log('Fetch CV request done: ', r));
	}, []);

	const processFiles = (files) => {
		const valid = Array.from(files)
			.filter(f => f.type === FILE_TYPE_PDF || f.type === FILE_TYPE_WORD)
			.slice(0, MAX_FILES);
		setSelectedFiles(valid);
	};

	const handleFileSelect = (e) => processFiles(e.target.files);

	const handleDrop = (e) => {
		e.preventDefault();
		setIsDragging(false);
		processFiles(e.dataTransfer.files);
	};

	const handleUploadCV = async () => {
		if (selectedFiles.length === 0) return;
		try {
			setIsUploading(true);
			const formData = new FormData();
			selectedFiles.forEach(f => formData.append('files', f));
			const response = await uploadCVs(formData);
			if (response.status === 200) {
				await fetchCVEntries();
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
		if (!selectedCV) return;
		try {
			await deleteCV(selectedCV.id);
			setCvEntries(cvEntries.filter(cv => cv.id !== selectedCV.id));
			setSelectedCV(null);
			setDeleteDialogOpen(false);
		} catch (error) {
			console.error('Error deleting CV entry:', error);
		}
	};

	const showDetails = selectedCV !== null;

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', overflow: 'hidden', backgroundColor: '#f8fafc' }}>
			{/* Toolbar */}
			<Box sx={{
				display: 'flex',
				alignItems: 'center',
				gap: 1.5,
				py: 1.5,
				backgroundColor: '#ffffff',
				borderBottom: '1px solid #e2e8f0',
				borderRadius: 2,
				mb: 2,
				px: 2,
			}}>
				<Button
					startIcon={isUploading ? <CircularProgress size={16} color="inherit" /> : <FileUploadIcon />}
					variant="contained"
					disabled={isUploading}
					onClick={() => setOpenUploadModal(true)}
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
					{t('appCVContent.uploadCV')}
					<Box component="span" sx={{
						ml: 1, px: 0.75, py: 0.15,
						backgroundColor: 'rgba(255,255,255,0.22)',
						borderRadius: 0.75,
						fontSize: '0.72rem',
						fontWeight: 500,
						letterSpacing: '0.02em',
					}}>
						· up to {MAX_FILES}
					</Box>
				</Button>

				<Box sx={{ flexGrow: 1 }} />

				{/* View toggle */}
				<Box sx={{ display: 'flex', backgroundColor: '#f1f5f9', borderRadius: 1.5, p: 0.4, gap: 0.25 }}>
					<Tooltip title="List view">
						<IconButton
							size="small"
							onClick={() => setViewMode('list')}
							sx={{
								borderRadius: 1,
								color: viewMode === 'list' ? '#629C44' : '#94a3b8',
								backgroundColor: viewMode === 'list' ? '#ffffff' : 'transparent',
								boxShadow: viewMode === 'list' ? '0 1px 3px rgba(0,0,0,0.10)' : 'none',
								'&:hover': { backgroundColor: viewMode === 'list' ? '#ffffff' : 'rgba(0,0,0,0.04)' },
							}}
						>
							<ViewListIcon sx={{ fontSize: 18 }} />
						</IconButton>
					</Tooltip>
					<Tooltip title="Table view">
						<IconButton
							size="small"
							onClick={() => setViewMode('table')}
							sx={{
								borderRadius: 1,
								color: viewMode === 'table' ? '#629C44' : '#94a3b8',
								backgroundColor: viewMode === 'table' ? '#ffffff' : 'transparent',
								boxShadow: viewMode === 'table' ? '0 1px 3px rgba(0,0,0,0.10)' : 'none',
								'&:hover': { backgroundColor: viewMode === 'table' ? '#ffffff' : 'rgba(0,0,0,0.04)' },
							}}
						>
							<TableRowsIcon sx={{ fontSize: 18 }} />
						</IconButton>
					</Tooltip>
				</Box>
			</Box>

			{/* Split pane */}
			<Box sx={{
				display: 'flex',
				flex: 1,
				overflow: 'hidden',
				borderRadius: 2,
				border: '1px solid #e2e8f0',
				backgroundColor: '#ffffff',
			}}>
				{/* Left panel */}
				<Box sx={{
					width: viewMode === 'list' ? 300 : (showDetails ? '45%' : '100%'),
					flexShrink: 0,
					transition: 'width 0.2s ease',
					borderRight: (showDetails || viewMode === 'list') ? '1px solid #e2e8f0' : 'none',
					overflow: 'hidden',
					display: 'flex',
					flexDirection: 'column',
				}}>
					<AppCVEntries
						cvEntries={cvEntries}
						setSelectedCV={setSelectedCV}
						setDeleteDialogOpen={setDeleteDialogOpen}
						setCVEntries={setCvEntries}
						viewMode={viewMode}
						selectedCV={selectedCV}
						totalPages={totalPages}
						setTotalPages={setTotalPages}
						totalElements={totalElements}
						setTotalElements={setTotalElements}
					/>
				</Box>

				{/* Right panel */}
				{(viewMode === 'list' || showDetails) && (
					<Box sx={{ flex: 1, overflow: 'auto', minWidth: 0, backgroundColor: '#f8fafc' }}>
						{showDetails ? (
							<AppCVDetails cv={selectedCV} onClose={() => setSelectedCV(null)} />
						) : (
							<Box sx={{
								height: '100%',
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
								justifyContent: 'center',
								gap: 1.5,
							}}>
								<CloudUploadIcon sx={{ fontSize: 40, color: '#cbd5e1' }} />
								<Typography sx={{ fontSize: '0.88rem', color: '#94a3b8' }}>
									{t('appCVContent.selectCVToSeeDetails')}
								</Typography>
							</Box>
						)}
					</Box>
				)}
			</Box>

			{/* Upload Dialog */}
			<Dialog
				open={openUploadModal}
				onClose={() => !isUploading && setOpenUploadModal(false)}
				maxWidth="sm"
				fullWidth
				PaperProps={{ sx: { borderRadius: 3 } }}
			>
				<DialogTitle sx={{ px: 3, pt: 3, pb: 1, fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>
					{t('appCVContent.uploadCV')}
					<Typography sx={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 400, mt: 0.25 }}>
						{t('appCVContent.uploadCVInfo')}
					</Typography>
				</DialogTitle>
				<DialogContent sx={{ px: 3 }}>
					<Box
						onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
						onDragLeave={() => setIsDragging(false)}
						onDrop={handleDrop}
						onClick={() => fileInputRef.current?.click()}
						sx={{
							border: `2px dashed ${isDragging ? '#629C44' : '#cbd5e1'}`,
							borderRadius: 2,
							py: 4,
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							gap: 1,
							cursor: 'pointer',
							backgroundColor: isDragging ? 'rgba(98,156,68,0.04)' : '#f8fafc',
							transition: 'all 0.15s ease',
							'&:hover': { borderColor: '#629C44', backgroundColor: 'rgba(98,156,68,0.04)' },
						}}
					>
						<CloudUploadIcon sx={{ fontSize: 36, color: isDragging ? '#629C44' : '#94a3b8' }} />
						<Typography sx={{ fontSize: '0.88rem', fontWeight: 600, color: '#334155' }}>
							Drag & drop files here
						</Typography>
						<Typography sx={{ fontSize: '0.78rem', color: '#94a3b8' }}>
							or click to browse — .pdf or .docx, up to {MAX_FILES} files
						</Typography>
						<input
							ref={fileInputRef}
							type="file"
							accept=".pdf,.docx"
							multiple
							onChange={handleFileSelect}
							disabled={isUploading}
							style={{ display: 'none' }}
						/>
					</Box>

					{selectedFiles.length > 0 && (
						<Box sx={{ mt: 2, p: 1.5, backgroundColor: '#f0fdf4', borderRadius: 1.5, border: '1px solid #bbf7d0' }}>
							<Typography sx={{ fontSize: '0.82rem', color: '#16a34a', fontWeight: 600 }}>
								{selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} ready to upload
							</Typography>
						</Box>
					)}
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
					<Button
						onClick={() => { setOpenUploadModal(false); setSelectedFiles([]); }}
						disabled={isUploading}
						sx={{ textTransform: 'none', color: '#64748b', borderRadius: 1.5 }}
					>
						{t('appCVContent.cancel')}
					</Button>
					<Button
						onClick={handleUploadCV}
						disabled={isUploading || selectedFiles.length === 0}
						variant="contained"
						sx={{
							textTransform: 'none',
							backgroundColor: '#629C44',
							'&:hover': { backgroundColor: '#528035' },
							borderRadius: 1.5,
							boxShadow: 'none',
							fontWeight: 600,
							minWidth: 120,
						}}
					>
						{isUploading ? <CircularProgress size={18} color="inherit" /> : t('appCVContent.uploadFiles')}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<Dialog
				open={deleteDialogOpen}
				onClose={() => setDeleteDialogOpen(false)}
				PaperProps={{ sx: { borderRadius: 2.5 } }}
			>
				<DialogTitle sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
					{t('appCVContent.deleteCVTitle')}
				</DialogTitle>
				<DialogContent>
					<DialogContentText sx={{ fontSize: '0.88rem', color: '#64748b' }}>
						{t('appCVContent.deleteConfirmation')}
					</DialogContentText>
				</DialogContent>
				<DialogActions sx={{ px: 2, pb: 2, gap: 1 }}>
					<Button
						onClick={() => setDeleteDialogOpen(false)}
						sx={{ textTransform: 'none', color: '#64748b', borderRadius: 1.5 }}
					>
						{t('appCVContent.cancel')}
					</Button>
					<Button
						onClick={handleDeleteCV}
						variant="contained"
						color="error"
						sx={{ textTransform: 'none', borderRadius: 1.5, boxShadow: 'none' }}
					>
						{t('appCVContent.confirm')}
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export default AppCVContent;
