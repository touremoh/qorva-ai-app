import { useEffect, useRef, useState } from 'react';
import { useBulkImport } from '../../../contexts/BulkImportContext.jsx';
import { getUsageMonitoring } from '../../usage/api/usageMonitoringService.js';
import { uploadCVs, replaceDuplicateCV } from '../api/cvService.js';
import { cancelBulkUpload, createBulkUpload, stageBulkFiles, startBulkUpload } from '../api/bulkUploadService.js';
import { notifyQualityChanged } from '../../library-quality/api/libraryQualityService.js';
import { openUpgradeDialog } from '../../../utils/demoMode.js';
import {
	BULK_CHUNK_SIZE, BULK_CONFIRM_THRESHOLD, FALLBACK_BULK_LIMIT, FILE_TYPE_PDF, FILE_TYPE_WORD,
	STAGING_PARALLELISM, SYNC_MAX_FILES, UPLOAD_ESTIMATE_SECONDS,
} from '../model/upload.js';

/**
 * Resume upload: file picking (type and plan-cap checks), the synchronous path for up to
 * {SYNC_MAX_FILES} files with its estimated progress, the bulk path (stage chunks, start, hand
 * the job to the app-level BulkImport provider), and resolving duplicates afterwards.
 * `refreshList` reloads the library after a change.
 */
export default function useCvUpload(refreshList) {
	const [openUploadModal, setOpenUploadModal] = useState(false);

	const [selectedFiles, setSelectedFiles] = useState([]);

	const [uploadResults, setUploadResults] = useState(null);

	const [isUploading, setIsUploading] = useState(false);

	const [uploadComplete, setUploadComplete] = useState(false);

	const [uploadProgress, setUploadProgress] = useState(0);

	const [uploadElapsed, setUploadElapsed] = useState(0);

	const [isDragging, setIsDragging] = useState(false);

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

	return {
		openUploadModal, selectedFiles, uploadResults, isUploading, uploadComplete, uploadProgress, uploadElapsed, isDragging, bulkLimit, droppedInfo, confirmBulk, bulkJobId, bulkStage, bulkStaged, bulkTotal, bulkSummary, setOpenUploadModal, setIsDragging, fileInputRef, bulkImport, bulkView, processFiles, handleFileSelect, handleDrop, handleUploadCV, handleSyncUpload, handleBulkUpload, handleCancelBulk, handleContinueInBackground, handleCloseUploadDialog, handleReplaceDuplicate, handleKeepBoth, handleReplaceAll,
	};
}
