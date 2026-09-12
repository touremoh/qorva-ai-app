// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect, useRef, useCallback } from 'react';
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
	useMediaQuery,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import AppCVDetails from './AppCVDetails.jsx';
import AppCVEntries from './AppCVEntries.jsx';
import CVFilterRail from './CVFilterRail.jsx';
import useCVFilters from './useCVFilters.js';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import { toast } from 'sonner';
import { uploadCVs, deleteCV, replaceDuplicateCV, getClearLibraryPreflight, clearLibrary, getCVFilterOptions } from '../../../services/cvService.js';
import { notifyQualityChanged, performQualityAction } from '../../../services/libraryQualityService.js';
import {
	createBulkUpload,
	stageBulkFiles,
	startBulkUpload,
	cancelBulkUpload,
} from '../../../services/bulkUploadService.js';
import { getUsageMonitoring } from '../../../services/usageMonitoringService.js';
import { useBulkImport, CVS_CHANGED_EVENT } from '../../../contexts/BulkImportContext.jsx';
import { isDemoUser, openUpgradeDialog } from '../../../utils/demoMode.js';
import UpgradeButton from '../../demo/UpgradeButton.jsx';

// Batches up to this size use the original synchronous upload (inline per-file
// results); anything larger goes through the asynchronous bulk-import job.
const SYNC_MAX_FILES = 20;
// Staging requests stay at or below the backend chunk cap (and Tomcat's part limit).
const BULK_CHUNK_SIZE = 50;
// Chunks upload concurrently (the backend appends atomically), shrinking the staging wait.
const STAGING_PARALLELISM = 3;
// Plan cap fallback until /usage-monitoring/current answers (Starter tier value).
const FALLBACK_BULK_LIMIT = 100;
// Above this, a second click is required — the import bills one screening action per file.
const BULK_CONFIRM_THRESHOLD = 300;
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
	const [showArchived, setShowArchived] = useState(false);

	// Filter state is shared by the rail (edits) and the list (queries); bumping refreshKey
	// makes the list re-fetch with the current filters and the rail reload its option counts.
	const cvFilters = useCVFilters();
	const [refreshKey, setRefreshKey] = useState(0);
	const refreshList = useCallback(() => setRefreshKey(k => k + 1), []);
	const [filterOptions, setFilterOptions] = useState(null);
	const [filterOptionsLoading, setFilterOptionsLoading] = useState(false);
	const [railEverOpened, setRailEverOpened] = useState(false);
	// Below this width a persistent third column would starve the details pane, so the rail overlays.
	const railPersistent = useMediaQuery('(min-width:1200px)');
	const [openUploadModal, setOpenUploadModal] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [selectedFiles, setSelectedFiles] = useState([]);
	const [uploadResults, setUploadResults] = useState(null);
	const [isUploading, setIsUploading] = useState(false);
	const [uploadComplete, setUploadComplete] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [uploadElapsed, setUploadElapsed] = useState(0);
	const [isDragging, setIsDragging] = useState(false);
	// Bulk-import state: plan cap, dropped-file notices, job lifecycle and summary.
	const [bulkLimit, setBulkLimit] = useState(FALLBACK_BULK_LIMIT);
	const [droppedInfo, setDroppedInfo] = useState(null); // { rejected, overCap }
	const [confirmBulk, setConfirmBulk] = useState(false);
	const [bulkJobId, setBulkJobId] = useState(null);
	const [bulkStage, setBulkStage] = useState(null); // 'staging' | 'processing'
	const [bulkStaged, setBulkStaged] = useState(0);
	const [bulkTotal, setBulkTotal] = useState(0);
	const [bulkSummary, setBulkSummary] = useState(null); // terminal JobView
	const fileInputRef = useRef(null);
	const uploadTimerRef = useRef(null);
	const uploadStartRef = useRef(null);

	// Job progress is owned by the app-level provider, so it survives closing this
	// dialog, switching tabs, and page refreshes.
	const bulkImport = useBulkImport();
	const bulkView = bulkImport?.activeJob ?? null;

	// The plan's bulk-import cap rides on the usage snapshot; fall back to the
	// Starter value if the call fails so the picker still works.
	useEffect(() => {
		getUsageMonitoring()
			.then(resp => {
				const cap = resp?.data?.bulkUploadFilesLimit;
				if (Number.isInteger(cap) && cap > 0) setBulkLimit(cap);
			})
			.catch(() => {});
	}, []);

	// Refresh the library whenever a bulk import finishes anywhere in the app.
	useEffect(() => {
		window.addEventListener(CVS_CHANGED_EVENT, refreshList);
		return () => window.removeEventListener(CVS_CHANGED_EVENT, refreshList);
	}, [refreshList]);

	// Facet options are fetched lazily the first time the rail opens, then kept in step with
	// the archived toggle and every library change (upload, delete, unarchive, clear).
	useEffect(() => {
		if (cvFilters.filtersOpen) setRailEverOpened(true);
	}, [cvFilters.filtersOpen]);
	useEffect(() => {
		if (!railEverOpened) return;
		let cancelled = false;
		setFilterOptionsLoading(true);
		getCVFilterOptions({ archived: showArchived })
			.then(resp => { if (!cancelled) setFilterOptions(resp.data); })
			.catch(error => console.error('Error loading CV filter options:', error))
			.finally(() => { if (!cancelled) setFilterOptionsLoading(false); });
		return () => { cancelled = true; };
	}, [railEverOpened, showArchived, refreshKey]);

	// The provider flips its summary when the watched job reaches a terminal state;
	// if our dialog is showing the processing view, switch it to the summary screen.
	const providerSummary = bulkImport?.summary;
	useEffect(() => {
		if (bulkStage === 'processing' && providerSummary) {
			setBulkSummary(providerSummary);
			bulkImport?.clearSummary();
			setBulkStage(null);
			setBulkJobId(null);
			setIsUploading(false);
			setSelectedFiles([]);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [providerSummary, bulkStage]);

	const handleUnarchive = async (cvId) => {
		try {
			await performQualityAction('UNARCHIVE', { cvIds: [cvId] });
			setCvEntries(prev => prev.filter(cv => cv.id !== cvId));
			if (selectedCV?.id === cvId) setSelectedCV(null);
			refreshList();
			notifyQualityChanged();
		} catch (error) {
			console.error('Error unarchiving CV:', error);
		}
	};

	// Drive the upload progress bar / ETA / phase text while a *synchronous* upload is
	// running (bulk imports report real counts instead of an estimate).
	// Progress is capped at 95% so it never appears finished before the backend responds.
	useEffect(() => {
		if (isUploading && !bulkStage) {
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
	}, [isUploading, bulkStage]);

	// Never drop files silently: unsupported types and over-cap excess are announced,
	// and blowing past the plan cap doubles as an upgrade moment.
	const processFiles = (files) => {
		const all = Array.from(files);
		const valid = all.filter(f => f.type === FILE_TYPE_PDF || f.type === FILE_TYPE_WORD);
		const rejected = all.length - valid.length;
		const capped = valid.slice(0, bulkLimit);
		const overCap = valid.length - capped.length;
		if (overCap > 0) openUpgradeDialog('bulk-upload-limit');
		setDroppedInfo(rejected > 0 || overCap > 0 ? { rejected, overCap } : null);
		setConfirmBulk(false);
		setSelectedFiles(capped);
	};

	const handleFileSelect = (e) => processFiles(e.target.files);

	const handleDrop = (e) => {
		e.preventDefault();
		setIsDragging(false);
		processFiles(e.dataTransfer.files);
	};

	const handleUploadCV = async () => {
		if (selectedFiles.length === 0) return;
		if (selectedFiles.length <= SYNC_MAX_FILES) {
			return handleSyncUpload();
		}
		// Large imports bill one screening action per file — ask for a second click first.
		if (selectedFiles.length > BULK_CONFIRM_THRESHOLD && !confirmBulk) {
			setConfirmBulk(true);
			return;
		}
		return handleBulkUpload();
	};

	const handleSyncUpload = async () => {
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
				refreshList();
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

	// Bulk path: create draft job → stage chunks (fast, S3-only) → start → poll.
	// Extraction runs server-side in a background worker, so this survives request
	// timeouts and the user can cancel or close the dialog mid-import.
	const handleBulkUpload = async () => {
		const files = selectedFiles;
		try {
			setConfirmBulk(false);
			setBulkStage('staging');
			setBulkStaged(0);
			setBulkTotal(files.length);
			setIsUploading(true);

			const createResp = await createBulkUpload();
			const jobId = createResp.data.jobId;
			setBulkJobId(jobId);

			// Chunks upload through a small worker pool; the backend append is atomic,
			// so parallel chunks never clobber each other.
			const chunks = [];
			for (let i = 0; i < files.length; i += BULK_CHUNK_SIZE) {
				chunks.push(files.slice(i, i + BULK_CHUNK_SIZE));
			}
			let nextChunk = 0;
			const stageWorker = async () => {
				for (;;) {
					const my = nextChunk++;
					if (my >= chunks.length) return;
					const formData = new FormData();
					chunks[my].forEach(f => formData.append('files', f));
					try {
						await stageBulkFiles(jobId, formData);
					} catch (chunkError) {
						// One retry per chunk — a transient network error must not lose the batch.
						console.warn('Retrying staging chunk after error:', chunkError);
						await stageBulkFiles(jobId, formData);
					}
					setBulkStaged(prev => Math.min(prev + chunks[my].length, files.length));
				}
			};
			await Promise.all(Array.from(
				{ length: Math.min(STAGING_PARALLELISM, chunks.length) }, stageWorker));

			await startBulkUpload(jobId);
			setBulkStage('processing');
			// From here the app-level provider owns polling, toasts and list refreshes.
			bulkImport?.watchJob(jobId);
		} catch (error) {
			console.error('Error running bulk import:', error);
			setBulkStage(null);
			setBulkJobId(null);
			setIsUploading(false);
		}
	};

	const handleCancelBulk = async () => {
		try {
			if (bulkJobId) await cancelBulkUpload(bulkJobId);
		} catch (error) {
			console.error('Error cancelling bulk import:', error);
		} finally {
			// The provider observes CANCELLED on its next poll and toasts it.
			handleCloseUploadDialog();
		}
	};

	// Closing during 'processing' hands the job fully to the app-level provider:
	// the header chip keeps showing progress and the library refreshes on completion.
	const handleContinueInBackground = () => {
		setBulkStage(null);
		setBulkJobId(null);
		setIsUploading(false);
		setSelectedFiles([]);
		setOpenUploadModal(false);
	};

	const handleCloseUploadDialog = () => {
		setOpenUploadModal(false);
		setSelectedFiles([]);
		setUploadResults(null);
		setDroppedInfo(null);
		setConfirmBulk(false);
		setBulkStage(null);
		setBulkJobId(null);
		setBulkSummary(null);
		setIsUploading(false);
	};

	const handleReplaceDuplicate = async (result) => {
		try {
			await replaceDuplicateCV(result.cv.id, result.match.existingCvId);
			setUploadResults(prev => prev.map(r => (r === result ? { ...r, resolution: 'REPLACED' } : r)));
			refreshList();
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

	// Clear-library: the most destructive action in the product — preflight counts in
	// the dialog, and the user must type DELETE before the button arms.
	const [clearDialogOpen, setClearDialogOpen] = useState(false);
	const [clearPreflight, setClearPreflight] = useState(null);
	const [clearConfirmText, setClearConfirmText] = useState('');
	const [clearing, setClearing] = useState(false);

	const handleOpenClearDialog = async () => {
		setClearConfirmText('');
		setClearPreflight(null);
		setClearDialogOpen(true);
		try {
			const resp = await getClearLibraryPreflight();
			setClearPreflight(resp.data);
		} catch (error) {
			console.error('Clear-library preflight failed:', error);
		}
	};

	const handleClearLibrary = async () => {
		try {
			setClearing(true);
			const resp = await clearLibrary();
			const result = resp.data;
			toast.success(t('appCVContent.clearLibrary.done', 'Library cleared — {{cvs}} resumes, {{reports}} reports and {{chats}} chats removed.', {
				cvs: result?.cvs ?? 0, reports: result?.reports ?? 0, chats: result?.chats ?? 0 }));
			setClearDialogOpen(false);
			setSelectedCV(null);
			refreshList();
			notifyQualityChanged();
		} catch (error) {
			console.error('Clear library failed:', error);
		} finally {
			setClearing(false);
		}
	};

	const handleDeleteCV = async () => {
		if (!selectedCV) return;
		try {
			await deleteCV(selectedCV.id);
			setCvEntries(cvEntries.filter(cv => cv.id !== selectedCV.id));
			setSelectedCV(null);
			setDeleteDialogOpen(false);
			refreshList();
		} catch (error) {
			console.error('Error deleting CV entry:', error);
		}
	};

	const showDetails = selectedCV !== null;
	const leftPanelWidth = 300;

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
							· up to {bulkLimit}
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

				{!demo && (
					<Tooltip title={t('appCVContent.clearLibrary.tooltip', 'Clear the whole library…')}>
						<IconButton
							size="small"
							onClick={handleOpenClearDialog}
							sx={{
								borderRadius: 1.5,
								color: '#94a3b8',
								'&:hover': { color: '#dc2626', backgroundColor: 'rgba(220,38,38,0.06)' },
							}}
						>
							<DeleteForeverOutlinedIcon sx={{ fontSize: 19 }} />
						</IconButton>
					</Tooltip>
				)}

				<Box sx={{ flexGrow: 1 }} />
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
				{/* Filter rail — persistent column on wide screens, overlay drawer otherwise */}
				<CVFilterRail
					open={cvFilters.filtersOpen}
					onClose={() => cvFilters.setFiltersOpen(false)}
					persistent={railPersistent}
					filters={cvFilters.filters}
					setFilter={cvFilters.setFilter}
					onClearAll={cvFilters.clearFilters}
					activeCount={cvFilters.activeCount}
					sort={cvFilters.sort}
					setSort={cvFilters.setSort}
					options={filterOptions}
					loading={filterOptionsLoading}
				/>

				{/* Left panel */}
				<Box sx={{
					width: leftPanelWidth,
					flexShrink: 0,
					borderRight: '1px solid #e2e8f0',
					overflow: 'hidden',
					display: 'flex',
					flexDirection: 'column',
				}}>
					<AppCVEntries
						cvEntries={cvEntries}
						setSelectedCV={setSelectedCV}
						setDeleteDialogOpen={setDeleteDialogOpen}
						setCVEntries={setCvEntries}
						selectedCV={selectedCV}
						totalPages={totalPages}
						setTotalPages={setTotalPages}
						totalElements={totalElements}
						setTotalElements={setTotalElements}
						showArchived={showArchived}
						onUnarchive={handleUnarchive}
						filters={cvFilters.filters}
						sort={cvFilters.sort}
						activeCount={cvFilters.activeCount}
						filtersOpen={cvFilters.filtersOpen}
						onToggleFilters={() => cvFilters.setFiltersOpen(!cvFilters.filtersOpen)}
						onClearFilters={cvFilters.clearFilters}
						refreshKey={refreshKey}
					/>
				</Box>

				{/* Right panel */}
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
					{(uploadResults || bulkSummary) ? t('appCVContent.uploadResults.title', 'Upload results') : t('appCVContent.uploadCV')}
					{!uploadResults && !bulkSummary && (
						<Typography sx={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 400, mt: 0.25 }}>
							{t('appCVContent.uploadCVInfo', { max: bulkLimit })}
						</Typography>
					)}
				</DialogTitle>
				<DialogContent sx={{ px: 3 }}>
					{bulkSummary ? (
						/* Bulk import finished — aggregate summary (duplicates surface in Library Quality) */
						<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, py: 0.5 }}>
							<Box sx={{
								py: 2, px: 2,
								backgroundColor: bulkSummary.failed > 0 || bulkSummary.skipped > 0 ? '#fffbeb' : '#f0fdf4',
								border: `1px solid ${bulkSummary.failed > 0 || bulkSummary.skipped > 0 ? '#fde68a' : '#bbf7d0'}`,
								borderRadius: 2,
								display: 'flex', alignItems: 'center', gap: 1.25,
							}}>
								{bulkSummary.status === 'CANCELLED'
									? <ErrorOutlineIcon sx={{ fontSize: 22, color: '#64748b' }} />
									: bulkSummary.failed > 0 || bulkSummary.skipped > 0
										? <WarningAmberRoundedIcon sx={{ fontSize: 22, color: '#f59e0b' }} />
										: <CheckCircleRoundedIcon sx={{ fontSize: 22, color: '#16a34a' }} />}
								<Box>
									<Typography sx={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a' }}>
										{bulkSummary.status === 'CANCELLED'
											? t('appCVContent.bulk.cancelled', 'Import cancelled')
											: t('appCVContent.bulk.imported', '{{succeeded}} of {{total}} resumes imported', {
												succeeded: bulkSummary.succeeded, total: bulkSummary.total })}
									</Typography>
									<Typography sx={{ fontSize: '0.78rem', color: '#64748b' }}>
										{bulkSummary.failed > 0 && t('appCVContent.bulk.failedCount', '{{count}} failed', { count: bulkSummary.failed })}
										{bulkSummary.failed > 0 && bulkSummary.skipped > 0 && ' · '}
										{bulkSummary.skipped > 0 && (bulkSummary.failureReason === 'quota_exceeded'
											? t('appCVContent.bulk.skippedQuota', '{{count}} skipped — your plan\'s screening limit was reached', { count: bulkSummary.skipped })
											: t('appCVContent.bulk.skippedCount', '{{count}} skipped', { count: bulkSummary.skipped }))}
									</Typography>
								</Box>
							</Box>
							{Array.isArray(bulkSummary.errorSamples) && bulkSummary.errorSamples.length > 0 && (
								<Box sx={{ border: '1px solid #e2e8f0', borderRadius: 1.5, px: 1.5, py: 1, maxHeight: 180, overflowY: 'auto' }}>
									<Typography sx={{ fontSize: '0.76rem', fontWeight: 700, color: '#b45309', mb: 0.5 }}>
										{t('appCVContent.bulk.errorSamples', 'Files with errors')}
									</Typography>
									{bulkSummary.errorSamples.map((sample, i) => (
										<Typography key={i} sx={{ fontSize: '0.72rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
											{sample}
										</Typography>
									))}
								</Box>
							)}
							<Typography sx={{ fontSize: '0.76rem', color: '#94a3b8' }}>
								{t('appCVContent.bulk.duplicatesHint', 'Possible duplicates are flagged in Library Quality after import.')}
							</Typography>
						</Box>
					) : bulkStage ? (
						/* Bulk import running — real counts, not an estimate */
						<Box sx={{
							py: 2.5, px: 2.5, my: 1,
							backgroundColor: 'rgba(98,156,68,0.05)',
							border: '1px solid rgba(98,156,68,0.2)',
							borderRadius: 2,
						}}>
							<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
									<CircularProgress size={14} thickness={5} sx={{ color: '#629C44' }} />
									<Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: '#166534' }}>
										{bulkStage === 'staging'
											? t('appCVContent.bulk.staging', 'Uploading files… {{staged}} of {{total}}', { staged: bulkStaged, total: bulkTotal })
											: t('appCVContent.bulk.processing', 'Importing resumes… {{processed}} of {{total}}', {
												processed: bulkView?.processed ?? 0, total: bulkTotal })}
									</Typography>
								</Box>
								<Typography sx={{ fontSize: '0.78rem', color: '#629C44', fontWeight: 600 }}>
									{Math.round(bulkStage === 'staging'
										? (bulkTotal ? (bulkStaged / bulkTotal) * 30 : 0)
										: 30 + (bulkTotal ? ((bulkView?.processed ?? 0) / bulkTotal) * 70 : 0))}%
								</Typography>
							</Box>
							<LinearProgress
								variant="determinate"
								value={bulkStage === 'staging'
									? (bulkTotal ? (bulkStaged / bulkTotal) * 30 : 0)
									: 30 + (bulkTotal ? ((bulkView?.processed ?? 0) / bulkTotal) * 70 : 0)}
								sx={{
									height: 8, borderRadius: 4,
									backgroundColor: 'rgba(98,156,68,0.12)',
									'& .MuiLinearProgress-bar': {
										borderRadius: 4,
										background: 'linear-gradient(90deg, #629C44 0%, #7cb342 60%, #aed581 100%)',
										transition: 'transform 0.5s linear',
									},
								}}
							/>
							<Typography sx={{ fontSize: '0.78rem', color: '#629C44', mt: 1, fontStyle: 'italic' }}>
								{bulkStage === 'staging'
									? t('appCVContent.bulk.stagingHint', 'Files are being uploaded — analysis starts when staging completes.')
									: t('appCVContent.bulk.processingHint', 'Analysis runs on our servers — you can close this window and imported resumes will keep appearing in your library.')}
								{bulkStage === 'processing' && bulkImport?.etaMinutes != null && (
									` ${t('appCVContent.bulk.eta', '~{{minutes}} min left', { minutes: bulkImport.etaMinutes })}`
								)}
							</Typography>
						</Box>
					) : uploadResults ? (
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
									or click to browse — .pdf or .docx, up to {bulkLimit} files
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
									{selectedFiles.length > SYNC_MAX_FILES && (
										<Typography sx={{ fontSize: '0.74rem', color: '#64748b', mt: 0.25 }}>
											{t('appCVContent.bulk.willRunInBackground', 'Large batch — analysis will run in the background while you keep working.')}
										</Typography>
									)}
									{confirmBulk && (
										<Typography sx={{ fontSize: '0.74rem', color: '#b45309', mt: 0.25, fontWeight: 600 }}>
											{t('appCVContent.bulk.confirmInfo', 'This will analyze {{count}} resumes and use {{count}} screening actions. Click again to confirm.', { count: selectedFiles.length })}
										</Typography>
									)}
								</Box>
							)}
							{droppedInfo && (
								<Box sx={{ mt: 1, p: 1.25, backgroundColor: '#fffbeb', borderRadius: 1.5, border: '1px solid #fde68a' }}>
									{droppedInfo.overCap > 0 && (
										<Typography sx={{ fontSize: '0.76rem', color: '#b45309', fontWeight: 600 }}>
											{t('appCVContent.bulk.overCap', 'Only the first {{max}} files were kept — your plan imports up to {{max}} at once.', { max: bulkLimit })}
										</Typography>
									)}
									{droppedInfo.rejected > 0 && (
										<Typography sx={{ fontSize: '0.76rem', color: '#b45309' }}>
											{t('appCVContent.bulk.rejectedType', '{{count}} unsupported file(s) ignored — only .pdf and .docx are accepted.', { count: droppedInfo.rejected })}
										</Typography>
									)}
								</Box>
							)}
						</>
					)}
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
					{(uploadResults || bulkSummary) ? (
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
					) : bulkStage ? (
						<>
							<Button
								onClick={handleCancelBulk}
								sx={{ textTransform: 'none', color: '#dc2626', borderRadius: 1.5 }}
							>
								{t('appCVContent.bulk.cancelImport', 'Cancel import')}
							</Button>
							{bulkStage === 'processing' && (
								<Button
									onClick={handleContinueInBackground}
									variant="outlined"
									sx={{ textTransform: 'none', color: '#629C44', borderColor: '#629C44', borderRadius: 1.5, fontWeight: 600 }}
								>
									{t('appCVContent.bulk.continueInBackground', 'Continue in background')}
								</Button>
							)}
						</>
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
									backgroundColor: confirmBulk ? '#b45309' : '#629C44',
									'&:hover': { backgroundColor: confirmBulk ? '#92400e' : '#528035' },
									borderRadius: 1.5,
									boxShadow: 'none',
									fontWeight: 600,
									minWidth: 120,
								}}
							>
								{isUploading
									? <CircularProgress size={18} color="inherit" />
									: confirmBulk
										? t('appCVContent.bulk.confirmButton', 'Confirm import of {{count}} files', { count: selectedFiles.length })
										: t('appCVContent.uploadFiles')}
							</Button>
						</>
					)}
				</DialogActions>
			</Dialog>

			{/* Clear-library confirmation — preflight counts + type-to-confirm */}
			<Dialog
				open={clearDialogOpen}
				onClose={() => !clearing && setClearDialogOpen(false)}
				maxWidth="xs"
				fullWidth
				PaperProps={{ sx: { borderRadius: 2.5 } }}
			>
				<DialogTitle sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#dc2626' }}>
					{t('appCVContent.clearLibrary.title', 'Clear the whole resume library?')}
				</DialogTitle>
				<DialogContent>
					<DialogContentText component="div" sx={{ fontSize: '0.86rem', color: '#334155' }}>
						{clearPreflight ? (
							t('appCVContent.clearLibrary.summary',
								'This permanently deletes {{cvs}} resumes, {{reports}} matching reports and {{chats}} AI chats — including their stored documents. Job posts and usage history are kept. This cannot be undone.',
								{ cvs: clearPreflight.cvs, reports: clearPreflight.reports, chats: clearPreflight.chats })
						) : (
							<Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
								<CircularProgress size={18} sx={{ color: '#dc2626' }} />
							</Box>
						)}
					</DialogContentText>
					<Typography sx={{ fontSize: '0.78rem', color: '#64748b', mt: 2, mb: 0.75 }}>
						{t('appCVContent.clearLibrary.typeToConfirm', 'Type DELETE to confirm.')}
					</Typography>
					<input
						value={clearConfirmText}
						onChange={(e) => setClearConfirmText(e.target.value)}
						disabled={clearing}
						autoFocus
						style={{
							width: '100%', boxSizing: 'border-box', padding: '8px 10px',
							border: '1px solid #e2e8f0', borderRadius: 8, fontSize: '0.9rem',
							letterSpacing: '0.08em', fontFamily: 'inherit',
						}}
					/>
				</DialogContent>
				<DialogActions sx={{ px: 2, pb: 2, gap: 1 }}>
					<Button
						onClick={() => setClearDialogOpen(false)}
						disabled={clearing}
						sx={{ textTransform: 'none', color: '#64748b', borderRadius: 1.5 }}
					>
						{t('appCVContent.cancel')}
					</Button>
					<Button
						onClick={handleClearLibrary}
						disabled={clearing || clearConfirmText !== 'DELETE' || !clearPreflight}
						variant="contained"
						color="error"
						sx={{ textTransform: 'none', borderRadius: 1.5, boxShadow: 'none', fontWeight: 600 }}
					>
						{clearing
							? <CircularProgress size={18} color="inherit" />
							: t('appCVContent.clearLibrary.confirm', 'Clear library')}
					</Button>
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
