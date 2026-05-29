import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
	Box,
	Button,
	CircularProgress,
	Typography,
	Avatar,
	Chip,
	Divider,
	FormControlLabel,
	IconButton,
	Grid2,
	MenuItem,
	Paper,
	Select,
	Stack,
	Switch,
	Tab,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Tabs,
	TextField,
	Tooltip,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { useReactToPrint } from 'react-to-print';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CloseIcon from '@mui/icons-material/Close';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';
import LanguageIcon from '@mui/icons-material/Language';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import SchoolIcon from '@mui/icons-material/School';
import ConstructionIcon from '@mui/icons-material/Construction';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import DownhillSkiingIcon from '@mui/icons-material/DownhillSkiing';
import LabelIcon from '@mui/icons-material/Label';
import ContactsIcon from '@mui/icons-material/Contacts';
import TranslateIcon from '@mui/icons-material/Translate';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import FingerprintOutlinedIcon from '@mui/icons-material/FingerprintOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import CheckIcon from '@mui/icons-material/Check';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import HubOutlinedIcon from '@mui/icons-material/HubOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import apiClient from '../../../../axiosConfig.js';
import { getTenantById } from '../../../services/tenantService.js';
import { updateCV } from '../../../services/cvService.js';
import { TENANT_ID } from '../../../constants.js';

// ─── Clustering style helpers ────────────────────────────────────────────────

const toLabel = (str = '') =>
	str.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim().replace(/^\w/, c => c.toUpperCase());

const SKILL_DEPTH_STYLE = {
	specialist: { color: '#7c3aed', bg: 'rgba(124,58,237,0.08)', bdr: 'rgba(124,58,237,0.2)' },
	generalist: { color: '#2563eb', bg: 'rgba(37,99,235,0.08)',  bdr: 'rgba(37,99,235,0.2)'  },
	tShaped:    { color: '#0891b2', bg: 'rgba(8,145,178,0.08)',  bdr: 'rgba(8,145,178,0.2)'  },
	hybrid:     { color: '#6366f1', bg: 'rgba(99,102,241,0.08)', bdr: 'rgba(99,102,241,0.2)' },
};
const STYLE_UNKNOWN = { color: '#94a3b8', bg: 'rgba(148,163,184,0.08)', bdr: 'rgba(148,163,184,0.2)' };
const STYLE_GREEN   = { color: '#629C44', bg: 'rgba(98,156,68,0.08)',   bdr: 'rgba(98,156,68,0.2)'   };
const STYLE_AMBER   = { color: '#d97706', bg: 'rgba(245,158,11,0.08)',  bdr: 'rgba(245,158,11,0.2)'  };
const STYLE_SLATE   = { color: '#64748b', bg: 'rgba(100,116,139,0.08)', bdr: 'rgba(100,116,139,0.2)' };

const getSeniorityStyle = (v) => {
	const lower = (v || '').toLowerCase();
	const HIGH = new Set(['senior', 'lead', 'principal', 'manager', 'director', 'executive']);
	if (HIGH.has(lower))      return STYLE_GREEN;
	if (lower === 'midlevel') return STYLE_AMBER;
	return STYLE_SLATE;
};

const getLeadershipStyle = (v) => {
	const lower = (v || '').toLowerCase();
	const HIGH = new Set(['crossfunctionalleader', 'strategicleader', 'executiveinfluence']);
	if (HIGH.has(lower))      return STYLE_GREEN;
	if (lower === 'teamlead') return STYLE_AMBER;
	return STYLE_SLATE;
};

const getVelocityStyle = (v) => {
	const lower = (v || '').toLowerCase();
	if (lower === 'veryhigh') return { color: '#16a34a', bg: 'rgba(22,163,74,0.10)',  bdr: 'rgba(22,163,74,0.3)'  };
	if (lower === 'high')     return STYLE_GREEN;
	if (lower === 'medium')   return STYLE_AMBER;
	if (lower === 'low')      return { color: '#dc2626', bg: 'rgba(220,38,38,0.10)',  bdr: 'rgba(220,38,38,0.3)'  };
	return STYLE_UNKNOWN;
};

// ─── ClusteringTabContent ─────────────────────────────────────────────────────

const ClusteringTabContent = ({ clustering, t }) => {
	if (!clustering) {
		return (
			<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8, gap: 1.5 }}>
				<HubOutlinedIcon sx={{ fontSize: 40, color: '#cbd5e1' }} />
				<Typography sx={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>
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
			<Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: '1px solid #e2e8f0' }}>
				<Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
					<Box sx={{ flex: 1, minWidth: 0 }}>
						<Typography sx={{ fontSize: '0.60rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', mb: 0.75 }}>
							{t('appCVMatching.clustering.sectionTitle', 'Candidate Clustering')}
						</Typography>
						{cl.primaryCluster && (
							<Chip label={cl.primaryCluster} sx={{
								height: 'auto', py: 0.75, px: 0.5, fontSize: '0.85rem', fontWeight: 700,
								backgroundColor: 'rgba(99,102,241,0.08)', color: '#4f46e5',
								border: '1px solid rgba(99,102,241,0.2)', borderRadius: 1.5,
								'& .MuiChip-label': { whiteSpace: 'normal' },
							}} />
						)}
					</Box>
					{confPct != null && (
						<Box sx={{ minWidth: 100, textAlign: 'right' }}>
							<Typography sx={{ fontSize: '0.60rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', mb: 0.5 }}>
								{t('appCVMatching.clustering.confidence', 'Cluster Confidence')}
							</Typography>
							<Typography sx={{ fontSize: '1.4rem', fontWeight: 800, color: '#629C44', lineHeight: 1 }}>
								{confPct}%
							</Typography>
							<Box sx={{ height: 4, backgroundColor: '#e2e8f0', borderRadius: 99, overflow: 'hidden', mt: 0.75 }}>
								<Box sx={{ height: '100%', width: `${confPct}%`, backgroundColor: '#629C44', borderRadius: 99 }} />
							</Box>
						</Box>
					)}
				</Box>
			</Paper>

			{/* 4-attribute chips */}
			{attrRows.length > 0 && (
				<Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: '1px solid #e2e8f0' }}>
					<Typography sx={{ fontSize: '0.60rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', mb: 1.25 }}>
						{t('appCVMatching.clustering.attributes', 'Profile Attributes')}
					</Typography>
					<Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
						{attrRows.map(row => (
							<Box key={row.key} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.25 }}>
								<Typography sx={{ fontSize: '0.60rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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
							<Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid #e2e8f0', height: '100%' }}>
								<Typography sx={{ fontSize: '0.60rem', fontWeight: 700, color: '#629C44', textTransform: 'uppercase', letterSpacing: '0.07em', mb: 1 }}>
									{t('appCVMatching.clustering.functionalExpertise', 'Functional Expertise')}
								</Typography>
								<Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
									{cl.functionalExpertise.map((fe, i) => (
										<Chip key={i} label={fe} size="small" sx={{ height: 22, fontSize: '0.68rem', fontWeight: 500, backgroundColor: 'rgba(98,156,68,0.08)', color: '#166534', border: '1px solid rgba(98,156,68,0.2)' }} />
									))}
								</Stack>
							</Paper>
						</Grid2>
					)}
					{cl.industryDomains?.length > 0 && (
						<Grid2 size={{ xs: 12, sm: 4 }}>
							<Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid #e2e8f0', height: '100%' }}>
								<Typography sx={{ fontSize: '0.60rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', mb: 1 }}>
									{t('appCVMatching.clustering.industryDomains', 'Industry Domains')}
								</Typography>
								<Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
									{cl.industryDomains.map((d, i) => (
										<Chip key={i} label={d} size="small" sx={{ height: 22, fontSize: '0.68rem', fontWeight: 500, backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0' }} />
									))}
								</Stack>
							</Paper>
						</Grid2>
					)}
					{cl.environmentFit?.length > 0 && (
						<Grid2 size={{ xs: 12, sm: 4 }}>
							<Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid #e2e8f0', height: '100%' }}>
								<Typography sx={{ fontSize: '0.60rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', mb: 1 }}>
									{t('appCVMatching.clustering.environmentFit', 'Environment Fit')}
								</Typography>
								<Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
									{cl.environmentFit.map((e, i) => (
										<Chip key={i} label={toLabel(e)} size="small" sx={{ height: 22, fontSize: '0.68rem', fontWeight: 500, backgroundColor: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd' }} />
									))}
								</Stack>
							</Paper>
						</Grid2>
					)}
				</Grid2>
			)}

			{/* Business Impact */}
			{cl.businessImpact?.length > 0 && (
				<Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: '1px solid #e2e8f0' }}>
					<Typography sx={{ fontSize: '0.60rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', mb: 1 }}>
						{t('appCVMatching.clustering.businessImpact', 'Business Impact')}
					</Typography>
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
						{cl.businessImpact.map((impact, i) => (
							<Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75 }}>
								<CheckCircleOutlineOutlinedIcon sx={{ fontSize: 14, color: '#629C44', mt: 0.2, flexShrink: 0 }} />
								<Typography sx={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.55 }}>
									{impact}
								</Typography>
							</Box>
						))}
					</Box>
				</Paper>
			)}

			{/* Secondary Clusters */}
			{cl.secondaryClusters?.length > 0 && (
				<Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: '1px solid #e2e8f0' }}>
					<Typography sx={{ fontSize: '0.60rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', mb: 1 }}>
						{t('appCVMatching.clustering.secondaryClusters', 'Secondary Clusters')}
					</Typography>
					<Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
						{cl.secondaryClusters.map((sc, i) => (
							<Chip key={i} label={sc} size="small" sx={{ height: 22, fontSize: '0.72rem', fontWeight: 500, backgroundColor: 'rgba(99,102,241,0.05)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.15)' }} />
						))}
					</Stack>
				</Paper>
			)}

			{/* Reasoning */}
			{cl.clusterReasoning && (
				<Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: '1px solid #e2e8f0' }}>
					<Typography sx={{ fontSize: '0.60rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', mb: 1 }}>
						{t('appCVMatching.clustering.reasoning', 'Reasoning')}
					</Typography>
					<Typography sx={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.65, fontStyle: 'italic' }}>
						{cl.clusterReasoning}
					</Typography>
				</Paper>
			)}
		</Box>
	);
};

// ─── Local helpers ────────────────────────────────────────────────────────────

const getInitials = (name = '') =>
	name.split(' ').map(p => p[0]).filter(Boolean).join('').slice(0, 2).toUpperCase();

const SectionHeader = ({ Icon, title, onEdit }) => (
	<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, pb: 0.75, borderBottom: '2px solid #629C44' }}>
		<Icon sx={{ fontSize: 14, color: '#629C44' }} />
		<Typography sx={{
			fontWeight: 700,
			fontSize: '0.68rem',
			color: '#64748b',
			textTransform: 'uppercase',
			letterSpacing: '0.08em',
			flex: 1,
		}}>
			{title}
		</Typography>
		{onEdit && (
			<IconButton size="small" onClick={onEdit} sx={{ p: 0.25, color: '#94a3b8', '&:hover': { color: '#629C44' } }}>
				<EditOutlinedIcon sx={{ fontSize: 14 }} />
			</IconButton>
		)}
	</Box>
);

const Card = ({ children, sx }) => (
	<Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: '1px solid #e2e8f0', ...sx }}>
		{children}
	</Paper>
);

// ─── Main component ───────────────────────────────────────────────────────────

const AppCVDetails = ({ cv, onClose, onUpdate }) => {
	const { t } = useTranslation();

	const [activeTab, setActiveTab] = useState(0);
	const resumeRef     = useRef(null);
	const clusteringRef = useRef(null);
	const printResume     = useReactToPrint({ contentRef: resumeRef });
	const printClustering = useReactToPrint({ contentRef: clusteringRef });
	const handleDownload  = useCallback(
		() => activeTab === 0 ? printResume() : printClustering(),
		[activeTab, printResume, printClustering],
	);

	const [anonymized, setAnonymized] = useState(false);
	const [refCopied, setRefCopied] = useState(false);
	const [editingSection, setEditingSection] = useState(null);
	const [draft, setDraft] = useState({});
	const [tagInput, setTagInput] = useState('');
	const [isSaving, setIsSaving] = useState(false);

	const handleEdit = useCallback((section) => {
		if (section === 'availability') {
			setDraft(cv?.personalInformation?.availability ?? {});
		} else if (section === 'tags') {
			setDraft({ tags: cv?.tags ?? [] });
		}
		setEditingSection(section);
	}, [cv]);

	const handleCancelEdit = useCallback(() => {
		setEditingSection(null);
		setDraft({});
		setTagInput('');
	}, []);

	const handleSave = useCallback(async () => {
		if (!cv?.id) return;
		setIsSaving(true);
		try {
			const patch = editingSection === 'availability'
				? { personalInformation: { availability: draft } }
				: { tags: draft.tags };
			const res = await updateCV(cv.id, patch);
			const updated = res?.data?.data ?? { ...cv, ...patch };
			onUpdate?.(updated);
			setEditingSection(null);
			setDraft({});
			setTagInput('');
		} catch (err) {
			console.error('Failed to save CV:', err);
		} finally {
			setIsSaving(false);
		}
	}, [cv, draft, editingSection, onUpdate]);

	const handleAddTag = useCallback(() => {
		const val = tagInput.trim();
		if (!val || draft.tags?.includes(val)) return;
		setDraft(d => ({ ...d, tags: [...(d.tags ?? []), val] }));
		setTagInput('');
	}, [tagInput, draft.tags]);

	const handleRemoveTag = useCallback((tag) => {
		setDraft(d => ({ ...d, tags: (d.tags ?? []).filter(t => t !== tag) }));
	}, []);

	const handleCopyRef = useCallback(() => {
		const ref = cv?.applicantNumber;
		if (!ref) return;
		navigator.clipboard.writeText(ref).then(() => {
			setRefCopied(true);
			setTimeout(() => setRefCopied(false), 2000);
		});
	}, [cv?.applicantNumber]);
	const [tenant, setTenant] = useState(null);
	const [tenantLogoUrl, setTenantLogoUrl] = useState('');

	useEffect(() => {
		const tenantId = localStorage.getItem(TENANT_ID);
		if (!tenantId) return;
		getTenantById(tenantId)
			.then(res => setTenant(res?.data?.data ?? null))
			.catch(() => {});
	}, []);

	useEffect(() => {
		if (!tenant?.companyLogoUrl) { setTenantLogoUrl(''); return; }
		let objectUrl = '';
		apiClient.get('/tenants/logo', { responseType: 'blob' })
			.then(res => {
				objectUrl = URL.createObjectURL(res.data);
				setTenantLogoUrl(objectUrl);
			})
			.catch(() => setTenantLogoUrl(''));
		return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
	}, [tenant?.companyLogoUrl]);

	if (!cv) {
		return (
			<Box sx={{ p: 3 }}>
				<Typography sx={{ fontSize: '0.88rem', color: '#94a3b8' }}>
					{t('appCVContent.selectCVToSeeDetails')}
				</Typography>
			</Box>
		);
	}

	const {
		applicantNumber,
		candidateClustering,
		personalInformation: pi = {},
		candidateProfileSummary,
		workExperience = [],
		education = [],
		certifications = [],
		skillsAndQualifications,
		projectsAndAchievements = [],
		interestsAndHobbies = [],
		references = [],
		tags = [],
		lastUpdatedAt,
	} = cv;

	const contact = pi.contact || {};
	const skills = skillsAndQualifications || {};

	return (
		<Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>

			{/* Sticky action bar — not printed */}
			<Box sx={{
				display: 'flex',
				alignItems: 'center',
				px: 2.5,
				py: 1.25,
				backgroundColor: '#ffffff',
				borderBottom: '1px solid #e2e8f0',
				flexShrink: 0,
			}}>
				{/* Anonymize toggle */}
				<Tooltip title={anonymized ? t('appCVContent.showIdentity') : t('appCVContent.anonymize')}>
					<Box
						onClick={() => setAnonymized(a => !a)}
						sx={{
							display: 'flex', alignItems: 'center', gap: 0.75,
							px: 1.25, py: 0.5, borderRadius: 1.5, cursor: 'pointer',
							border: `1px solid ${anonymized ? '#fca5a5' : '#e2e8f0'}`,
							backgroundColor: anonymized ? '#fef2f2' : '#f8fafc',
							transition: 'all 0.15s ease',
							'&:hover': { backgroundColor: anonymized ? '#fee2e2' : '#f1f5f9' },
						}}
					>
						{anonymized
							? <VisibilityOffOutlinedIcon sx={{ fontSize: 14, color: '#ef4444' }} />
							: <VisibilityOutlinedIcon sx={{ fontSize: 14, color: '#64748b' }} />
						}
						<Typography sx={{
							fontSize: '0.72rem', fontWeight: 600,
							color: anonymized ? '#ef4444' : '#64748b',
						}}>
							{anonymized ? t('appCVContent.showIdentity') : t('appCVContent.anonymize')}
						</Typography>
					</Box>
				</Tooltip>

				<Box sx={{ flexGrow: 1 }} />

				<Tooltip title={t('appCVContent.downloadCV')}>
					<IconButton
						size="small"
						onClick={handleDownload}
						sx={{
							color: '#64748b',
							borderRadius: 1.5,
							border: '1px solid #e2e8f0',
							mr: 1,
							'&:hover': { backgroundColor: '#f1f5f9' },
						}}
					>
						<FileDownloadIcon sx={{ fontSize: 16 }} />
					</IconButton>
				</Tooltip>

				{onClose && (
					<IconButton
						size="small"
						onClick={onClose}
						sx={{
							color: '#64748b',
							borderRadius: 1.5,
							border: '1px solid #e2e8f0',
							'&:hover': { backgroundColor: '#f1f5f9' },
						}}
					>
						<CloseIcon sx={{ fontSize: 16 }} />
					</IconButton>
				)}
			</Box>

			{/* Tab bar */}
			<Tabs
				value={activeTab}
				onChange={(_, v) => setActiveTab(v)}
				sx={{
					px: 2.5,
					borderBottom: '1px solid #e2e8f0',
					minHeight: 40,
					backgroundColor: '#ffffff',
					flexShrink: 0,
					'& .MuiTab-root': { minHeight: 40, fontSize: '0.78rem', textTransform: 'none', fontWeight: 600 },
				}}
			>
				<Tab label={t('appCVContent.tabResume', 'Resume')} icon={<InfoOutlinedIcon sx={{ fontSize: 15 }} />} iconPosition="start" />
				<Tab label={t('appCVContent.tabTalentIntelligence', 'Talent Intelligence')} icon={<HubOutlinedIcon sx={{ fontSize: 15 }} />} iconPosition="start" />
			</Tabs>

			{/* Resume tab — always in DOM for print ref */}
			<Box ref={resumeRef} sx={{ display: activeTab === 0 ? 'block' : 'none', flex: 1, overflowY: 'auto', p: 2.5, textAlign: 'left' }}>

				{/* Company branding header */}
				{tenant && (
					<Box sx={{
						display: 'flex', alignItems: 'center', gap: 2,
						px: 2, py: 1.5, mb: 2.5,
						borderRadius: 2, border: '1px solid #e2e8f0',
						backgroundColor: '#ffffff',
					}}>
						{tenantLogoUrl ? (
							<Box
								component="img"
								src={tenantLogoUrl}
								alt={tenant.tenantName}
								sx={{ height: 36, maxWidth: 100, objectFit: 'contain', flexShrink: 0 }}
							/>
						) : (
							<Box sx={{
								width: 36, height: 36, borderRadius: 1.5, flexShrink: 0,
								display: 'flex', alignItems: 'center', justifyContent: 'center',
								backgroundColor: 'rgba(98,156,68,0.08)', border: '1px solid rgba(98,156,68,0.2)',
							}}>
								<BusinessOutlinedIcon sx={{ fontSize: 18, color: '#629C44' }} />
							</Box>
						)}
						<Box sx={{ flex: 1, minWidth: 0 }}>
							<Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a', lineHeight: 1.3 }}>
								{tenant.tenantName}
							</Typography>
							<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 0.4 }}>
								{tenant.contactEmail && (
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
										<EmailIcon sx={{ fontSize: 11, color: '#94a3b8' }} />
										<Typography sx={{ fontSize: '0.72rem', color: '#64748b' }}>
											{tenant.contactEmail}
										</Typography>
									</Box>
								)}
								{tenant.phoneNumber && (
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
										<PhoneIcon sx={{ fontSize: 11, color: '#94a3b8' }} />
										<Typography sx={{ fontSize: '0.72rem', color: '#64748b' }}>
											{tenant.phoneNumber}
										</Typography>
									</Box>
								)}
								{tenant.websiteUrl && (
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
										<LanguageIcon sx={{ fontSize: 11, color: '#94a3b8' }} />
										<Typography
											component="a"
											href={tenant.websiteUrl}
											target="_blank"
											rel="noopener noreferrer"
											sx={{ fontSize: '0.72rem', color: '#629C44', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
										>
											{tenant.websiteUrl.replace(/^https?:\/\//, '')}
										</Typography>
									</Box>
								)}
							</Box>
						</Box>
						<Typography sx={{
							fontSize: '0.65rem', color: '#cbd5e1', fontStyle: 'italic',
							flexShrink: 0, alignSelf: 'flex-start',
						}}>
							{t('appCVContent.presentedBy')}
						</Typography>
					</Box>
				)}

				{/* Candidate header card */}
				<Card sx={{ mb: 2, display: 'flex', alignItems: 'flex-start', gap: 2 }}>
					{anonymized ? (
						<Avatar sx={{
							width: 52, height: 52, flexShrink: 0,
							backgroundColor: '#f1f5f9', color: '#94a3b8',
							border: '2px dashed #cbd5e1',
						}}>
							<PersonOutlinedIcon sx={{ fontSize: 28 }} />
						</Avatar>
					) : (
						<Avatar sx={{
							width: 52, height: 52,
							fontSize: '1.1rem', fontWeight: 700,
							backgroundColor: '#629C44', color: '#ffffff',
							flexShrink: 0,
						}}>
							{getInitials(pi.name)}
						</Avatar>
					)}
					<Box sx={{ flex: 1, minWidth: 0 }}>
						{anonymized ? (
							<Tooltip title={refCopied ? t('appCVContent.copied', 'Copied!') : t('appCVContent.copyReference', 'Copy reference')} placement="top">
								<Box
									onClick={applicantNumber ? handleCopyRef : undefined}
									sx={{
										display: 'inline-flex', alignItems: 'center', gap: 0.75,
										cursor: applicantNumber ? 'pointer' : 'default',
										px: 1, py: 0.4, borderRadius: 1.5,
										border: `1px solid ${refCopied ? 'rgba(98,156,68,0.3)' : '#e2e8f0'}`,
										backgroundColor: refCopied ? 'rgba(98,156,68,0.06)' : '#f8fafc',
										transition: 'all 0.15s ease',
										'&:hover': applicantNumber ? { backgroundColor: '#f1f5f9', borderColor: '#cbd5e1' } : {},
									}}
								>
									<Typography sx={{ fontWeight: 700, fontSize: '1rem', lineHeight: 1.2, fontFamily: 'monospace', letterSpacing: '0.04em', color: refCopied ? '#629C44' : '#64748b' }}>
										{applicantNumber ? `#${applicantNumber}` : t('appCVContent.identityHidden', 'Identity hidden')}
									</Typography>
									{applicantNumber && (
										refCopied
											? <CheckIcon sx={{ fontSize: 14, color: '#629C44' }} />
											: <ContentCopyOutlinedIcon sx={{ fontSize: 13, color: '#94a3b8' }} />
									)}
								</Box>
							</Tooltip>
						) : (
							<Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#0f172a', lineHeight: 1.2 }}>
								{pi.name}
							</Typography>
						)}
						{pi.role && (
							<Typography sx={{ fontSize: '0.85rem', color: '#64748b', mt: 0.25 }}>
								{pi.role}
							</Typography>
						)}
						{/* Reference number — always visible */}
						{applicantNumber && (
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
								<FingerprintOutlinedIcon sx={{ fontSize: 11, color: '#94a3b8' }} />
								<Typography sx={{ fontSize: '0.70rem', color: '#94a3b8', fontFamily: 'monospace', letterSpacing: '0.03em' }}>
									{t('appCVContent.referenceNumber')}: {applicantNumber}
								</Typography>
							</Box>
						)}
						{/* Contact details — hidden when anonymized */}
						{!anonymized ? (
							<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1.25 }}>
								{contact.phone && (
									<Chip icon={<PhoneIcon />} label={contact.phone} size="small" sx={contactChipSx} />
								)}
								{contact.email && (
									<Chip icon={<EmailIcon />} label={contact.email} size="small" sx={contactChipSx} />
								)}
								{contact.socialLinks?.linkedin && (
									<Chip icon={<LinkedInIcon />} label="LinkedIn" size="small" sx={contactChipSx}
										component="a" href={contact.socialLinks.linkedin} target="_blank" clickable />
								)}
								{contact.socialLinks?.github && (
									<Chip icon={<GitHubIcon />} label="GitHub" size="small" sx={contactChipSx}
										component="a" href={contact.socialLinks.github} target="_blank" clickable />
								)}
								{contact.socialLinks?.website && (
									<Chip icon={<LanguageIcon />} label="Portfolio" size="small" sx={contactChipSx}
										component="a" href={contact.socialLinks.website} target="_blank" clickable />
								)}
							</Box>
						) : (
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
								<VisibilityOffOutlinedIcon sx={{ fontSize: 12, color: '#cbd5e1' }} />
								<Typography sx={{ fontSize: '0.72rem', color: '#cbd5e1', fontStyle: 'italic' }}>
									{t('appCVContent.contactHidden')}
								</Typography>
							</Box>
						)}
					</Box>
				</Card>

				{/* Summary */}
				{candidateProfileSummary && (
					<Card sx={{ mb: 2 }}>
						<SectionHeader Icon={InfoOutlinedIcon} title={t('appCVContent.summary')} />
						<Typography sx={{ fontSize: '0.84rem', color: '#334155', lineHeight: 1.7 }}>
							{candidateProfileSummary}
						</Typography>
					</Card>
				)}

				{/* Availability */}
				{(pi.availability || editingSection === 'availability') && (
					<Card sx={{ mb: 2 }}>
						<SectionHeader
							Icon={AccessTimeOutlinedIcon}
							title={t('appCVContent.availability.title')}
							onEdit={editingSection !== 'availability' ? () => handleEdit('availability') : undefined}
						/>
						{editingSection === 'availability' ? (
							<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
								{/* Status */}
								<Box>
									<Typography sx={availLabelSx}>{t('appCVContent.availability.status', 'Status')}</Typography>
									<Select
										size="small"
										value={draft.status ?? ''}
										onChange={e => setDraft(d => ({ ...d, status: e.target.value }))}
										displayEmpty
										sx={{ fontSize: '0.82rem', minWidth: 200 }}
									>
										<MenuItem value="" sx={{ fontSize: '0.82rem' }}><em>—</em></MenuItem>
										{['activelyLooking', 'openButNotSearching', 'notAvailable', 'freelanceOnly'].map(s => (
											<MenuItem key={s} value={s} sx={{ fontSize: '0.82rem' }}>
												{t(`appCVContent.availability.statusValue.${s}`, s)}
											</MenuItem>
										))}
									</Select>
								</Box>
								{/* Toggles */}
								<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
									{[
										{ key: 'openToWork',        label: t('appCVContent.availability.openToWork', 'Open to work') },
										{ key: 'remoteOnly',        label: t('appCVContent.availability.remoteOnly', 'Remote only') },
										{ key: 'willingToRelocate', label: t('appCVContent.availability.willingToRelocate', 'Willing to relocate') },
									].map(({ key, label }) => (
										<FormControlLabel
											key={key}
											label={<Typography sx={{ fontSize: '0.78rem', color: '#334155' }}>{label}</Typography>}
											control={
												<Switch
													size="small"
													checked={!!draft[key]}
													onChange={e => setDraft(d => ({ ...d, [key]: e.target.checked }))}
													sx={{ '& .MuiSwitch-thumb': { width: 12, height: 12 }, '& .MuiSwitch-track': { borderRadius: 6 } }}
												/>
											}
											sx={{ mr: 1 }}
										/>
									))}
								</Box>
								{/* Dates & notice */}
								<Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
									<Box>
										<Typography sx={availLabelSx}>{t('appCVContent.availability.availableFrom', 'Available from')}</Typography>
										<TextField
											size="small"
											type="date"
											value={draft.availableFrom ?? ''}
											onChange={e => setDraft(d => ({ ...d, availableFrom: e.target.value }))}
											InputProps={{ sx: { fontSize: '0.82rem' } }}
											InputLabelProps={{ shrink: true }}
										/>
									</Box>
									<Box>
										<Typography sx={availLabelSx}>{t('appCVContent.availability.noticePeriod', 'Notice period (days)')}</Typography>
										<TextField
											size="small"
											type="number"
											value={draft.noticePeriodDays ?? ''}
											onChange={e => setDraft(d => ({ ...d, noticePeriodDays: e.target.value === '' ? null : Number(e.target.value) }))}
											inputProps={{ min: 0 }}
											sx={{ width: 100 }}
											InputProps={{ sx: { fontSize: '0.82rem' } }}
										/>
									</Box>
								</Box>
								{/* Save / Cancel */}
								<Box sx={{ display: 'flex', gap: 1, pt: 0.5 }}>
									<Button
										size="small"
										variant="contained"
										disabled={isSaving}
										onClick={handleSave}
										startIcon={isSaving ? <CircularProgress size={12} color="inherit" /> : null}
										sx={{ textTransform: 'none', fontSize: '0.78rem', backgroundColor: '#629C44', '&:hover': { backgroundColor: '#528035' }, borderRadius: 1.5, boxShadow: 'none', fontWeight: 600 }}
									>
										{t('appCVContent.save', 'Save')}
									</Button>
									<Button
										size="small"
										onClick={handleCancelEdit}
										sx={{ textTransform: 'none', fontSize: '0.78rem', color: '#64748b', borderRadius: 1.5 }}
									>
										{t('appCVContent.cancel')}
									</Button>
								</Box>
							</Box>
						) : (
						<Grid2 container spacing={2}>
							<Grid2 size={{ xs: 12 }}>
								<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, alignItems: 'center' }}>
									{pi.availability.status && (
										<Chip
											label={t(`appCVContent.availability.statusValue.${pi.availability.status}`, pi.availability.status)}
											size="small"
											sx={availabilityStatusChipSx(pi.availability.status)}
										/>
									)}
									{pi.availability.openToWork != null && (
										<Chip
											label={pi.availability.openToWork
												? t('appCVContent.availability.openToWork')
												: t('appCVContent.availability.notOpenToWork')}
											size="small"
											sx={{
												fontSize: '0.72rem', height: 22, fontWeight: 600, borderRadius: 0.75,
												...(pi.availability.openToWork
													? { backgroundColor: 'rgba(98,156,68,0.10)', color: '#3a6827' }
													: { backgroundColor: '#fee2e2', color: '#991b1b' }),
											}}
										/>
									)}
									{pi.availability.remoteOnly && (
										<Chip label={t('appCVContent.availability.remoteOnly')} size="small"
											sx={{ fontSize: '0.72rem', height: 22, borderRadius: 0.75, fontWeight: 600, backgroundColor: 'rgba(139,92,246,0.08)', color: '#5b21b6' }} />
									)}
									{pi.availability.willingToRelocate != null && (
										<Chip
											label={pi.availability.willingToRelocate
												? t('appCVContent.availability.willingToRelocate')
												: t('appCVContent.availability.notWillingToRelocate')}
											size="small"
											sx={{
												fontSize: '0.72rem', height: 22, borderRadius: 0.75, fontWeight: 500,
												...(pi.availability.willingToRelocate
													? { backgroundColor: 'rgba(59,130,246,0.08)', color: '#1e40af' }
													: { backgroundColor: '#f1f5f9', color: '#64748b' }),
											}}
										/>
									)}
								</Box>
							</Grid2>

							{(pi.availability.availableFrom || pi.availability.noticePeriodDays != null) && (
								<Grid2 size={{ xs: 12, sm: 6 }}>
									<Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
										{pi.availability.availableFrom && (
											<Box>
												<Typography sx={availLabelSx}>{t('appCVContent.availability.availableFrom')}</Typography>
												<Typography sx={availValueSx}>{pi.availability.availableFrom}</Typography>
											</Box>
										)}
										{pi.availability.noticePeriodDays != null && (
											<Box>
												<Typography sx={availLabelSx}>{t('appCVContent.availability.noticePeriod')}</Typography>
												<Typography sx={availValueSx}>
													{pi.availability.noticePeriodDays} {t('appCVContent.availability.days')}
												</Typography>
											</Box>
										)}
									</Box>
								</Grid2>
							)}

							{pi.availability.preferredWorkTypes?.length > 0 && (
								<Grid2 size={{ xs: 12, sm: 6 }}>
									<Typography sx={availLabelSx}>{t('appCVContent.availability.preferredWorkTypes')}</Typography>
									<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
										{pi.availability.preferredWorkTypes.map((type, i) => (
											<Chip key={i} label={type} size="small" sx={softSkillChipSx} />
										))}
									</Box>
								</Grid2>
							)}

							{pi.availability.preferredContractTypes?.length > 0 && (
								<Grid2 size={{ xs: 12, sm: 6 }}>
									<Typography sx={availLabelSx}>{t('appCVContent.availability.preferredContractTypes')}</Typography>
									<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
										{pi.availability.preferredContractTypes.map((type, i) => (
											<Chip key={i} label={type} size="small" sx={softSkillChipSx} />
										))}
									</Box>
								</Grid2>
							)}

							{pi.availability.interviewAvailability?.length > 0 && (
								<Grid2 size={{ xs: 12 }}>
									<Typography sx={availLabelSx}>{t('appCVContent.availability.interviews')}</Typography>
									<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
										{pi.availability.interviewAvailability.map((slot, i) => (
											<Chip key={i} label={slot} size="small"
												sx={{ fontSize: '0.72rem', height: 22, backgroundColor: '#f1f5f9', color: '#475569', borderRadius: 0.75 }} />
										))}
									</Box>
								</Grid2>
							)}
						</Grid2>
					)}
					</Card>
				)}

				{/* Two-column grid */}
				<Grid2 container spacing={2} sx={{ mb: 2 }}>
					{/* Left: Work experience + Education */}
					<Grid2 size={{ xs: 12, md: 7 }}>
						{workExperience.length > 0 && (
							<Card sx={{ mb: 2 }}>
								<SectionHeader Icon={WorkOutlineOutlinedIcon} title={t('appCVContent.workExperience')} />
								<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
									{workExperience.map((work, i) => (
										<Box key={i} sx={i > 0 ? { pt: 2.5, borderTop: '1px solid #f1f5f9' } : {}}>
											<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 0.5 }}>
												<Box>
													<Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>
														{work.position}
													</Typography>
													<Typography sx={{ fontSize: '0.82rem', color: '#629C44', fontWeight: 600 }}>
														{work.company}
													</Typography>
													{work.location && (
														<Typography sx={{ fontSize: '0.78rem', color: '#94a3b8' }}>
															{work.location}
														</Typography>
													)}
												</Box>
												<Chip
													label={`${work.from} – ${work.to}`}
													size="small"
													sx={{ fontSize: '0.72rem', backgroundColor: '#f1f5f9', color: '#64748b', height: 22, borderRadius: 0.75 }}
												/>
											</Box>
											{work.activities?.length > 0 && (
												<Box sx={{ mt: 1.25, pl: 2, borderLeft: '2px solid #e2e8f0' }}>
													{work.activities.map((act, j) => (
														<Box key={j} sx={{ mb: 1.25 }}>
															{act.project && (
																<Typography sx={{ fontSize: '0.80rem', fontWeight: 600, color: '#334155', mb: 0.5 }}>
																	{act.project}
																</Typography>
															)}
															<Box component="ul" sx={{ m: 0, pl: 2, listStyleType: 'disc' }}>
																{act.tasks?.map((task, k) => (
																	<Box component="li" key={k} sx={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.7, mb: 0.25 }}>
																		{task}
																	</Box>
																))}
															</Box>
														</Box>
													))}
												</Box>
											)}
										</Box>
									))}
								</Box>
							</Card>
						)}

						{education.length > 0 && (
							<Card>
								<SectionHeader Icon={SchoolIcon} title={t('appCVContent.education')} />
								<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
									{education.map((edu, i) => (
										<Box key={i} sx={i > 0 ? { pt: 2, borderTop: '1px solid #f1f5f9' } : {}}>
											<Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 0.5, alignItems: 'flex-start' }}>
												<Box sx={{ textAlign: 'left' }}>
													<Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>
														{edu.degree}
													</Typography>
													<Typography sx={{ fontSize: '0.82rem', color: '#629C44', fontWeight: 600 }}>
														{edu.institution}
													</Typography>
													{edu.fieldOfStudy && (
														<Typography sx={{ fontSize: '0.78rem', color: '#64748b' }}>
															{edu.fieldOfStudy}
														</Typography>
													)}
												</Box>
												{edu.year && (
													<Chip
														label={edu.year}
														size="small"
														sx={{ fontSize: '0.72rem', backgroundColor: '#f1f5f9', color: '#64748b', height: 22, borderRadius: 0.75 }}
													/>
												)}
											</Box>
											{edu.achievements?.length > 0 && (
												<Box component="ul" sx={{ m: 0, mt: 0.75, pl: 2, listStyleType: 'disc' }}>
													{edu.achievements.map((a, k) => (
														<Box component="li" key={k} sx={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.7, mb: 0.25 }}>
															{a}
														</Box>
													))}
												</Box>
											)}
										</Box>
									))}
								</Box>
							</Card>
						)}
					</Grid2>

					{/* Right: Skills + Languages + Certs */}
					<Grid2 size={{ xs: 12, md: 5 }}>
						{skills.technicalSkills?.length > 0 && (
							<Card sx={{ mb: 2 }}>
								<SectionHeader Icon={ConstructionIcon} title={t('appCVContent.technicalSkills')} />
								<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
									{skills.technicalSkills.map((s, i) => (
										<Chip key={i} label={s} size="small" sx={techSkillChipSx} />
									))}
								</Box>
							</Card>
						)}

						{skills.softSkills?.length > 0 && (
							<Card sx={{ mb: 2 }}>
								<SectionHeader Icon={PeopleOutlinedIcon} title={t('appCVContent.softSkills')} />
								<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
									{skills.softSkills.map((s, i) => (
										<Chip key={i} label={s} size="small" sx={softSkillChipSx} />
									))}
								</Box>
							</Card>
						)}

						{skills.languages?.length > 0 && (
							<Card sx={{ mb: 2 }}>
								<SectionHeader Icon={TranslateIcon} title={t('appCVContent.languages')} />
								<TableContainer>
									<Table size="small">
										<TableHead>
											<TableRow>
												<TableCell sx={langThSx}>{t('appCVContent.proficiency.langProfTitle')}</TableCell>
												<TableCell sx={langThSx} align="center">{t('appCVContent.proficiency.read')}</TableCell>
												<TableCell sx={langThSx} align="center">{t('appCVContent.proficiency.written')}</TableCell>
												<TableCell sx={langThSx} align="center">{t('appCVContent.proficiency.spoken')}</TableCell>
											</TableRow>
										</TableHead>
										<TableBody>
											{skills.languages.map((lang, i) => (
												<TableRow key={i} sx={{ '&:last-child td': { borderBottom: 0 } }}>
													<TableCell sx={{ fontSize: '0.78rem', py: 0.75, fontWeight: 600 }}>{lang.language}</TableCell>
													<TableCell sx={{ fontSize: '0.78rem', py: 0.75 }} align="center">{lang.proficiency?.read || '—'}</TableCell>
													<TableCell sx={{ fontSize: '0.78rem', py: 0.75 }} align="center">{lang.proficiency?.written || '—'}</TableCell>
													<TableCell sx={{ fontSize: '0.78rem', py: 0.75 }} align="center">{lang.proficiency?.spoken || '—'}</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</TableContainer>
							</Card>
						)}

						{certifications.length > 0 && (
							<Card>
								<SectionHeader Icon={WorkspacePremiumIcon} title={t('appCVContent.certifications')} />
								<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
									{certifications.map((cert, i) => (
										<Box key={i} sx={{ textAlign: 'left', ...(i > 0 ? { pt: 1.5, borderTop: '1px solid #f1f5f9' } : {}) }}>
											<Typography sx={{ fontWeight: 700, fontSize: '0.84rem', color: '#0f172a' }}>
												{cert.title}
											</Typography>
											<Typography sx={{ fontSize: '0.78rem', color: '#629C44', fontWeight: 600 }}>
												{cert.institution}
											</Typography>
											{cert.year && (
												<Typography sx={{ fontSize: '0.75rem', color: '#94a3b8' }}>{cert.year}</Typography>
											)}
											{cert.description && (
												<Typography sx={{ fontSize: '0.78rem', color: '#64748b', mt: 0.25 }}>
													{cert.description}
												</Typography>
											)}
										</Box>
									))}
								</Box>
							</Card>
						)}
					</Grid2>
				</Grid2>

				{/* Projects */}
				{projectsAndAchievements.length > 0 && (
					<Card sx={{ mb: 2 }}>
						<SectionHeader Icon={EmojiEventsIcon} title={t('appCVContent.projectsAndAchievements')} />
						<Grid2 container spacing={1.5}>
							{projectsAndAchievements.map((project, i) => (
								<Grid2 key={i} size={{ xs: 12, sm: 6 }}>
									<Box sx={{ p: 1.5, textAlign: 'left', backgroundColor: '#f8fafc', borderRadius: 1.5, border: '1px solid #f1f5f9' }}>
										<Typography sx={{ fontWeight: 700, fontSize: '0.84rem', color: '#0f172a' }}>
											{project.title}
										</Typography>
										{project.description && (
											<Typography sx={{ fontSize: '0.78rem', color: '#64748b', mt: 0.5, lineHeight: 1.6 }}>
												{project.description}
											</Typography>
										)}
										<Box sx={{ display: 'flex', gap: 1, mt: 0.75, flexWrap: 'wrap' }}>
											{project.date && (
												<Typography sx={{ fontSize: '0.72rem', color: '#94a3b8' }}>{project.date}</Typography>
											)}
											{project.impact && (
												<Typography sx={{ fontSize: '0.72rem', color: '#629C44', fontWeight: 600 }}>
													{project.impact}
												</Typography>
											)}
										</Box>
									</Box>
								</Grid2>
							))}
						</Grid2>
					</Card>
				)}

				{/* Interests */}
				{interestsAndHobbies.length > 0 && (
					<Card sx={{ mb: 2 }}>
						<SectionHeader Icon={DownhillSkiingIcon} title={t('appCVContent.interestsAndHobbies')} />
						<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
							{interestsAndHobbies.map((h, i) => (
								<Chip key={i} label={h} size="small" sx={softSkillChipSx} />
							))}
						</Box>
					</Card>
				)}

				{/* Tags */}
				<Card sx={{ mb: 2 }}>
					<SectionHeader
						Icon={LabelIcon}
						title={t('appCVContent.tags')}
						onEdit={editingSection !== 'tags' ? () => handleEdit('tags') : undefined}
					/>
					{editingSection === 'tags' ? (
						<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
							{/* Current tags as removable chips */}
							{draft.tags?.length > 0 && (
								<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
									{draft.tags.map((tag, i) => (
										<Chip
											key={i}
											label={tag}
											size="small"
											onDelete={() => handleRemoveTag(tag)}
											sx={{ ...techSkillChipSx, '& .MuiChip-deleteIcon': { fontSize: 13, color: '#629C44' } }}
										/>
									))}
								</Box>
							)}
							{/* Add new tag */}
							<Box sx={{ display: 'flex', gap: 1 }}>
								<TextField
									size="small"
									placeholder={t('appCVContent.addTag', 'Add a tag…')}
									value={tagInput}
									onChange={e => setTagInput(e.target.value)}
									onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
									InputProps={{ sx: { fontSize: '0.82rem', borderRadius: 1.5 } }}
									sx={{ flex: 1 }}
								/>
								<Button
									size="small"
									variant="outlined"
									onClick={handleAddTag}
									disabled={!tagInput.trim()}
									sx={{ textTransform: 'none', fontSize: '0.78rem', borderRadius: 1.5, borderColor: '#629C44', color: '#629C44', '&:hover': { borderColor: '#528035', backgroundColor: 'rgba(98,156,68,0.05)' } }}
								>
									+
								</Button>
							</Box>
							{/* Save / Cancel */}
							<Box sx={{ display: 'flex', gap: 1 }}>
								<Button
									size="small"
									variant="contained"
									disabled={isSaving}
									onClick={handleSave}
									startIcon={isSaving ? <CircularProgress size={12} color="inherit" /> : null}
									sx={{ textTransform: 'none', fontSize: '0.78rem', backgroundColor: '#629C44', '&:hover': { backgroundColor: '#528035' }, borderRadius: 1.5, boxShadow: 'none', fontWeight: 600 }}
								>
									{t('appCVContent.save', 'Save')}
								</Button>
								<Button
									size="small"
									onClick={handleCancelEdit}
									sx={{ textTransform: 'none', fontSize: '0.78rem', color: '#64748b', borderRadius: 1.5 }}
								>
									{t('appCVContent.cancel')}
								</Button>
							</Box>
						</Box>
					) : (
						<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
							{tags.length === 0 ? (
								<Typography sx={{ fontSize: '0.78rem', color: '#cbd5e1', fontStyle: 'italic' }}>
									{t('appCVContent.noTags', 'No tags yet — click edit to add some.')}
								</Typography>
							) : tags.map((tag, i) => (
								<Chip key={i} label={tag} size="small" sx={techSkillChipSx} />
							))}
						</Box>
					)}
				</Card>

				{/* References — hide contact details when anonymized */}
				{references.length > 0 && (
					<Card sx={{ mb: 2 }}>
						<SectionHeader Icon={ContactsIcon} title={t('appCVContent.references')} />
						<Grid2 container spacing={1.5}>
							{references.map((ref, i) => (
								<Grid2 key={i} size={{ xs: 12, sm: 6 }}>
									<Box sx={{ p: 1.5, backgroundColor: '#f8fafc', borderRadius: 1.5, border: '1px solid #f1f5f9' }}>
										<Typography sx={{ fontWeight: 700, fontSize: '0.84rem', color: '#0f172a' }}>
											{ref.name}
										</Typography>
										{(ref.position || ref.company) && (
											<Typography sx={{ fontSize: '0.78rem', color: '#629C44', fontWeight: 600 }}>
												{[ref.position, ref.company].filter(Boolean).join(' — ')}
											</Typography>
										)}
										{!anonymized && ref.contact?.phone && (
											<Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>{ref.contact.phone}</Typography>
										)}
										{!anonymized && ref.contact?.email && (
											<Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>{ref.contact.email}</Typography>
										)}
									</Box>
								</Grid2>
							))}
						</Grid2>
					</Card>
				)}

				{lastUpdatedAt && (
					<Typography sx={{ fontSize: '0.72rem', color: '#94a3b8', textAlign: 'right', fontStyle: 'italic', pb: 1 }}>
						{t('appCVContent.lastUpdatedAt')}: {new Date(lastUpdatedAt).toLocaleString()}
					</Typography>
				)}
			</Box>

			{/* Talent Intelligence tab — always in DOM for print ref */}
			<Box ref={clusteringRef} sx={{ display: activeTab === 1 ? 'block' : 'none', flex: 1, overflowY: 'auto', p: 2.5, textAlign: 'left' }}>
				<ClusteringTabContent clustering={candidateClustering} t={t} />
			</Box>
		</Box>
	);
};

// ─── Shared styles ────────────────────────────────────────────────────────────

const contactChipSx = {
	fontSize: '0.75rem',
	backgroundColor: '#f1f5f9',
	color: '#334155',
	height: 24,
	borderRadius: 1,
	'& .MuiChip-icon': { fontSize: 13 },
};

const techSkillChipSx = {
	fontSize: '0.75rem',
	backgroundColor: 'rgba(98,156,68,0.10)',
	color: '#3a6827',
	borderRadius: 1,
	height: 24,
	fontWeight: 500,
};

const softSkillChipSx = {
	fontSize: '0.75rem',
	backgroundColor: '#f1f5f9',
	color: '#475569',
	borderRadius: 1,
	height: 24,
};

const availLabelSx = {
	fontSize: '0.70rem',
	color: '#94a3b8',
	textTransform: 'uppercase',
	letterSpacing: '0.05em',
	mb: 0.25,
};

const availValueSx = {
	fontWeight: 700,
	fontSize: '0.88rem',
	color: '#0f172a',
};

const availabilityStatusChipSx = (status) => {
	const map = {
		activelyLooking:     { backgroundColor: 'rgba(98,156,68,0.12)',  color: '#3a6827' },
		openButNotSearching: { backgroundColor: 'rgba(59,130,246,0.10)', color: '#1e40af' },
		notAvailable:        { backgroundColor: '#f1f5f9',               color: '#64748b' },
		freelanceOnly:       { backgroundColor: 'rgba(139,92,246,0.10)', color: '#5b21b6' },
	};
	return {
		fontSize: '0.72rem', height: 22, fontWeight: 700, borderRadius: 0.75,
		...(map[status] ?? { backgroundColor: '#f1f5f9', color: '#64748b' }),
	};
};

const langThSx = {
	fontWeight: 700,
	fontSize: '0.70rem',
	color: '#64748b',
	textTransform: 'uppercase',
	letterSpacing: '0.04em',
	backgroundColor: '#f8fafc',
	py: 0.75,
};

// ─── PropTypes ────────────────────────────────────────────────────────────────

AppCVDetails.propTypes = {
	cv: PropTypes.shape({
		candidateProfileSummary: PropTypes.string,
		candidateClustering: PropTypes.shape({
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
		personalInformation: PropTypes.shape({
			name: PropTypes.string,
			role: PropTypes.string,
			contact: PropTypes.shape({
				phone: PropTypes.string,
				email: PropTypes.string,
				socialLinks: PropTypes.shape({
					linkedin: PropTypes.string,
					github: PropTypes.string,
					website: PropTypes.string,
				}),
			}),
			availability: PropTypes.shape({
				openToWork: PropTypes.bool,
				status: PropTypes.oneOf(['activelyLooking', 'openButNotSearching', 'notAvailable', 'freelanceOnly']),
				availableFrom: PropTypes.string,
				noticePeriodDays: PropTypes.number,
				interviewAvailability: PropTypes.arrayOf(PropTypes.string),
				preferredWorkTypes: PropTypes.arrayOf(PropTypes.string),
				preferredContractTypes: PropTypes.arrayOf(PropTypes.string),
				willingToRelocate: PropTypes.bool,
				remoteOnly: PropTypes.bool,
			}),
		}),
		workExperience: PropTypes.arrayOf(PropTypes.shape({
			company: PropTypes.string,
			from: PropTypes.string,
			to: PropTypes.string,
			position: PropTypes.string,
			location: PropTypes.string,
			activities: PropTypes.arrayOf(PropTypes.shape({
				project: PropTypes.string,
				tasks: PropTypes.arrayOf(PropTypes.string),
			})),
		})),
		education: PropTypes.arrayOf(PropTypes.shape({
			institution: PropTypes.string,
			degree: PropTypes.string,
			fieldOfStudy: PropTypes.string,
			year: PropTypes.string,
		})),
		certifications: PropTypes.arrayOf(PropTypes.shape({
			title: PropTypes.string,
			institution: PropTypes.string,
			year: PropTypes.string,
			description: PropTypes.string,
		})),
		skillsAndQualifications: PropTypes.shape({
			technicalSkills: PropTypes.arrayOf(PropTypes.string),
			softSkills: PropTypes.arrayOf(PropTypes.string),
			languages: PropTypes.arrayOf(PropTypes.shape({
				language: PropTypes.string,
				proficiency: PropTypes.objectOf(PropTypes.string),
			})),
		}),
		projectsAndAchievements: PropTypes.arrayOf(PropTypes.shape({
			title: PropTypes.string,
			description: PropTypes.string,
			date: PropTypes.string,
			impact: PropTypes.string,
		})),
		interestsAndHobbies: PropTypes.arrayOf(PropTypes.string),
		references: PropTypes.arrayOf(PropTypes.shape({
			name: PropTypes.string,
			position: PropTypes.string,
			company: PropTypes.string,
			contact: PropTypes.shape({ phone: PropTypes.string, email: PropTypes.string }),
		})),
		tags: PropTypes.arrayOf(PropTypes.string),
		lastUpdatedAt: PropTypes.string,
	}),
	onClose: PropTypes.func,
	onUpdate: PropTypes.func,
};

export default AppCVDetails;
