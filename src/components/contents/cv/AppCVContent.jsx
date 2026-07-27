// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect, useRef } from 'react';
import {
	Box,
	Button,
	Typography,
	CircularProgress,
	LinearProgress,
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
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import AppCVDetails from './AppCVDetails.jsx';
import AppCVEntries from './AppCVEntries.jsx';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import { getCVs, uploadCVs, deleteCV, replaceDuplicateCV } from '../../../services/cvService.js';
import { notifyQualityChanged, performQualityAction } from '../../../services/libraryQualityService.js';
import { isDemoUser } from '../../../utils/demoMode.js';
import UpgradeButton from '../../demo/UpgradeButton.jsx';

const MAX_FILES = 100;
const FILE_TYPE_PDF = 'application/pdf';
const FILE_TYPE_WORD = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

// The backend parses all uploaded resumes in parallel, so the wait is roughly
// constant (~45s max) regardless of how many files were selected.
const UPLOAD_ESTIMATE_SECONDS = 45;

// Maps elapsed seconds to a translation key describing what's happening
// server-side, so the user sees progress instead of a bare spinner.
const getUploadPhaseKey = (elapsed) => {
	if (elapsed < 8) return 'uploadPhase1';
	if (elapsed < 16) return 'uploadPhase2';
	if (elapsed < 24) return 'uploadPhase3';
	if (elapsed < 32) return 'uploadPhase4';
	if (elapsed < 40) return 'uploadPhase5';
	return 'uploadPhase6';
};

const AppCVContent = () => {
	const { t } = useTranslation();
	const demo = isDemoUser();
	const [cvEntries, setCvEntries] = useState([]);
	const [totalPages, setTotalPages] = useState(0);
	const [totalElements, setTotalElements] = useState(0);
	const [selectedCV, setSelectedCV] = useState(null);
	const [viewMode, setViewMode] = useState('table');
	const [showArchived, setShowArchived] = useState(false);
	const [openUploadModal, setOpenUploadModal] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [selectedFiles, setSelectedFiles] = useState([]);
	const [uploadResults, setUploadResults] = useState(null);
	const [isUploading, setIsUploading] = useState(false);
	const [uploadComplete, setUploadComplete] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [uploadElapsed, setUploadElapsed] = useState(0);
	const [isDragging, setIsDragging] = useState(false);
	const fileInputRef = useRef(null);
	const uploadTimerRef = useRef(null);
	const uploadStartRef = useRef(null);

	const handleUnarchive = async (cvId) => {
		try {
			await performQualityAction('UNARCHIVE', { cvIds: [cvId] });
			setCvEntries(prev => prev.filter(cv => cv.id !== cvId));
			if (selectedCV?.id === cvId) setSelectedCV(null);
			notifyQualityChanged();
		} catch (error) {
			console.error('Error unarchiving CV:', error);
		}
	};

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

	// Drive the upload progress bar / ETA / phase text while an upload is running.
	// Progress is capped at 95% so it never appears finished before the backend responds.
	useEffect(() => {
		if (isUploading) {
			uploadStartRef.current = Date.now();
			setUploadProgress(0);
			setUploadElapsed(0);
			uploadTimerRef.current = setInterval(() => {
				const elapsed = Math.floor((Date.now() - uploadStartRef.current) / 1000);
				setUploadElapsed(elapsed);
				setUploadProgress(Math.min(95, (elapsed / UPLOAD_ESTIMATE_SECONDS) * 100));
			}, 500);
		} else {
			clearInterval(uploadTimerRef.current);
		}
		return () => clearInterval(uploadTimerRef.current);
	}, [isUploading]);

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
				// Stop the ticking estimate, then keep the dialog open on the per-file results
				// screen — failures, parse warnings and duplicate collisions are resolved here.
				clearInterval(uploadTimerRef.current);
				setUploadProgress(100);
				setUploadComplete(true);
				await fetchCVEntries();
				notifyQualityChanged();
				setSelectedFiles([]);
				await new Promise(resolve => setTimeout(resolve, 600));
				setUploadResults(Array.isArray(response.data) ? response.data : []);
			}
		} catch (error) {
			console.error('Error uploading files:', error);
			setOpenUploadModal(false);
		} finally {
			setIsUploading(false);
			setUploadComplete(false);
		}
	};

	const handleCloseUploadDialog = () => {
		setOpenUploadModal(false);
		setSelectedFiles([]);
		setUploadResults(null);
	};

	const handleReplaceDuplicate = async (result) => {
		try {
			await replaceDuplicateCV(result.cv.id, result.match.existingCvId);
			setUploadResults(prev => prev.map(r => (r === result ? { ...r, resolution: 'REPLACED' } : r)));
			await fetchCVEntries();
			notifyQualityChanged();
		} catch (error) {
			console.error('Error replacing duplicate:', error);
		}
	};

	const handleKeepBoth = (result) => {
		setUploadResults(prev => prev.map(r => (r === result ? { ...r, resolution: 'KEPT' } : r)));
	};

	const handleReplaceAll = async () => {
		const pending = (uploadResults ?? []).filter(r => r.status === 'DUPLICATE_DETECTED' && !r.resolution);
		for (const result of pending) {
			// Sequential on purpose — each replace deletes a CV; parallel bursts add no value here.
			await handleReplaceDuplicate(result);
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
	const leftPanelWidth = viewMode === 'list' ? 300 : (showDetails ? '45%' : '100%');

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
				{demo ? (
					<UpgradeButton reason="cv-upload" variant="contained" size="medium" />
				) : (
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
				)}

				<Tooltip title={t('appCVContent.showArchivedTooltip', 'Show archived resumes')}>
					<Button
						startIcon={<Inventory2OutlinedIcon sx={{ fontSize: 16 }} />}
						variant="outlined"
						onClick={() => { setShowArchived(prev => !prev); setSelectedCV(null); }}
						sx={{
							borderColor: showArchived ? '#629C44' : '#e2e8f0',
							color: showArchived ? '#629C44' : '#64748b',
							backgroundColor: showArchived ? 'rgba(98,156,68,0.06)' : 'transparent',
							'&:hover': { borderColor: '#629C44', color: '#629C44', backgroundColor: 'rgba(98,156,68,0.04)' },
							borderRadius: 1.5,
							textTransform: 'none',
							fontWeight: 600,
							fontSize: '0.8rem',
							boxShadow: 'none',
							px: 1.5,
						}}
					>
						{t('appCVContent.archived', 'Archived')}
					</Button>
				</Tooltip>

				<Box sx={{ flexGrow: 1 }} />

				{/* View toggle */}
				<Box sx={{ display: 'flex', backgroundColor: '#f1f5f9', borderRadius: 1.5, p: 0.4, gap: 0.25 }}>
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
					width: leftPanelWidth,
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
						showArchived={showArchived}
						onUnarchive={handleUnarchive}
					/>
				</Box>

				{/* Right panel */}
				{(viewMode === 'list' || showDetails) && (
					<Box sx={{ flex: 1, overflow: 'auto', minWidth: 0, backgroundColor: '#f8fafc' }}>
						{showDetails ? (
							<AppCVDetails
								cv={selectedCV}
								onClose={() => setSelectedCV(null)}
								onUpdate={(updated) => {
									setSelectedCV(updated);
									setCvEntries(prev => prev.map(c => c.id === updated.id ? updated : c));
								}}
							/>
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
				onClose={() => !isUploading && handleCloseUploadDialog()}
				maxWidth="sm"
				fullWidth
				PaperProps={{ sx: { borderRadius: 3 } }}
			>
				<DialogTitle sx={{ px: 3, pt: 3, pb: 1, fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>
					{uploadResults ? t('appCVContent.uploadResults.title', 'Upload results') : t('appCVContent.uploadCV')}
					{!uploadResults && (
						<Typography sx={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 400, mt: 0.25 }}>
							{t('appCVContent.uploadCVInfo')}
						</Typography>
					)}
				</DialogTitle>
				<DialogContent sx={{ px: 3 }}>
					{uploadResults ? (
						<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, py: 0.5 }}>
							{uploadResults.filter(r => r.status === 'DUPLICATE_DETECTED' && !r.resolution).length > 1 && (
								<Button
									size="small"
									onClick={handleReplaceAll}
									sx={{ alignSelf: 'flex-end', textTransform: 'none', fontWeight: 600, color: '#629C44', fontSize: '0.76rem' }}
								>
									{t('appCVContent.uploadResults.replaceAll', 'Replace all old versions')}
								</Button>
							)}
							{uploadResults.map((result, i) => {
								const isDuplicate = result.status === 'DUPLICATE_DETECTED';
								const isFailed = result.status === 'FAILED';
								return (
									<Box key={i} sx={{
										border: '1px solid #e2e8f0', borderRadius: 1.5, px: 1.5, py: 1,
										display: 'flex', flexDirection: 'column', gap: 0.5,
									}}>
										<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
											{isFailed
												? <ErrorOutlineIcon sx={{ fontSize: 17, color: '#dc2626', flexShrink: 0 }} />
												: isDuplicate && !result.resolution
													? <WarningAmberRoundedIcon sx={{ fontSize: 17, color: '#f59e0b', flexShrink: 0 }} />
													: <CheckCircleRoundedIcon sx={{ fontSize: 17, color: '#16a34a', flexShrink: 0 }} />}
											<Typography sx={{ flex: 1, fontSize: '0.8rem', fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
												{result.fileName}
											</Typography>
											{result.warnings?.length > 0 && !isFailed && (
												<Typography sx={{ fontSize: '0.68rem', color: '#b45309', flexShrink: 0 }}>
													{result.warnings.map(w => t(`appCVContent.uploadWarnings.${w}`, w)).join(' · ')}
												</Typography>
											)}
										</Box>
										{isFailed && (
											<Typography sx={{ fontSize: '0.74rem', color: '#dc2626' }}>
												{t('appCVContent.uploadResults.failed', 'This file could not be processed.')}
											</Typography>
										)}
										{isDuplicate && (
											<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
												<Typography sx={{ flex: 1, fontSize: '0.74rem', color: '#64748b', minWidth: 180 }}>
													{result.resolution === 'REPLACED'
														? t('appCVContent.uploadResults.replaced', 'Old version replaced.')
														: result.resolution === 'KEPT'
															? t('appCVContent.uploadResults.kept', 'Both versions kept.')
															: t('appCVContent.uploadResults.duplicateOf', 'Matches existing {{name}} (added {{date}})', {
																name: result.match?.existingName || '—',
																date: result.match?.existingCreatedAt ? new Date(result.match.existingCreatedAt).toLocaleDateString() : '—',
															})}
												</Typography>
												{!result.resolution && (
													<>
														<Button size="small" onClick={() => handleReplaceDuplicate(result)}
															sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.72rem', color: '#629C44' }}>
															{t('appCVContent.uploadResults.replace', 'Replace old version')}
														</Button>
														<Button size="small" onClick={() => handleKeepBoth(result)}
															sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.72rem', color: '#64748b' }}>
															{t('appCVContent.uploadResults.keepBoth', 'Keep both')}
														</Button>
													</>
												)}
											</Box>
										)}
									</Box>
								);
							})}
						</Box>
					) : isUploading ? (
						/* Upload / processing progress — shows ETA and what's happening server-side */
						<Box sx={{
							py: 2.5,
							px: 2.5,
							my: 1,
							backgroundColor: 'rgba(98,156,68,0.05)',
							border: '1px solid rgba(98,156,68,0.2)',
							borderRadius: 2,
						}}>
							<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
									{uploadComplete
										? <CheckCircleRoundedIcon sx={{ fontSize: 18, color: '#16a34a' }} />
										: <CircularProgress size={14} thickness={5} sx={{ color: '#629C44' }} />}
									<Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: '#166534' }}>
										{uploadComplete
											? t('appCVContent.uploadComplete')
											: t('appCVContent.uploadProgressTitle')}
									</Typography>
								</Box>
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
									<Typography sx={{ fontSize: '0.78rem', color: '#629C44', fontWeight: 600 }}>
										{Math.round(uploadProgress)}%
									</Typography>
									{!uploadComplete && (
										<Typography sx={{ fontSize: '0.78rem', color: '#6b7280' }}>
											{uploadElapsed < UPLOAD_ESTIMATE_SECONDS
												? `~${Math.max(0, UPLOAD_ESTIMATE_SECONDS - uploadElapsed)}s ${t('appCVContent.remaining')}`
												: t('appCVContent.almostDone')}
										</Typography>
									)}
								</Box>
							</Box>
							<LinearProgress
								variant="determinate"
								value={uploadProgress}
								sx={{
									height: 8,
									borderRadius: 4,
									backgroundColor: 'rgba(98,156,68,0.12)',
									'& .MuiLinearProgress-bar': {
										borderRadius: 4,
										background: 'linear-gradient(90deg, #629C44 0%, #7cb342 60%, #aed581 100%)',
										transition: 'transform 0.5s linear',
									},
								}}
							/>
							{!uploadComplete && (
								<Typography sx={{ fontSize: '0.78rem', color: '#629C44', mt: 1, fontStyle: 'italic' }}>
									{t(`appCVContent.${getUploadPhaseKey(uploadElapsed)}`)}
								</Typography>
							)}
						</Box>
					) : (
						<>
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
						</>
					)}
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
					{uploadResults ? (
						<Button
							onClick={handleCloseUploadDialog}
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
							{t('appCVContent.uploadResults.done', 'Done')}
						</Button>
					) : (
						<>
							<Button
								onClick={handleCloseUploadDialog}
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
						</>
					)}
				</DialogActions>
			</Dialog>

			{/* Delete Confirmation Dialog — used for normal CV list mode */}
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
