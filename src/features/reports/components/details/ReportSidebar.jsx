import PropTypes from 'prop-types';
import SectionHeader from '../../../../shared/ui/SectionHeader.jsx';
import { toLabel } from '../../../../shared/lib/text.js';
import { Box, Chip, Divider, Paper, Stack, Typography } from '@mui/material';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import HubOutlinedIcon from '@mui/icons-material/HubOutlined';
import { THEME_GREEN } from '../../model/reportDetails.js';
import { useTranslation } from 'react-i18next';
import { SKILL_DEPTH_STYLE, STYLE_UNKNOWN, getSeniorityStyle, getLeadershipStyle, getVelocityStyle } from '../../../../shared/lib/clustering.js';

/** Right column of the report: candidate profile and talent clustering. */
const ReportSidebar = ({ candidate }) => {
	const { t } = useTranslation();
	return (
		<>
		<Box sx={{ width: { xs: '100%', md: '30%' }, maxWidth: { md: 340 }, flexShrink: 0, alignSelf: 'flex-start', display: 'flex', flexDirection: 'column', gap: 2 }}>

			{/* Candidate Profile */}
			<Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2.5, p: 2.5 }}>
				<SectionHeader sx={{ mb: 1.5 }} icon={PersonOutlineOutlinedIcon} label={t('appCVMatching.candidateProfile')} />
				{candidate.candidateProfileSummary && (
					<Typography sx={{ fontSize: '0.80rem', color: '#334155', lineHeight: 1.6, mb: 1.5 }}>
						{candidate.candidateProfileSummary}
					</Typography>
				)}
				{Array.isArray(candidate.skills) && candidate.skills.length > 0 && (
					<>
						<Divider sx={{ my: 1.5, borderColor: '#f1f5f9' }} />
						<Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: THEME_GREEN, textTransform: 'uppercase', letterSpacing: '0.07em', mb: 1 }}>
							{t('appCVMatching.skills')}
						</Typography>
						<Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
							{candidate.skills.map((sk, i) => (
								<Chip key={`sk-${i}`} label={sk} size="small"
									sx={{ height: 22, fontSize: '0.72rem', fontWeight: 500, backgroundColor: 'rgba(98,156,68,0.10)', color: '#166534', border: '1px solid rgba(98,156,68,0.25)' }} />
							))}
						</Stack>
					</>
				)}
			</Paper>

			{/* Candidate Clustering */}
			{candidate.candidateClustering && (() => {
				const cl = candidate.candidateClustering;
				const attrRows = [
					{ key: 'skillDepth',             label: t('appCVMatching.clustering.skillDepth'),      value: cl.skillDepth,             ...(SKILL_DEPTH_STYLE[cl.skillDepth] ?? STYLE_UNKNOWN) },
					{ key: 'seniorityLevel',         label: t('appCVMatching.clustering.seniority'),        value: cl.seniorityLevel,         ...getSeniorityStyle(cl.seniorityLevel) },
					{ key: 'leadershipAndInfluence', label: t('appCVMatching.clustering.leadership'),       value: cl.leadershipAndInfluence, ...getLeadershipStyle(cl.leadershipAndInfluence) },
					{ key: 'learningVelocity',       label: t('appCVMatching.clustering.learningVelocity'), value: cl.learningVelocity,       ...getVelocityStyle(cl.learningVelocity) },
				].filter(r => r.value && r.value !== 'unknown');
				const confPct = cl.clusterConfidenceScore != null
					? Math.round(cl.clusterConfidenceScore * 100) : null;
				return (
					<Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2.5, p: 2.5 }}>
						<SectionHeader sx={{ mb: 1.5 }} icon={HubOutlinedIcon} label={t('appCVMatching.clustering.sectionTitle')} />

						{/* Primary cluster */}
						{cl.primaryCluster && (
							<Chip label={cl.primaryCluster} size="small" sx={{
								mb: 1.5, height: 'auto', py: 0.5, fontSize: '0.75rem', fontWeight: 700, width: '100%',
								backgroundColor: 'rgba(99,102,241,0.08)', color: '#4f46e5',
								border: '1px solid rgba(99,102,241,0.2)', borderRadius: 1.5,
								'& .MuiChip-label': { whiteSpace: 'normal', textAlign: 'center' },
							}} />
						)}

						{/* Secondary clusters */}
						{Array.isArray(cl.secondaryClusters) && cl.secondaryClusters.length > 0 && (
							<>
								<Typography sx={{ fontSize: '0.60rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.75 }}>
									{t('appCVMatching.clustering.secondaryClusters')}
								</Typography>
								<Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mb: 1.5 }}>
									{cl.secondaryClusters.map((sc, i) => (
										<Chip key={`sc-${i}`} label={sc} size="small" sx={{ height: 22, fontSize: '0.68rem', fontWeight: 500, backgroundColor: 'rgba(99,102,241,0.05)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.15)' }} />
									))}
								</Stack>
							</>
						)}

						{/* Functional expertise */}
						{Array.isArray(cl.functionalExpertise) && cl.functionalExpertise.length > 0 && (
							<>
								<Divider sx={{ my: 1.25, borderColor: '#f1f5f9' }} />
								<Typography sx={{ fontSize: '0.60rem', fontWeight: 700, color: THEME_GREEN, textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.75 }}>
									{t('appCVMatching.clustering.functionalExpertise')}
								</Typography>
								<Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mb: 0.5 }}>
									{cl.functionalExpertise.map((fe, i) => (
										<Chip key={`fe-${i}`} label={fe} size="small" sx={{ height: 22, fontSize: '0.68rem', fontWeight: 500, backgroundColor: 'rgba(98,156,68,0.08)', color: '#166534', border: '1px solid rgba(98,156,68,0.2)' }} />
									))}
								</Stack>
							</>
						)}

						{/* Attribute rows */}
						{attrRows.length > 0 && (
							<>
								<Divider sx={{ my: 1.25, borderColor: '#f1f5f9' }} />
								<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
									{attrRows.map(row => (
										<Box key={row.key} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
											<Typography sx={{ fontSize: '0.68rem', color: '#64748b', flexShrink: 0 }}>
												{row.label}
											</Typography>
											<Chip label={toLabel(row.value)} size="small" sx={{ height: 18, fontSize: '0.62rem', fontWeight: 600, backgroundColor: row.bg, color: row.color, border: `1px solid ${row.bdr}` }} />
										</Box>
									))}
								</Box>
							</>
						)}

						{/* Industry domains */}
						{Array.isArray(cl.industryDomains) && cl.industryDomains.length > 0 && (
							<>
								<Divider sx={{ my: 1.25, borderColor: '#f1f5f9' }} />
								<Typography sx={{ fontSize: '0.60rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.75 }}>
									{t('appCVMatching.clustering.industryDomains')}
								</Typography>
								<Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
									{cl.industryDomains.map((d, i) => (
										<Chip key={`id-${i}`} label={d} size="small" sx={{ height: 22, fontSize: '0.68rem', fontWeight: 500, backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0' }} />
									))}
								</Stack>
							</>
						)}

						{/* Environment fit */}
						{Array.isArray(cl.environmentFit) && cl.environmentFit.length > 0 && (
							<>
								<Divider sx={{ my: 1.25, borderColor: '#f1f5f9' }} />
								<Typography sx={{ fontSize: '0.60rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.75 }}>
									{t('appCVMatching.clustering.environmentFit')}
								</Typography>
								<Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
									{cl.environmentFit.map((e, i) => (
										<Chip key={`ef-${i}`} label={toLabel(e)} size="small" sx={{ height: 22, fontSize: '0.68rem', fontWeight: 500, backgroundColor: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd' }} />
									))}
								</Stack>
							</>
						)}

						{/* Business impact */}
						{Array.isArray(cl.businessImpact) && cl.businessImpact.length > 0 && (
							<>
								<Divider sx={{ my: 1.25, borderColor: '#f1f5f9' }} />
								<Typography sx={{ fontSize: '0.60rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.75 }}>
									{t('appCVMatching.clustering.businessImpact')}
								</Typography>
								<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
									{cl.businessImpact.map((impact, i) => (
										<Box key={`bi-${i}`} sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
											<CheckCircleOutlineOutlinedIcon sx={{ fontSize: 12, color: THEME_GREEN, mt: 0.25, flexShrink: 0 }} />
											<Typography sx={{ fontSize: '0.73rem', color: '#334155', lineHeight: 1.5 }}>
												{impact}
											</Typography>
										</Box>
									))}
								</Box>
							</>
						)}

						{/* Cluster confidence */}
						{confPct != null && (
							<>
								<Divider sx={{ my: 1.25, borderColor: '#f1f5f9' }} />
								<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.6 }}>
									<Typography sx={{ fontSize: '0.60rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
										{t('appCVMatching.clustering.confidence')}
									</Typography>
									<Typography sx={{ fontSize: '0.70rem', fontWeight: 700, color: THEME_GREEN }}>
										{confPct}%
									</Typography>
								</Box>
								<Box sx={{ height: 4, backgroundColor: '#e2e8f0', borderRadius: 99, overflow: 'hidden' }}>
									<Box sx={{ height: '100%', width: `${confPct}%`, backgroundColor: THEME_GREEN, borderRadius: 99 }} />
								</Box>
							</>
						)}

						{/* Reasoning */}
						{cl.clusterReasoning && (
							<>
								<Divider sx={{ my: 1.25, borderColor: '#f1f5f9' }} />
								<Typography sx={{ fontSize: '0.72rem', color: '#64748b', lineHeight: 1.6, fontStyle: 'italic' }}>
									{cl.clusterReasoning}
								</Typography>
							</>
						)}
					</Paper>
				);
			})()}

		</Box>
		</>
	);
};

ReportSidebar.propTypes = {
	candidate: PropTypes.any,
};

export default ReportSidebar;
