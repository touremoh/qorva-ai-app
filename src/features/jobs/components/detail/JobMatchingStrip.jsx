import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Chip, Typography } from '@mui/material';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import dayjs from '../../../../shared/lib/dayjs.js';
import RunMatchingDialog from '../../../reports/components/run/RunMatchingDialog.jsx';
import { getMatchingRunOptions } from '../../../reports/api/reportService.js';
import { nextTopN, staleReasonKey, unwrap } from '../../../reports/model/matchingRun.js';
import * as tokens from '../../../../theme/tokens.js';

/**
 * The job's matching at a glance: when it was last matched and with which Top N, why its results are out of
 * date, and the buttons to run it — or to see five more candidates, which only charges the new ones.
 */
const JobMatchingStrip = ({ job, demo }) => {
	const { t, i18n } = useTranslation();
	const navigate = useNavigate();
	const locale = i18n.language?.slice(0, 2) || 'en';
	const [options, setOptions] = useState(null);
	const [dialog, setDialog] = useState(null);
	const [startedFor, setStartedFor] = useState(null);

	useEffect(() => {
		getMatchingRunOptions().then((res) => setOptions(unwrap(res))).catch(() => setOptions(null));
	}, []);

	// A notice about a run started for another job must not linger on this one.
	useEffect(() => { setStartedFor(null); }, [job?.id]);

	if (!job || job.status !== 'open') return null;
	const reasonKey = staleReasonKey(job);
	const more = nextTopN(job, options?.allowedTopN);

	return (
		<Box sx={{
			display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', flexShrink: 0,
			px: 2.5, py: 1, backgroundColor: tokens.surface.paper, borderBottom: `1px solid ${tokens.line.main}`,
		}}>
			<Typography sx={{ fontSize: tokens.fontSize.small, color: tokens.ink.muted }}>
				{job.lastMatchedAt
					? t('matchingRun.lastMatched', { date: dayjs(job.lastMatchedAt).locale(locale).format('LL'), topN: job.matchingTopN ?? 10 })
					: t('matchingRun.neverMatched')}
			</Typography>
			{reasonKey && job.lastMatchedAt && (
				<Chip size="small" label={t(reasonKey, { count: job.newCandidateCount ?? 0, topN: job.matchingTopN ?? 10 })}
					sx={{ height: 20, fontSize: tokens.fontSize.caption, backgroundColor: 'rgba(245,158,11,0.12)', color: tokens.status.warning.text }} />
			)}
			<Box sx={{ flexGrow: 1 }} />
			{startedFor === job.id && (
				<Button size="small" onClick={() => navigate('/app/reports')} sx={{ textTransform: 'none', fontSize: tokens.fontSize.small }}>
					{t('matchingRun.startedFollow')}
				</Button>
			)}
			{!demo && more != null && (
				<Button size="small" variant="outlined" onClick={() => setDialog({ topN: more })}
					startIcon={<AddRoundedIcon sx={{ fontSize: tokens.iconSize.md }} />}
					sx={{ textTransform: 'none', fontSize: tokens.fontSize.small, borderRadius: 1.5 }}>
					{t('matchingRun.showMore', { topN: more })}
				</Button>
			)}
			{!demo && (
				<Button size="small" variant="contained" onClick={() => setDialog({ topN: job.matchingTopN ?? null })}
					startIcon={<PlayArrowRoundedIcon sx={{ fontSize: tokens.iconSize.md }} />}
					sx={{ textTransform: 'none', fontSize: tokens.fontSize.small, borderRadius: 1.5, boxShadow: 'none' }}>
					{t('appReportContent.startMatching')}
				</Button>
			)}
			<RunMatchingDialog
				open={dialog != null}
				onClose={() => setDialog(null)}
				onStarted={() => setStartedFor(job.id)}
				presetJobIds={[job.id]}
				presetTopN={dialog?.topN ?? null}
			/>
		</Box>
	);
};

JobMatchingStrip.propTypes = {
	job: PropTypes.object,
	demo: PropTypes.bool,
};

export default JobMatchingStrip;
