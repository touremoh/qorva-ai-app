// Batches up to this size use the original synchronous upload (inline per-file
// results); anything larger goes through the asynchronous bulk-import job.
export const SYNC_MAX_FILES = 20;

// Staging requests stay at or below the backend chunk cap (and Tomcat's part limit).
export const BULK_CHUNK_SIZE = 50;

// Chunks upload concurrently (the backend appends atomically), shrinking the staging wait.
export const STAGING_PARALLELISM = 3;

// Plan cap fallback until /usage-monitoring/current answers (Starter tier value).
export const FALLBACK_BULK_LIMIT = 100;

// Above this, a second click is required — the import bills one screening action per file.
export const BULK_CONFIRM_THRESHOLD = 300;

export const FILE_TYPE_PDF = 'application/pdf';

export const FILE_TYPE_WORD = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

// The backend parses all uploaded resumes in parallel, so the wait is roughly
// constant (~45s max) regardless of how many files were selected.
export const UPLOAD_ESTIMATE_SECONDS = 45;

// Maps elapsed seconds to a translation key describing what's happening
// server-side, so the user sees progress instead of a bare spinner.
export const getUploadPhaseKey = (elapsed) => {
	if (elapsed < 8) return 'uploadPhase1';
	if (elapsed < 16) return 'uploadPhase2';
	if (elapsed < 24) return 'uploadPhase3';
	if (elapsed < 32) return 'uploadPhase4';
	if (elapsed < 40) return 'uploadPhase5';
	return 'uploadPhase6';
};
