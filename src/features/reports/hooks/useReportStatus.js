import { useCallback, useEffect, useState } from 'react';
import { setReportStatus } from '../api/reportService.js';
import { getPipeline } from '../../dashboard/api/dashboardService.js';
import { withStatus } from '../model/reportStatus.js';

/**
 * Moving candidates along the pipeline from the matching page: the change shows at once and is rolled back if
 * the server refuses it; the selected job's counts ("3 shortlisted · 1 interviewing") follow every move.
 */
export default function useReportStatus({ selectedJobId, setReports, setSelectedReport }) {
	const [jobCounts, setJobCounts] = useState(null);

	const refreshCounts = useCallback(async (jobId = selectedJobId) => {
		if (!jobId) {
			setJobCounts(null);
			return;
		}
		try {
			const res = await getPipeline({ jobPostId: jobId });
			setJobCounts(res?.data?.currentByStatus ?? null);
		} catch {
			// Counts need VIEW_DASHBOARD; without it the bar simply shows none.
			setJobCounts(null);
		}
	}, [selectedJobId]);

	useEffect(() => { refreshCounts(selectedJobId); }, [selectedJobId, refreshCounts]);

	const replace = useCallback((next) => {
		setReports((prev) => prev.map((r) => (r.id === next.id ? next : r)));
		setSelectedReport((prev) => (prev?.id === next.id ? next : prev));
	}, [setReports, setSelectedReport]);

	const changeStatus = useCallback(async (report, status) => {
		replace(withStatus(report, status));
		try {
			const res = await setReportStatus(report.id, status);
			if (res?.data?.id) replace(res.data);
			refreshCounts();
		} catch (error) {
			console.error('Error changing the candidate status:', error);
			replace(report);
		}
	}, [replace, refreshCounts]);

	return { changeStatus, jobCounts, refreshCounts };
}
