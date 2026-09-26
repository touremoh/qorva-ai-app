import { useMemo, useState } from 'react';
import SectionHeader from '../../../shared/ui/SectionHeader.jsx';
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import PagerControls from './PagerControls.jsx';
import { JOB_POSTS_PAGE_SIZE } from '../model/dashboard.js';

const JobPostsReportTable = ({ rows, t }) => {
	const [page, setPage] = useState(0);

	const totalPages = Math.ceil(rows.length / JOB_POSTS_PAGE_SIZE);
	// Clamp instead of resetting in an effect, so a shorter list never leaves us past the last page
	const currentPage = Math.min(page, Math.max(totalPages - 1, 0));
	const offset = currentPage * JOB_POSTS_PAGE_SIZE;
	const visibleRows = useMemo(
		() => rows.slice(offset, offset + JOB_POSTS_PAGE_SIZE),
		[rows, offset]
	);

	return (
		<Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2.5, p: 2.5, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
			<SectionHeader sx={{ pb: 1.5 }}
				icon={WorkOutlineOutlinedIcon}
				label={t('dashboard.sections.jobPostsReport')}
				action={
					<PagerControls
						page={currentPage}
						totalPages={totalPages}
						hasNext={currentPage < totalPages - 1}
						onPrev={() => setPage(currentPage - 1)}
						onNext={() => setPage(currentPage + 1)}
					/>
				}
			/>
			{rows.length ? (
				<TableContainer sx={{ flex: 1, overflowY: 'auto' }}>
					<Table size="small" stickyHeader>
						<TableHead>
							<TableRow>
								<TableCell sx={{ fontWeight: 700, fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', py: 1 }}>
									{t('dashboard.table.jobPostTitle')}
								</TableCell>
								<TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', py: 1 }}>
									{t('dashboard.table.totalMatch')}
								</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{visibleRows.map((row, idx) => (
								<TableRow key={row.jobPostId ?? `${row.jobPostTitle}-${offset + idx}`} sx={{ '&:hover': { backgroundColor: '#f8fafc' } }}>
									<TableCell sx={{ fontSize: '0.82rem', color: '#0f172a', py: 1, borderBottom: '1px solid #f1f5f9' }}>
										{row?.jobPostTitle ?? '—'}
									</TableCell>
									<TableCell align="right" sx={{ py: 1, borderBottom: '1px solid #f1f5f9' }}>
										<Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 32, height: 22, px: 1, borderRadius: 1.5, backgroundColor: 'rgba(98,156,68,0.10)', color: '#166534', fontSize: '0.75rem', fontWeight: 700 }}>
											{row?.totalMatch ?? 0}
										</Box>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>
			) : (
				<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
					<Typography sx={{ fontSize: '0.82rem', color: '#94a3b8' }}>{t('dashboard.empty.jobPosts')}</Typography>
				</Box>
			)}
		</Paper>
	);
};
JobPostsReportTable.propTypes = {
	rows: PropTypes.arrayOf(PropTypes.shape({
		jobPostId: PropTypes.string,
		jobPostTitle: PropTypes.string,
		totalMatch: PropTypes.number,
	})).isRequired,
	t: PropTypes.func.isRequired,
};

export default JobPostsReportTable;
