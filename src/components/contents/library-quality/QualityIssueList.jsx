// eslint-disable-next-line no-unused-vars
import React, { useCallback, useEffect, useState } from 'react';
import {
	Box,
	CircularProgress,
	IconButton,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
} from '@mui/material';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { getQualityIssues } from '../../../services/libraryQualityService.js';

const PAGE_SIZE = 10;

const cellSx = { fontSize: '0.76rem', color: '#334155', py: 0.9 };
const headSx = { fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', py: 1 };

const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : '—');

/** Paged list of the CVs affected by one quality issue (expanded under the issue row). */
const QualityIssueList = ({ issueKey }) => {
	const { t } = useTranslation();
	const [page, setPage] = useState(null);
	const [pageNumber, setPageNumber] = useState(0);
	const [loading, setLoading] = useState(true);

	const fetchPage = useCallback(async (number) => {
		setLoading(true);
		try {
			const res = await getQualityIssues(issueKey, number, PAGE_SIZE);
			setPage(res.data?.data ?? res.data);
		} catch {
			setPage(null);
		} finally {
			setLoading(false);
		}
	}, [issueKey]);

	useEffect(() => {
		fetchPage(pageNumber);
	}, [fetchPage, pageNumber]);

	if (loading && !page) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
				<CircularProgress size={20} />
			</Box>
		);
	}

	const content = page?.content ?? [];
	if (content.length === 0) {
		return (
			<Typography sx={{ fontSize: '0.76rem', color: '#94a3b8', py: 1.5, textAlign: 'center' }}>
				{t('libraryQuality.drilldown.empty', 'No resumes found for this issue.')}
			</Typography>
		);
	}

	return (
		<Box>
			<TableContainer>
				<Table size="small">
					<TableHead>
						<TableRow>
							<TableCell sx={headSx}>{t('libraryQuality.drilldown.name', 'Name')}</TableCell>
							<TableCell sx={headSx}>{t('libraryQuality.drilldown.role', 'Role')}</TableCell>
							<TableCell sx={headSx}>{t('libraryQuality.drilldown.email', 'Email')}</TableCell>
							<TableCell sx={headSx}>{t('libraryQuality.drilldown.phone', 'Phone')}</TableCell>
							<TableCell sx={headSx}>{t('libraryQuality.drilldown.contentDate', 'Content Date')}</TableCell>
							<TableCell sx={headSx}>{t('libraryQuality.drilldown.lastUpdated', 'Last Updated')}</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{content.map((cv) => (
							<TableRow key={cv.id} hover>
								<TableCell sx={{ ...cellSx, fontWeight: 600 }}>{cv.name || '—'}</TableCell>
								<TableCell sx={cellSx}>{cv.role || '—'}</TableCell>
								<TableCell sx={cellSx}>{cv.email || '—'}</TableCell>
								<TableCell sx={cellSx}>{cv.phone || '—'}</TableCell>
								<TableCell sx={cellSx}>{formatDate(cv.contentDate)}</TableCell>
								<TableCell sx={cellSx}>{formatDate(cv.lastUpdatedAt)}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>

			{(page?.totalPages ?? 0) > 1 && (
				<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1, mt: 0.5 }}>
					<Typography sx={{ fontSize: '0.68rem', color: '#94a3b8' }}>
						{pageNumber + 1} / {page.totalPages}
					</Typography>
					<IconButton size="small" disabled={pageNumber === 0} onClick={() => setPageNumber(p => p - 1)}>
						<ChevronLeftRoundedIcon sx={{ fontSize: 18 }} />
					</IconButton>
					<IconButton size="small" disabled={!page.hasNext} onClick={() => setPageNumber(p => p + 1)}>
						<ChevronRightRoundedIcon sx={{ fontSize: 18 }} />
					</IconButton>
				</Box>
			)}
		</Box>
	);
};

QualityIssueList.propTypes = {
	issueKey: PropTypes.string.isRequired,
};

export default QualityIssueList;
