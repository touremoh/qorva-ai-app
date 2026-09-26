import { toLabel } from '../../../../shared/lib/text.js';
import { Box, Typography, Chip, Grid2, Paper, Stack } from '@mui/material';
import PropTypes from 'prop-types';
import HubOutlinedIcon from '@mui/icons-material/HubOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import { SKILL_DEPTH_STYLE, STYLE_UNKNOWN, getSeniorityStyle, getLeadershipStyle, getVelocityStyle } from '../../../../shared/lib/clustering.js';
import * as tokens from '../../../../theme/tokens.js';
import { alpha } from '@mui/material/styles';

const ClusteringTabContent = ({ clustering, t }) => {
	if (!clustering) {
		return (
			<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8, gap: 1.5 }}>
				<HubOutlinedIcon sx={{ fontSize: 40, color: tokens.ink.faint }} />
				<Typography sx={{ fontSize: '0.85rem', color: tokens.ink.subtle, fontWeight: 500 }}>
					{t('appCVContent.noClusteringData', 'No talent intelligence data available for this candidate.')}
				</Typography>
			</Box>
		);
	}

	const cl = clustering;
	const confPct = cl.clusterConfidenceScore != null ? Math.round(cl.clusterConfidenceScore * 100) : null;

	const attrRows = [
		{ key: 'skillDepth',             label: t('appCVMatching.clustering.skillDepth'),      value: cl.skillDepth,             ...(SKILL_DEPTH_STYLE[cl.skillDepth] ?? STYLE_UNKNOWN) },
		{ key: 'seniorityLevel',         label: t('appCVMatching.clustering.seniority'),        value: cl.seniorityLevel,         ...getSeniorityStyle(cl.seniorityLevel) },
		{ key: 'leadershipAndInfluence', label: t('appCVMatching.clustering.leadership'),       value: cl.leadershipAndInfluence, ...getLeadershipStyle(cl.leadershipAndInfluence) },
		{ key: 'learningVelocity',       label: t('appCVMatching.clustering.learningVelocity'), value: cl.learningVelocity,       ...getVelocityStyle(cl.learningVelocity) },
	].filter(r => r.value && r.value !== 'unknown');

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

			{/* Primary cluster + confidence */}
			<Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: `1px solid ${tokens.line.main}` }}>
				<Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
					<Box sx={{ flex: 1, minWidth: 0 }}>
						<Typography sx={{ fontSize: '0.60rem', fontWeight: 700, color: tokens.ink.subtle, textTransform: 'uppercase', letterSpacing: '0.07em', mb: 0.75 }}>
							{t('appCVMatching.clustering.sectionTitle', 'Candidate Clustering')}
						</Typography>
						{cl.primaryCluster && (
							<Chip label={cl.primaryCluster} sx={{
								height: 'auto', py: 0.75, px: 0.5, fontSize: '0.85rem', fontWeight: 700,
								backgroundColor: 'rgba(99,102,241,0.08)', color: tokens.status.accent.main,
								border: '1px solid rgba(99,102,241,0.2)', borderRadius: 1.5,
								'& .MuiChip-label': { whiteSpace: 'normal' },
							}} />
						)}
					</Box>
					{confPct != null && (
						<Box sx={{ minWidth: 100, textAlign: 'right' }}>
							<Typography sx={{ fontSize: '0.60rem', fontWeight: 700, color: tokens.ink.subtle, textTransform: 'uppercase', letterSpacing: '0.07em', mb: 0.5 }}>
								{t('appCVMatching.clustering.confidence', 'Cluster Confidence')}
							</Typography>
							<Typography sx={{ fontSize: '1.4rem', fontWeight: 800, color: tokens.brand.text, lineHeight: 1 }}>
								{confPct}%
							</Typography>
							<Box sx={{ height: 4, backgroundColor: tokens.line.main, borderRadius: 99, overflow: 'hidden', mt: 0.75 }}>
								<Box sx={{ height: '100%', width: `${confPct}%`, backgroundColor: tokens.brand.main, borderRadius: 99 }} />
							</Box>
						</Box>
					)}
				</Box>
			</Paper>

			{/* 4-attribute chips */}
			{attrRows.length > 0 && (
				<Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: `1px solid ${tokens.line.main}` }}>
					<Typography sx={{ fontSize: '0.60rem', fontWeight: 700, color: tokens.ink.subtle, textTransform: 'uppercase', letterSpacing: '0.07em', mb: 1.25 }}>
						{t('appCVMatching.clustering.attributes', 'Profile Attributes')}
					</Typography>
					<Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
						{attrRows.map(row => (
							<Box key={row.key} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.25 }}>
								<Typography sx={{ fontSize: '0.60rem', color: tokens.ink.subtle, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
									{row.label}
								</Typography>
								<Chip label={toLabel(row.value)} size="small" sx={{
									height: 22, fontSize: '0.72rem', fontWeight: 600,
									backgroundColor: row.bg, color: row.color, border: `1px solid ${row.bdr}`,
								}} />
							</Box>
						))}
					</Stack>
				</Paper>
			)}

			{/* Functional Expertise + Industry Domains + Environment Fit */}
			{(cl.functionalExpertise?.length > 0 || cl.industryDomains?.length > 0 || cl.environmentFit?.length > 0) && (
				<Grid2 container spacing={2}>
					{cl.functionalExpertise?.length > 0 && (
						<Grid2 size={{ xs: 12, sm: 4 }}>
							<Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: `1px solid ${tokens.line.main}`, height: '100%' }}>
								<Typography sx={{ fontSize: '0.60rem', fontWeight: 700, color: tokens.brand.text, textTransform: 'uppercase', letterSpacing: '0.07em', mb: 1 }}>
									{t('appCVMatching.clustering.functionalExpertise', 'Functional Expertise')}
								</Typography>
								<Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
									{cl.functionalExpertise.map((fe, i) => (
										<Chip key={i} label={fe} size="small" sx={{ height: 22, fontSize: '0.68rem', fontWeight: 500, backgroundColor: alpha(tokens.brand.main, 0.08), color: tokens.status.success.text, border: `1px solid ${alpha(tokens.brand.main, 0.2)}` }} />
									))}
								</Stack>
							</Paper>
						</Grid2>
					)}
					{cl.industryDomains?.length > 0 && (
						<Grid2 size={{ xs: 12, sm: 4 }}>
							<Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: `1px solid ${tokens.line.main}`, height: '100%' }}>
								<Typography sx={{ fontSize: '0.60rem', fontWeight: 700, color: tokens.ink.subtle, textTransform: 'uppercase', letterSpacing: '0.07em', mb: 1 }}>
									{t('appCVMatching.clustering.industryDomains', 'Industry Domains')}
								</Typography>
								<Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
									{cl.industryDomains.map((d, i) => (
										<Chip key={i} label={d} size="small" sx={{ height: 22, fontSize: '0.68rem', fontWeight: 500, backgroundColor: tokens.surface.muted, color: tokens.ink.body, border: `1px solid ${tokens.line.main}` }} />
									))}
								</Stack>
							</Paper>
						</Grid2>
					)}
					{cl.environmentFit?.length > 0 && (
						<Grid2 size={{ xs: 12, sm: 4 }}>
							<Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: `1px solid ${tokens.line.main}`, height: '100%' }}>
								<Typography sx={{ fontSize: '0.60rem', fontWeight: 700, color: tokens.ink.subtle, textTransform: 'uppercase', letterSpacing: '0.07em', mb: 1 }}>
									{t('appCVMatching.clustering.environmentFit', 'Environment Fit')}
								</Typography>
								<Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
									{cl.environmentFit.map((e, i) => (
										<Chip key={i} label={toLabel(e)} size="small" sx={{ height: 22, fontSize: '0.68rem', fontWeight: 500, backgroundColor: tokens.status.info.pale, color: tokens.status.info.main, border: `1px solid ${tokens.status.info.border}` }} />
									))}
								</Stack>
							</Paper>
						</Grid2>
					)}
				</Grid2>
			)}

			{/* Business Impact */}
			{cl.businessImpact?.length > 0 && (
				<Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: `1px solid ${tokens.line.main}` }}>
					<Typography sx={{ fontSize: '0.60rem', fontWeight: 700, color: tokens.ink.subtle, textTransform: 'uppercase', letterSpacing: '0.07em', mb: 1 }}>
						{t('appCVMatching.clustering.businessImpact', 'Business Impact')}
					</Typography>
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
						{cl.businessImpact.map((impact, i) => (
							<Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75 }}>
								<CheckCircleOutlineOutlinedIcon sx={{ fontSize: 14, color: tokens.brand.text, mt: 0.2, flexShrink: 0 }} />
								<Typography sx={{ fontSize: '0.82rem', color: tokens.ink.body, lineHeight: 1.55 }}>
									{impact}
								</Typography>
							</Box>
						))}
					</Box>
				</Paper>
			)}

			{/* Secondary Clusters */}
			{cl.secondaryClusters?.length > 0 && (
				<Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: `1px solid ${tokens.line.main}` }}>
					<Typography sx={{ fontSize: '0.60rem', fontWeight: 700, color: tokens.ink.subtle, textTransform: 'uppercase', letterSpacing: '0.07em', mb: 1 }}>
						{t('appCVMatching.clustering.secondaryClusters', 'Secondary Clusters')}
					</Typography>
					<Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
						{cl.secondaryClusters.map((sc, i) => (
							<Chip key={i} label={sc} size="small" sx={{ height: 22, fontSize: '0.72rem', fontWeight: 500, backgroundColor: 'rgba(99,102,241,0.05)', color: tokens.status.accent.bright, border: '1px solid rgba(99,102,241,0.15)' }} />
						))}
					</Stack>
				</Paper>
			)}

			{/* Reasoning */}
			{cl.clusterReasoning && (
				<Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: `1px solid ${tokens.line.main}` }}>
					<Typography sx={{ fontSize: '0.60rem', fontWeight: 700, color: tokens.ink.subtle, textTransform: 'uppercase', letterSpacing: '0.07em', mb: 1 }}>
						{t('appCVMatching.clustering.reasoning', 'Reasoning')}
					</Typography>
					<Typography sx={{ fontSize: '0.82rem', color: tokens.ink.muted, lineHeight: 1.65, fontStyle: 'italic' }}>
						{cl.clusterReasoning}
					</Typography>
				</Paper>
			)}
		</Box>
	);
};

ClusteringTabContent.propTypes = {
	clustering: PropTypes.shape({
		primaryCluster: PropTypes.string,
		secondaryClusters: PropTypes.arrayOf(PropTypes.string),
		functionalExpertise: PropTypes.arrayOf(PropTypes.string),
		skillDepth: PropTypes.string,
		seniorityLevel: PropTypes.string,
		leadershipAndInfluence: PropTypes.string,
		learningVelocity: PropTypes.string,
		industryDomains: PropTypes.arrayOf(PropTypes.string),
		environmentFit: PropTypes.arrayOf(PropTypes.string),
		businessImpact: PropTypes.arrayOf(PropTypes.string),
		clusterConfidenceScore: PropTypes.number,
		clusterReasoning: PropTypes.string,
	}),
	t: PropTypes.func.isRequired,
};

// ─── Local helpers ────────────────────────────────────────────────────────────

export default ClusteringTabContent;
