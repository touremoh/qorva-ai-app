import PropTypes from 'prop-types';
import SectionHeader from '../../../../shared/ui/SectionHeader.jsx';
import { Box, Chip, Paper, Stack, Typography } from '@mui/material';
import StarOutlineOutlinedIcon from '@mui/icons-material/StarOutlineOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import QuestionAnswerOutlinedIcon from '@mui/icons-material/QuestionAnswerOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbDownOutlinedIcon from '@mui/icons-material/ThumbDownOutlined';
import NotesPanel from '../../../../components/contents/common/NotesPanel.jsx';
import ScoreGaugeLarge from './ScoreGaugeLarge.jsx';
import DetailScoreCard from './DetailScoreCard.jsx';
import { THEME_GREEN, importanceKey, importanceChipSx, severityChipSx } from '../../model/reportDetails.js';
import { useTranslation } from 'react-i18next';

/** Left column of the report: decision, score breakdown, skills, strengths and risks. */
const ReportMainColumn = ({ finalColor, confConfig, confKey, decision, detailScores, details, finalScore, recConfig, recKey, reportData }) => {
	const { t } = useTranslation();
	return (
		<>
		<Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2.5 }}>

			{/* HERO: Decision + Final Score */}
			<Paper elevation={0} sx={{
				borderRadius: 3, p: 3,
				border: `1px solid ${finalColor}30`,
				background: `linear-gradient(135deg, ${finalColor}06 0%, ${finalColor}14 100%)`,
			}}>
				<Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
					<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, flexShrink: 0 }}>
						<ScoreGaugeLarge value={finalScore} />
						<Typography sx={{ fontSize: '0.62rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
							{t('appCVMatching.finalScore')}
						</Typography>
					</Box>
					<Box sx={{ flex: 1, minWidth: 0, pt: 0.5 }}>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
							{recKey && (
								<Chip
									icon={recKey === 'interview' ? <ThumbUpOutlinedIcon sx={{ fontSize: '12px !important' }} /> : recKey === 'reject' ? <ThumbDownOutlinedIcon sx={{ fontSize: '12px !important' }} /> : undefined}
									label={t(`appCVMatching.recommendation.${recKey}`, recKey)}
									size="small"
									sx={{ height: 22, fontSize: '0.72rem', fontWeight: 700, backgroundColor: recConfig.bg, color: recConfig.color, border: `1px solid ${recConfig.border}` }}
								/>
							)}
							{confKey && (
								<Chip label={t(`appCVMatching.confidence.${confKey}`, confKey)} size="small"
									sx={{ height: 22, fontSize: '0.72rem', fontWeight: 600, backgroundColor: confConfig.bg, color: confConfig.color }} />
							)}
						</Box>
						{decision?.reportHeadline && (
							<Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.4, mb: 1 }}>
								{decision.reportHeadline}
							</Typography>
						)}
						<Typography sx={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.65 }}>
							{decision?.detailedSummary}
						</Typography>
						{decision?.shortVerdict && (
							<Box sx={{ mt: 1.5, px: 1.5, py: 1, borderRadius: 1.5, backgroundColor: 'rgba(98,156,68,0.06)', borderLeft: `3px solid ${THEME_GREEN}` }}>
								<Typography sx={{ fontSize: '0.78rem', color: '#334155', lineHeight: 1.6, fontStyle: 'italic' }}>
									{decision.shortVerdict}
								</Typography>
							</Box>
						)}
					</Box>
				</Box>
			</Paper>

			{/* 2×2 detail score grid */}
			<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
				{detailScores.map(item => (
					<DetailScoreCard key={item.key} icon={item.icon} label={item.label} score={item.score} explanation={item.explanation} />
				))}
			</Box>

			{/* Matching Skills */}
			{Array.isArray(details.skillsMatch?.matchingSkills) && details.skillsMatch.matchingSkills.length > 0 && (
				<Paper elevation={0} sx={{ border: '1px solid #bbf7d0', borderRadius: 2.5, p: 2.5, backgroundColor: '#f0fdf4' }}>
					<SectionHeader sx={{ mb: 1.5 }} icon={StarOutlineOutlinedIcon} label={t('appCVMatching.matchingSkills')} />
					<Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
						{details.skillsMatch.matchingSkills.map((sk, i) => (
							<Chip key={`msk-${i}`} label={sk} size="small"
								sx={{ height: 24, fontSize: '0.75rem', fontWeight: 600, backgroundColor: '#dcfce7', color: '#15803d', border: '1px solid #86efac' }} />
						))}
					</Stack>
				</Paper>
			)}

			{/* Missing Skills */}
			{details.missingSkills && (
				<Paper elevation={0} sx={{ border: '1px solid #fecaca', borderRadius: 2.5, p: 2.5, backgroundColor: '#fffafa' }}>
					<SectionHeader sx={{ mb: 1.5 }} icon={ErrorOutlineOutlinedIcon} label={t('appCVMatching.lackingSkills')} />
					{details.missingSkills.summary && (
						<Typography sx={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.6, mb: 1.5 }}>
							{details.missingSkills.summary}
						</Typography>
					)}
					{Array.isArray(details.missingSkills.skills) && details.missingSkills.skills.length > 0 && (
						<Box sx={{ display: 'flex', flexDirection: 'column' }}>
							{details.missingSkills.skills.map((item, i) => {
								const ik = importanceKey[item.importance] ?? 'mandatory';
								return (
									<Box key={`ms-${i}`} sx={{
										display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5,
										py: 0.75, px: 0.5,
										borderBottom: i < details.missingSkills.skills.length - 1 ? '1px solid #fee2e2' : 'none',
									}}>
										<Typography sx={{ fontSize: '0.80rem', color: '#334155', flex: 1 }}>{item.skill}</Typography>
										<Chip label={t(`jobContent.${ik}`)} size="small"
											sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700, flexShrink: 0, ...importanceChipSx[ik] }} />
									</Box>
								);
							})}
						</Box>
					)}
				</Paper>
			)}

			{/* Strengths */}
			{Array.isArray(details.strengths) && details.strengths.length > 0 && (
				<Paper elevation={0} sx={{ border: '1px solid #bbf7d0', borderRadius: 2.5, p: 2.5 }}>
					<SectionHeader sx={{ mb: 1.5 }} icon={EmojiEventsOutlinedIcon} label={t('appCVMatching.strengths', 'Strengths')} />
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
						{details.strengths.map((s, i) => (
							<Box key={`str-${i}`} sx={{
								borderLeft: '3px solid #629C44', pl: 1.5, py: 0.5,
								borderRadius: '0 8px 8px 0', backgroundColor: 'rgba(98,156,68,0.04)',
							}}>
								<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.5 }}>
									<Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}>{s.title}</Typography>
									{s.importance && (
										<Chip label={s.importance} size="small"
											sx={{ height: 18, fontSize: '0.62rem', fontWeight: 700, flexShrink: 0, backgroundColor: 'rgba(98,156,68,0.12)', color: THEME_GREEN, border: `1px solid rgba(98,156,68,0.25)` }} />
									)}
								</Box>
								<Typography sx={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.55 }}>{s.evidence}</Typography>
							</Box>
						))}
					</Box>
				</Paper>
			)}

			{/* Weaknesses */}
			{Array.isArray(details.weaknesses) && details.weaknesses.length > 0 && (
				<Paper elevation={0} sx={{ border: '1px solid #fde68a', borderRadius: 2.5, p: 2.5 }}>
					<SectionHeader sx={{ mb: 1.5 }} icon={WarningAmberOutlinedIcon} label={t('appCVMatching.weaknesses', 'Weaknesses')} />
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
						{details.weaknesses.map((w, i) => {
							const sevKey = (w.severity || 'medium').toLowerCase();
							const sevSx  = severityChipSx[sevKey] ?? severityChipSx.medium;
							return (
								<Box key={`wk-${i}`} sx={{
									borderLeft: '3px solid #d97706', pl: 1.5, py: 0.5,
									borderRadius: '0 8px 8px 0', backgroundColor: 'rgba(245,158,11,0.04)',
								}}>
									<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.5 }}>
										<Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}>{w.title}</Typography>
										{w.severity && (
											<Chip label={w.severity} size="small"
												sx={{ height: 18, fontSize: '0.62rem', fontWeight: 700, flexShrink: 0, ...sevSx }} />
										)}
									</Box>
									<Typography sx={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.55 }}>{w.evidence}</Typography>
								</Box>
							);
						})}
					</Box>
				</Paper>
			)}

			{/* Red Flags */}
			{Array.isArray(details.redFlags) && details.redFlags.length > 0 && (
				<Paper elevation={0} sx={{ border: '1px solid #fecaca', borderRadius: 2.5, p: 2.5 }}>
					<SectionHeader sx={{ mb: 1.5 }} icon={ReportProblemOutlinedIcon} label={t('appCVMatching.redFlags', 'Red Flags')} />
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
						{details.redFlags.map((rf, i) => {
							const sevKey = (rf.severity || 'medium').toLowerCase();
							const sevSx  = severityChipSx[sevKey] ?? severityChipSx.medium;
							return (
								<Box key={`rf-${i}`}>
									<Box sx={{
										borderLeft: '3px solid #dc2626', pl: 1.5, py: 0.5,
										borderRadius: '0 8px 8px 0', backgroundColor: 'rgba(220,38,38,0.04)',
									}}>
										<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.5 }}>
											<Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}>{rf.title}</Typography>
											{rf.severity && (
												<Chip label={rf.severity} size="small"
													sx={{ height: 18, fontSize: '0.62rem', fontWeight: 700, flexShrink: 0, ...sevSx }} />
											)}
										</Box>
										<Typography sx={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.55 }}>{rf.evidence}</Typography>
									</Box>
									{rf.suggestedInterviewQuestion && (
										<Box sx={{
											mt: 1, mx: 0.5, px: 1.5, py: 1, borderRadius: 1.5,
											backgroundColor: '#f0f9ff', border: '1px solid #bae6fd',
											display: 'flex', alignItems: 'flex-start', gap: 1,
										}}>
											<QuestionAnswerOutlinedIcon sx={{ fontSize: 14, color: '#0369a1', mt: 0.2, flexShrink: 0 }} />
											<Box>
												<Typography sx={{ fontSize: '0.62rem', fontWeight: 700, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.25 }}>
													{t('appCVMatching.suggestedQuestion', 'Suggested interview question')}
												</Typography>
												<Typography sx={{ fontSize: '0.78rem', color: '#0c4a6e', lineHeight: 1.55, fontStyle: 'italic' }}>
													{rf.suggestedInterviewQuestion}
												</Typography>
											</Box>
										</Box>
									)}
								</Box>
							);
						})}
					</Box>
				</Paper>
			)}

			{/* Team notes — internal, never printed (NotesPanel hides itself under @media print) */}
			<NotesPanel targetType="MATCHING_REPORT" targetId={reportData.id} sx={{ mb: 0 }} />

		</Box>
		</>
	);
};

ReportMainColumn.propTypes = {
	finalColor: PropTypes.string,
	confConfig: PropTypes.any,
	confKey: PropTypes.any,
	decision: PropTypes.any,
	detailScores: PropTypes.any,
	details: PropTypes.any,
	finalScore: PropTypes.any,
	recConfig: PropTypes.any,
	recKey: PropTypes.any,
	reportData: PropTypes.any,
};

export default ReportMainColumn;
