import { getInitials } from '../../../shared/lib/text.js';
import { Avatar, Box, Tooltip, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { medalColor, scoreColor } from '../model/dashboard.js';
import * as tokens from '../../../theme/tokens.js';
import { alpha } from '@mui/material/styles';

const JobCandidateCard = ({ job }) => {
	const candidates = job.topCandidates?.slice(0, 5) ?? [];
	return (
		<Box sx={{
			flex: '1 1 180px', minWidth: 180,
			border: `1px solid ${tokens.line.main}`, borderRadius: 2, overflow: 'hidden',
		}}>
			<Tooltip title={job.jobPostTitle} placement="top">
				<Box sx={{ px: 1.5, py: 1, backgroundColor: tokens.surface.subtle, borderBottom: `1px solid ${tokens.line.main}` }}>
					<Typography sx={{
						fontSize: '0.76rem', fontWeight: 700, color: tokens.ink.strong,
						overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
					}}>
						{job.jobPostTitle}
					</Typography>
				</Box>
			</Tooltip>
			<Box>
				{candidates.map((c, i) => {
					const { color, bg: scoreBg } = scoreColor(c.score);
					const initials = getInitials(c.candidateName);
					return (
						<Box key={i} sx={{
							display: 'flex', alignItems: 'center', gap: 0.75,
							px: 1.25, py: 0.65,
							borderBottom: i < candidates.length - 1 ? `1px solid ${tokens.surface.muted}` : 'none',
							'&:hover': { backgroundColor: alpha(tokens.brand.main, 0.04) },
						}}>
							<Box sx={{
								width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
								backgroundColor: medalColor(i),
								display: 'flex', alignItems: 'center', justifyContent: 'center',
							}}>
								<Typography sx={{ fontSize: '0.52rem', fontWeight: 800, color: i < 3 ? `${tokens.surface.paper}` : `${tokens.ink.subtle}`, lineHeight: 1 }}>
									{i + 1}
								</Typography>
							</Box>
							<Avatar sx={{
								width: 22, height: 22, fontSize: '0.55rem', fontWeight: 700, flexShrink: 0,
								backgroundColor: `${color}22`, color,
							}}>
								{initials}
							</Avatar>
							<Typography sx={{
								flex: 1, fontSize: '0.76rem', fontWeight: i === 0 ? 600 : 400, color: tokens.ink.strong,
								overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0,
							}}>
								{c.candidateName}
							</Typography>
							<Box sx={{
								flexShrink: 0, px: 0.6, py: 0.15, borderRadius: 1,
								backgroundColor: scoreBg, color,
								fontSize: '0.65rem', fontWeight: 800, lineHeight: 1.5,
							}}>
								{c.score}%
							</Box>
						</Box>
					);
				})}
			</Box>
		</Box>
	);
};
JobCandidateCard.propTypes = {
	job: PropTypes.shape({
		jobPostId: PropTypes.string,
		jobPostTitle: PropTypes.string,
		topCandidates: PropTypes.arrayOf(PropTypes.shape({
			candidateId: PropTypes.string,
			candidateName: PropTypes.string,
			score: PropTypes.number,
		})),
	}).isRequired,
};

export default JobCandidateCard;
