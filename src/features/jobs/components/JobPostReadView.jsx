import { useState } from 'react';
import { getInitials } from '../../../shared/lib/text.js';
import PropTypes from 'prop-types';
import { Avatar, Box, Chip, Tooltip, Typography } from '@mui/material';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import CheckIcon from '@mui/icons-material/Check';
import { useTranslation } from 'react-i18next';
import { descriptionToHtml } from '../../../utils/jobDescription.js';
import JobScoringView from './JobScoringView.jsx';

const THEME_GREEN = '#629C44';


// Read-only view of a job post: title / status / reference, the sanitised description and
// (optionally) the scoring rules. Shared by the Jobs screen and the resume-chat context panel.
const JobPostReadView = ({ job, showScoringRules = true }) => {
	const { t } = useTranslation();
	const [copied, setCopied] = useState(false);

	if (!job) return null;

	const copyRef = (e) => {
		e.stopPropagation();
		navigator.clipboard.writeText(job.jobReference).catch(() => {});
		setCopied(true);
		setTimeout(() => setCopied(false), 1500);
	};

	return (
		<Box sx={{ textAlign: 'left' }}>
			<Box sx={{ p: 3, pb: showScoringRules ? 1.5 : 3 }}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
					<Avatar sx={{ width: 44, height: 44, fontSize: '0.9rem', fontWeight: 700, backgroundColor: THEME_GREEN, color: '#fff' }}>
						{getInitials(job.title)}
					</Avatar>
					<Box>
						<Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#0f172a', lineHeight: 1.2 }}>
							{job.title}
						</Typography>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
							<Chip label={job.status === 'open' ? 'Open' : 'Closed'} size="small" sx={{
								height: 20, fontSize: '0.70rem', fontWeight: 600, borderRadius: 0.75,
								backgroundColor: job.status === 'open' ? 'rgba(98,156,68,0.12)' : 'rgba(239,68,68,0.10)',
								color: job.status === 'open' ? '#3a6827' : '#dc2626',
							}} />
							{job.jobReference && (
								<Tooltip title={copied ? t('jobContent.copied') : t('jobContent.copyReference')} placement="right">
									<Box onClick={copyRef} sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, cursor: 'pointer', '&:hover': { opacity: 0.75 } }}>
										<Typography sx={{ fontSize: '0.72rem', color: copied ? THEME_GREEN : '#94a3b8' }}>
											{job.jobReference}
										</Typography>
										{copied
											? <CheckIcon sx={{ fontSize: 13, color: THEME_GREEN }} />
											: <ContentCopyOutlinedIcon sx={{ fontSize: 12, color: '#94a3b8' }} />
										}
									</Box>
								</Tooltip>
							)}
						</Box>
					</Box>
				</Box>
				<Box sx={{
					textAlign: 'start',
					'& p': { fontSize: '0.88rem', lineHeight: 1.8, color: '#334155', mb: 1 },
					'& ul, & ol': { pl: 2.5, mb: 1 },
					'& li': { fontSize: '0.88rem', lineHeight: 1.8, color: '#334155', mb: 0.25 },
					'& strong': { fontWeight: 700, color: '#0f172a' },
					'& h1, & h2, & h3': { color: '#0f172a', mt: 2, mb: 1 },
					// A non-wrapping <pre> would push the whole text off-screen and read as "empty".
					'& pre': { whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'inherit', fontSize: '0.88rem', lineHeight: 1.8, color: '#334155', m: 0 },
				}} dir="auto" dangerouslySetInnerHTML={{ __html: descriptionToHtml(job.description) }} />
			</Box>
			{showScoringRules && (
				<>
					<Typography sx={{ px: 3, pt: 1, fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
						{t('jobContent.stepScoringRules')}
					</Typography>
					<JobScoringView scoringRules={job.scoringRules} t={t} />
				</>
			)}
		</Box>
	);
};

JobPostReadView.propTypes = { job: PropTypes.object, showScoringRules: PropTypes.bool };

export default JobPostReadView;
