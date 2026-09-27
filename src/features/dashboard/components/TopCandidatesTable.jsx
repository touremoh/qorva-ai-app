import { useEffect, useState } from 'react';
import SectionHeader from '../../../shared/ui/SectionHeader.jsx';
import { Box, Paper } from '@mui/material';
import PropTypes from 'prop-types';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import { getTopCandidatesPerJobPost } from '../api/dashboardService.js';
import JobCandidateCard from './JobCandidateCard.jsx';
import PagerControls from './PagerControls.jsx';
import * as tokens from '../../../theme/tokens.js';

const TopCandidatesTable = ({ t }) => {
	const [pageNumber, setPageNumber] = useState(0);
	const [jobs, setJobs] = useState([]);
	const [totalPages, setTotalPages] = useState(0);
	const [hasNext, setHasNext] = useState(false);
	const [pageLoading, setPageLoading] = useState(true);
	const [hasData, setHasData] = useState(false);

	const fetchPage = async (page) => {
		setPageLoading(true);
		try {
			const res = await getTopCandidatesPerJobPost(page, 5);
			const data = res?.data;
			const content = data?.content ?? [];
			if (content.length > 0) {
				setHasData(true);
				setJobs(content);
				setTotalPages(data.totalPages ?? 1);
				setHasNext(data.hasNext ?? false);
			} else {
				setHasData(false);
				setJobs([]);
			}
		} catch (e) {
			console.error('Error loading top candidates', e);
		} finally {
			setPageLoading(false);
		}
	};

	useEffect(() => { fetchPage(0); }, []);

	const handlePrev = () => { const p = pageNumber - 1; setPageNumber(p); fetchPage(p); };
	const handleNext = () => { const p = pageNumber + 1; setPageNumber(p); fetchPage(p); };

	if (pageLoading && jobs.length === 0) return null;
	if (!hasData) return null;

	return (
		<Paper elevation={0} sx={{ border: `1px solid ${tokens.line.main}`, borderRadius: 2.5, p: 2.5, minWidth: 0 }}>
			<SectionHeader sx={{ pb: 1.5 }}
				icon={EmojiEventsOutlinedIcon}
				label={t('dashboard.sections.topCandidates')}
				action={
					<PagerControls
						page={pageNumber}
						totalPages={totalPages}
						hasNext={hasNext}
						loading={pageLoading}
						onPrev={handlePrev}
						onNext={handleNext}
					/>
				}
			/>
			<Box sx={{
				display: 'flex', gap: 1.5, flexWrap: 'wrap',
				opacity: pageLoading ? 0.5 : 1, transition: 'opacity 0.15s',
			}}>
				{jobs.map((job) => (
					<JobCandidateCard key={job.jobPostId ?? job.jobPostTitle} job={job} />
				))}
			</Box>
		</Paper>
	);
};
TopCandidatesTable.propTypes = {
	t: PropTypes.func.isRequired,
};

export default TopCandidatesTable;
