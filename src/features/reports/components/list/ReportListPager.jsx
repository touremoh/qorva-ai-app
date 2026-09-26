import PropTypes from 'prop-types';
import { Box, MenuItem, Pagination, Select, Typography } from '@mui/material';
import { PAGE_SIZES } from '../../model/reportList.js';
import { useTranslation } from 'react-i18next';
import * as tokens from '../../../../theme/tokens.js';

/** Result count, page size and previous/next for the report list. */
const ReportListPager = ({ currentPage, handlePageChange, handlePageSizeChange, pageSize, totalElements, totalPages }) => {
	const { t } = useTranslation();
	return (
		<>
		<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1.5, py: 0.75, borderTop: `1px solid ${tokens.surface.muted}`, flexShrink: 0, gap: 1, flexWrap: 'wrap', backgroundColor: tokens.surface.dim }}>
			<Typography sx={{ fontSize: '0.72rem', color: tokens.ink.subtle }}>
				{t('appReportContent.reportCount', { count: totalElements })}
				{totalPages > 1 && <span> · {t('appCVContent.pageOf', { page: currentPage, total: totalPages })}</span>}
			</Typography>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
				<Select
					size="small"
					value={pageSize}
					onChange={handlePageSizeChange}
					sx={{ fontSize: '0.72rem', height: 24, '& .MuiSelect-select': { py: 0, px: 1 } }}
				>
					{PAGE_SIZES.map(n => <MenuItem key={n} value={n} sx={{ fontSize: '0.78rem' }}>{n}</MenuItem>)}
				</Select>
				{totalPages > 1 && (
					<Pagination
						count={totalPages}
						page={currentPage}
						onChange={handlePageChange}
						size="small"
						siblingCount={0}
						boundaryCount={1}
						sx={{ '& .MuiPaginationItem-root': { fontSize: '0.72rem' } }}
					/>
				)}
			</Box>
		</Box>
		</>
	);
};

ReportListPager.propTypes = {
	currentPage: PropTypes.any,
	handlePageChange: PropTypes.func,
	handlePageSizeChange: PropTypes.func,
	pageSize: PropTypes.any,
	totalElements: PropTypes.any,
	totalPages: PropTypes.any,
};

export default ReportListPager;
