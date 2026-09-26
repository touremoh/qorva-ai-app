import { scoreColorsFor } from '../../../shared/lib/score.js';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import * as tokens from '../../../theme/tokens.js';
import { alpha } from '@mui/material/styles';

export const initialDashboardData = {
	subscriptionStatus: '',
	totalCVs: 0,
	totalJobsPosted: 0,
	totalUsers: 0,
	totalResumeAnalysis: 0,
	skillsReport: [],
	jobPostsReport: [],
	skillDepthReport: [],
	seniorityLevelReport: [],
	leadershipReport: [],
	learningVelocityReport: [],
};

export const TALENT_INSIGHT_LABEL_MAP = {
	specialist: 'Specialist',
	tShaped: 'T-Shaped',
	generalist: 'Generalist',
	hybrid: 'Hybrid',
	senior: 'Senior',
	midLevel: 'Mid-Level',
	junior: 'Junior',
	lead: 'Lead',
	principal: 'Principal',
	manager: 'Manager',
	director: 'Director',
	executive: 'Executive',
	individualContributor: 'Individual Contributor',
	teamLead: 'Team Lead',
	none: 'None',
	crossFunctionalLeader: 'Cross-Functional',
	strategicLeader: 'Strategic Leader',
	executiveInfluence: 'Executive Influence',
	high: 'High',
	medium: 'Medium',
	veryHigh: 'Very High',
	low: 'Low',
	unknown: 'Unknown',
};

export const TALENT_POOL_INSIGHT_CONFIG = (t) => [
	{ key: 'skillDepthReport',       label: t('dashboard.talent.skillDepth', 'Skill Depth'),         icon: LayersOutlinedIcon,     accent: tokens.status.accent.purple, bg: 'rgba(139,92,246,0.08)'  },
	{ key: 'seniorityLevelReport',   label: t('dashboard.talent.seniorityLevel', 'Seniority Level'),  icon: TrendingUpOutlinedIcon, accent: tokens.status.info.blue, bg: 'rgba(59,130,246,0.08)'  },
	{ key: 'leadershipReport',       label: t('dashboard.talent.leadership', 'Leadership'),            icon: GroupsOutlinedIcon,     accent: tokens.brand.text, bg: alpha(tokens.brand.main, 0.08)   },
	{ key: 'learningVelocityReport', label: t('dashboard.talent.learningVelocity', 'Learning Velocity'), icon: BoltOutlinedIcon,    accent: tokens.status.warning.bright, bg: 'rgba(245,158,11,0.08)'  },
];

export const KPI_CONFIG = (t) => [
	{ key: 'totalCVs',            label: t('dashboard.kpi.totalCVs'),            icon: PeopleOutlinedIcon,        accent: tokens.brand.text, bg: alpha(tokens.brand.main, 0.08)  },
	{ key: 'totalJobsPosted',     label: t('dashboard.kpi.totalJobsPosted'),     icon: WorkOutlineOutlinedIcon,   accent: tokens.status.info.blue, bg: 'rgba(59,130,246,0.08)' },
	{ key: 'totalUsers',          label: t('dashboard.kpi.totalUsers'),          icon: PersonOutlineOutlinedIcon, accent: tokens.status.accent.purple, bg: 'rgba(139,92,246,0.08)' },
	{ key: 'totalResumeAnalysis', label: t('dashboard.kpi.totalResumeAnalysis'), icon: AssessmentOutlinedIcon,    accent: tokens.status.warning.bright, bg: 'rgba(245,158,11,0.08)' },
];

export const scoreColor = (score) => {
	const tone = scoreColorsFor(score);
	return { color: tone.text, bg: tone.tint };
};

export const medalColor = (rank) => {
	if (rank === 0) return `${tokens.status.warning.bright}`;
	if (rank === 1) return `${tokens.ink.subtle}`;
	if (rank === 2) return `${tokens.status.warning.bronze}`;
	return `${tokens.line.main}`;
};

export const JOB_POSTS_PAGE_SIZE = 5;
