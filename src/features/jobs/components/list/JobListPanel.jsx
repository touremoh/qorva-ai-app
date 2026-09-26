import PropTypes from 'prop-types';
import { getInitials } from '../../../../shared/lib/text.js';
import { Box, TextField, List, ListItemButton, Typography, Chip, Avatar, CircularProgress, InputAdornment, Pagination } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { THEME_GREEN } from '../../model/jobForm.js';
import { useTranslation } from 'react-i18next';
import * as tokens from '../../../../theme/tokens.js';
import { alpha } from '@mui/material/styles';

/** Searchable, paginated list of job posts. */
const JobListPanel = ({ createMode, currentPage, editMode, fetchJobs, handleJobClick, handlePageChange, jobs, jobsLoading, search, searchDebounceRef, selectedJob, setCurrentPage, setSearch, totalElements, totalPages }) => {
	const { t } = useTranslation();
	return (
		<>
		<Box sx={{
			width: { xs: 180, sm: 220, md: 300 }, flexShrink: 0,
			borderRight: `1px solid ${tokens.line.main}`,
			display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: tokens.surface.paper,
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
						startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: tokens.iconSize.md, color: tokens.ink.subtle }} /></InputAdornment>,
						endAdornment: jobsLoading ? <InputAdornment position="end"><CircularProgress size={12} sx={{ color: tokens.ink.subtle }} /></InputAdornment> : null,
						sx: { fontSize: tokens.fontSize.body2, borderRadius: 1.5 },
					}}
				/>
			</Box>
			{jobs.length === 0 && !jobsLoading ? (
				<Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
					<Typography sx={{ fontSize: tokens.fontSize.body2, color: tokens.ink.subtle }}>{t('jobContent.noJobPosts')}</Typography>
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
								backgroundColor: active ? alpha(tokens.brand.main, 0.07) : 'transparent',
								'&:hover': { backgroundColor: active ? alpha(tokens.brand.main, 0.10) : `${tokens.surface.subtle}` },
							}}>
								<Avatar sx={{ width: 32, height: 32, fontSize: tokens.fontSize.caption, fontWeight: 700, backgroundColor: active ? THEME_GREEN : `${tokens.line.main}`, color: active ? `${tokens.surface.paper}` : `${tokens.ink.muted}`, mr: 1.5, flexShrink: 0 }}>
									{getInitials(job.title)}
								</Avatar>
								<Box sx={{ flex: 1, minWidth: 0 }}>
									<Typography sx={{ fontSize: tokens.fontSize.body2, fontWeight: active ? 600 : 500, color: tokens.ink.strong, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
										{job.title}
									</Typography>
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25, flexWrap: 'wrap' }}>
										<Chip label={isOpen ? 'Open' : 'Closed'} size="small" sx={{
											height: 18, fontSize: tokens.fontSize.caption, fontWeight: 600, borderRadius: 0.75,
											backgroundColor: isOpen ? alpha(tokens.brand.main, 0.12) : 'rgba(239,68,68,0.10)',
											color: isOpen ? `${tokens.brand.dark}` : `${tokens.status.error.main}`,
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
				display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 0.25,
				px: 1, py: 0.75, borderTop: `1px solid ${tokens.surface.muted}`, flexShrink: 0, backgroundColor: tokens.surface.dim,
			}}>
				<Typography sx={{ fontSize: tokens.fontSize.caption, color: tokens.ink.subtle }}>
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
						sx={{ '& .MuiPaginationItem-root': { fontSize: tokens.fontSize.caption, minWidth: 24, height: 24 } }}
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
