// eslint-disable-next-line no-unused-vars
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { getBulkUpload, listBulkUploads, BULK_TERMINAL_STATUSES } from '../services/bulkUploadService.js';
import { notifyQualityChanged } from '../services/libraryQualityService.js';

// App-level watcher for bulk CV imports. The upload dialog starts a job and calls
// watchJob(); from then on this provider owns the polling, so progress survives
// closing the dialog, switching tabs, and page refreshes (resume on mount).
export const CVS_CHANGED_EVENT = 'qorva:cvs-changed';

const POLL_MS = 4000;
// ETA is a rolling rate over recent polls — steadier than average-since-start.
const ETA_WINDOW_MS = 120000;
const ETA_MIN_PROCESSED = 20;

const BulkImportContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useBulkImport = () => useContext(BulkImportContext);

export const BulkImportProvider = ({ children }) => {
	const { t } = useTranslation();
	const [activeJob, setActiveJob] = useState(null);
	const [summary, setSummary] = useState(null);
	const [etaMinutes, setEtaMinutes] = useState(null);
	const pollRef = useRef(null);
	const samplesRef = useRef([]);

	const stopPolling = useCallback(() => {
		clearInterval(pollRef.current);
		pollRef.current = null;
	}, []);

	const updateEta = (job) => {
		const now = Date.now();
		samplesRef.current = [
			...samplesRef.current.filter(s => now - s.t < ETA_WINDOW_MS),
			{ t: now, processed: job.processed },
		];
		const samples = samplesRef.current;
		if (job.processed < ETA_MIN_PROCESSED || samples.length < 2) {
			setEtaMinutes(null);
			return;
		}
		const first = samples[0];
		const last = samples[samples.length - 1];
		const perMs = (last.processed - first.processed) / Math.max(1, last.t - first.t);
		if (perMs <= 0) {
			setEtaMinutes(null);
			return;
		}
		setEtaMinutes(Math.max(1, Math.ceil((job.total - job.processed) / perMs / 60000)));
	};

	const handleJobUpdate = useCallback((job) => {
		if (BULK_TERMINAL_STATUSES.includes(job.status)) {
			stopPolling();
			samplesRef.current = [];
			setActiveJob(null);
			setEtaMinutes(null);
			setSummary(job);
			notifyQualityChanged();
			window.dispatchEvent(new CustomEvent(CVS_CHANGED_EVENT));
			if (job.status === 'CANCELLED') {
				toast.info(t('appCVContent.bulk.cancelled', 'Import cancelled'));
			} else if (job.failed > 0 || job.skipped > 0) {
				toast.warning(t('appCVContent.bulk.imported', '{{succeeded}} of {{total}} resumes imported', {
					succeeded: job.succeeded, total: job.total }));
			} else {
				toast.success(t('appCVContent.bulk.imported', '{{succeeded}} of {{total}} resumes imported', {
					succeeded: job.succeeded, total: job.total }));
			}
			return;
		}
		setActiveJob(job);
		updateEta(job);
	}, [stopPolling, t]);

	const watchJob = useCallback((jobId) => {
		stopPolling();
		samplesRef.current = [];
		setSummary(null);
		const poll = async () => {
			try {
				const resp = await getBulkUpload(jobId);
				handleJobUpdate(resp.data);
			} catch (error) {
				// Transient poll failures are fine — the job keeps running server-side.
				console.warn('Bulk import poll failed:', error);
			}
		};
		poll();
		pollRef.current = setInterval(poll, POLL_MS);
	}, [handleJobUpdate, stopPolling]);

	// Resume after a refresh: if an import is still running server-side, pick it back up.
	useEffect(() => {
		listBulkUploads()
			.then(resp => {
				const jobs = resp?.data?.jobs ?? [];
				const active = jobs.find(j => j.status === 'PENDING' || j.status === 'RUNNING');
				if (active) watchJob(active.id);
			})
			.catch(() => {});
		return stopPolling;
	}, [watchJob, stopPolling]);

	const value = {
		activeJob,
		summary,
		etaMinutes,
		watchJob,
		clearSummary: useCallback(() => setSummary(null), []),
	};

	return <BulkImportContext.Provider value={value}>{children}</BulkImportContext.Provider>;
};

BulkImportProvider.propTypes = {
	children: PropTypes.node,
};
