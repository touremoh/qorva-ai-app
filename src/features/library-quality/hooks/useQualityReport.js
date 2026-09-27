import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getLibraryQuality, notifyQualityChanged } from '../api/libraryQualityService.js';
import { initialReport } from '../model/libraryQuality.js';

/** The library quality report, loaded on mount; `fetchReport` reloads it and keeps the sidebar badge in sync. */
export default function useQualityReport() {
	const { t } = useTranslation();
	const [report, setReport] = useState(initialReport);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	const fetchReport = async () => {
		setLoading(true);
		setError('');
		try {
			const res = await getLibraryQuality();
			const data = res.data?.data ?? res.data ?? {};
			const issues = Array.isArray(data.issues) ? data.issues : [];
			setReport({
				...initialReport,
				...data,
				completeness: data.completeness ?? initialReport.completeness,
				freshness: data.freshness ?? initialReport.freshness,
				uniqueness: data.uniqueness ?? initialReport.uniqueness,
				parseConfidence: data.parseConfidence ?? initialReport.parseConfidence,
				issues,
			});
			notifyQualityChanged(issues.filter(i => !i.dismissed).length); // keep the sidebar badge in sync
		} catch {
			setError(t('libraryQuality.error', 'Could not load the library quality report. Please try again.'));
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchReport();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return { report, loading, error, fetchReport };
}
