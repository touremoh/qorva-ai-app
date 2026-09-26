import PropTypes from 'prop-types';
import { getInitials } from '../../../../shared/lib/text.js';
import { Box, TextField, List, ListItemButton, Typography, Chip, Avatar, CircularProgress, InputAdornment, Pagination } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { THEME_GREEN } from '../../model/jobForm.js';
import { useTranslation } from 'react-i18next';

/** Searchable, paginated list of job posts. */
const JobListPanel = ({ createMode, currentPage, editMode, fetchJobs, handleJobClick, handlePageChange, jobs, jobsLoading, search, searchDebounceRef, selectedJob, setCurrentPage, setSearch, totalElements, totalPages }) => {
	const { t } = useTranslation();
	return (
		<>
		<Box sx={{
			width: { xs: 180, sm: 220, md: 300 }, flexShrink: 0,
			borderRight: '1px solid #e2e8f0',
			display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: '#ffffff',
		}}>
			<Box sx={{ px: 1.5, pt: 1.5, pb: 1, flexShrink: 0 }}>
				<TextField size="small" fullWidth placeholder={t('jobContent.jobListTitle')}
					value={search}
					onChange={e => {
						const val = e.target.value;
						setSearch(val);
						setCurrentPage(1);
						clearTimeout(searchDebounceRef.current);
						searchDebounceRef.current = setTimeout(() => fetchJobs(val, 0), 300);
					}}
					InputProps={{
						startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: '#94a3b8' }} /></InputAdornment>,
						endAdornment: jobsLoading ? <InputAdornment position="end"><CircularProgress size={12} sx={{ color: '#94a3b8' }} /></InputAdornment> : null,
						sx: { fontSize: '0.82rem', borderRadius: 1.5 },
					}}
				/>
			</Box>
			{jobs.length === 0 && !jobsLoading ? (
				<Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
					<Typography sx={{ fontSize: '0.84rem', color: '#94a3b8' }}>{t('jobContent.noJobPosts')}</Typography>
				</Box>
			) : (
				<List disablePadding sx={{ flex: 1, overflowY: 'auto', px: 1 }}>
					{jobs.map((job) => {
						const active = selectedJob?.id === job.id && !createMode && !editMode;
						const isOpen = job.status === 'open';
						return (
							<ListItemButton key={job.id} onClick={() => handleJobClick(job)} sx={{
								borderRadius: 1.5, mb: 0.5, px: 1.5, py: 1,
								borderLeft: active ? `3px solid ${THEME_GREEN}` : '3px solid transparent',
								backgroundColor: active ? 'rgba(98,156,68,0.07)' : 'transparent',
								'&:hover': { backgroundColor: active ? 'rgba(98,156,68,0.10)' : '#f8fafc' },
							}}>
								<Avatar sx={{ width: 32, height: 32, fontSize: '0.68rem', fontWeight: 700, backgroundColor: active ? THEME_GREEN : '#e2e8f0', color: active ? '#ffffff' : '#64748b', mr: 1.5, flexShrink: 0 }}>
									{getInitials(job.title)}
								</Avatar>
								<Box sx={{ flex: 1, minWidth: 0 }}>
									<Typography sx={{ fontSize: '0.84rem', fontWeight: active ? 600 : 500, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
										{job.title}
									</Typography>
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25, flexWrap: 'wrap' }}>
										<Chip label={isOpen ? 'Open' : 'Closed'} size="small" sx={{
											height: 18, fontSize: '0.68rem', fontWeight: 600, borderRadius: 0.75,
											backgroundColor: isOpen ? 'rgba(98,156,68,0.12)' : 'rgba(239,68,68,0.10)',
											color: isOpen ? '#3a6827' : '#dc2626',
										}} />
									</Box>
								</Box>
							</ListItemButton>
						);
					})}
				</List>
			)}

			{/* Pagination footer */}
			<Box sx={{
				display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.25,
				px: 1, py: 0.75, borderTop: '1px solid #f1f5f9', flexShrink: 0, backgroundColor: '#fafafa',
			}}>
				<Typography sx={{ fontSize: '0.68rem', color: '#94a3b8' }}>
					{totalElements} {t('jobContent.jobs', 'jobs')}
				</Typography>
				{totalPages > 1 && (
					<Pagination
						count={totalPages}
						page={currentPage}
						onChange={handlePageChange}
						size="small"
						siblingCount={0}
						boundaryCount={1}
						sx={{ '& .MuiPaginationItem-root': { fontSize: '0.68rem', minWidth: 24, height: 24 } }}
					/>
				)}
			</Box>
		</Box>
		</>
	);
};

JobListPanel.propTypes = {
	createMode: PropTypes.any,
	currentPage: PropTypes.any,
	editMode: PropTypes.bool,
	fetchJobs: PropTypes.any,
	handleJobClick: PropTypes.func,
	handlePageChange: PropTypes.func,
	jobs: PropTypes.any,
	jobsLoading: PropTypes.any,
	search: PropTypes.any,
	searchDebounceRef: PropTypes.any,
	selectedJob: PropTypes.any,
	setCurrentPage: PropTypes.func,
	setSearch: PropTypes.func,
	totalElements: PropTypes.any,
	totalPages: PropTypes.any,
};

export default JobListPanel;
