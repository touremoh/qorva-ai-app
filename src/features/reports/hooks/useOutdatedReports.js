import { useState } from 'react';
import { deleteOutdatedReports, getReports } from '../api/reportService.js';

/**
 * The selected job's outdated reports — those that left its latest matching results: how many there are, and
 * deleting them all (with their notes and chats) behind a confirmation. `onDeleted` reloads the list.
 */
export default function useOutdatedReports({ onDeleted }) {
	const [outdatedCount, setOutdatedCount] = useState(0);
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [deleting, setDeleting] = useState(false);

	const refreshOutdatedCount = async (jobId) => {
		if (!jobId) { setOutdatedCount(0); return; }
		try {
			const res = await getReports({ jobPostId: jobId, outdated: true, pageNumber: 0, pageSize: 1 });
			setOutdatedCount(res?.data?.data?.totalElements ?? 0);
		} catch { setOutdatedCount(0); }
	};

	const deleteOutdated = async (jobId) => {
		if (!jobId) return;
		try {
			setDeleting(true);
			await deleteOutdatedReports(jobId);
			await onDeleted?.();
			await refreshOutdatedCount(jobId);
		} catch (error) {
			console.error('Error deleting outdated reports:', error);
		} finally {
			setDeleting(false);
			setConfirmOpen(false);
		}
	};

	return { outdatedCount, refreshOutdatedCount, confirmOpen, setConfirmOpen, deleting, deleteOutdated };
}
