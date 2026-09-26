import { useEffect, useRef, useState } from 'react';
import { getJobs } from '../api/jobService.js';

/** The job-post list: search term, paging and the current page of jobs, loaded on mount. */
export default function useJobList() {
	const [jobs, setJobs] = useState([]);
	const [search, setSearch] = useState('');
	const [jobsLoading, setJobsLoading] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [totalElements, setTotalElements] = useState(0);
	const searchDebounceRef = useRef(null);

	const fetchJobs = async (term = '', page = 0) => {
		setJobsLoading(true);
		try {
			const params = { pageSize: 20, pageNumber: page };
			if (term.trim()) { params.title = term.trim(); params.description = term.trim(); }
			const response = await getJobs(params);
			const data = response.data.data;
			setJobs(data.content ?? []);
			setTotalPages(data.totalPages ?? 1);
			setTotalElements(data.totalElements ?? 0);
		} catch (error) {
			console.error('Error fetching job posts:', error);
		} finally {
			setJobsLoading(false);
		}
	};

	const handlePageChange = (_, value) => {
		setCurrentPage(value);
		fetchJobs(search, value - 1);
	};

	useEffect(() => {
		fetchJobs();
	}, []);

	return {
		jobs, setJobs, jobsLoading, search, setSearch, searchDebounceRef,
		currentPage, setCurrentPage, totalPages, totalElements, fetchJobs, handlePageChange,
	};
}
