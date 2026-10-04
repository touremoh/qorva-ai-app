import { useRef, useState } from 'react';
import { getJobs } from '../../jobs/api/jobService.js';

/** The job filter's options: the first page of jobs, re-fetched as the recruiter types. */
export default function useJobOptions() {
	const [jobOptions, setJobOptions] = useState([]);
	const [jobOptionsLoading, setJobOptionsLoading] = useState(false);
	const [jobInputValue, setJobInputValue] = useState('');
	const jobSearchRef = useRef(null);

	const fetchJobOptions = async (term = '') => {
		setJobOptionsLoading(true);
		try {
			const params = { pageSize: 25, pageNumber: 0 };
			if (term.trim()) { params.title = term.trim(); params.description = term.trim(); }
			const res = await getJobs(params);
			setJobOptions(res?.data?.data?.content ?? []);
		} catch { /* silent */ }
		finally { setJobOptionsLoading(false); }
	};

	return { jobOptions, jobOptionsLoading, jobInputValue, setJobInputValue, jobSearchRef, fetchJobOptions };
}
