import { scoreColorsFor } from '../../../shared/lib/score.js';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';

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
	{ key: 'skillDepthReport',       label: t('dashboard.talent.skillDepth', 'Skill Depth'),         icon: LayersOutlinedIcon,     accent: '#8b5cf6', bg: 'rgba(139,92,246,0.08)'  },
	{ key: 'seniorityLevelReport',   label: t('dashboard.talent.seniorityLevel', 'Seniority Level'),  icon: TrendingUpOutlinedIcon, accent: '#3b82f6', bg: 'rgba(59,130,246,0.08)'  },
	{ key: 'leadershipReport',       label: t('dashboard.talent.leadership', 'Leadership'),            icon: GroupsOutlinedIcon,     accent: '#629C44', bg: 'rgba(98,156,68,0.08)'   },
	{ key: 'learningVelocityReport', label: t('dashboard.talent.learningVelocity', 'Learning Velocity'), icon: BoltOutlinedIcon,    accent: '#f59e0b', bg: 'rgba(245,158,11,0.08)'  },
];
export const KPI_CONFIG = (t) => [
	{ key: 'totalCVs',            label: t('dashboard.kpi.totalCVs'),            icon: PeopleOutlinedIcon,        accent: '#629C44', bg: 'rgba(98,156,68,0.08)'  },
	{ key: 'totalJobsPosted',     label: t('dashboard.kpi.totalJobsPosted'),     icon: WorkOutlineOutlinedIcon,   accent: '#3b82f6', bg: 'rgba(59,130,246,0.08)' },
	{ key: 'totalUsers',          label: t('dashboard.kpi.totalUsers'),          icon: PersonOutlineOutlinedIcon, accent: '#8b5cf6', bg: 'rgba(139,92,246,0.08)' },
	{ key: 'totalResumeAnalysis', label: t('dashboard.kpi.totalResumeAnalysis'), icon: AssessmentOutlinedIcon,    accent: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
];
export const scoreColor = (score) => {
	const tone = scoreColorsFor(score);
	return { color: tone.text, bg: tone.tint };
};
export const medalColor = (rank) => {
	if (rank === 0) return '#f59e0b';
	if (rank === 1) return '#94a3b8';
	if (rank === 2) return '#cd7c2f';
	return '#e2e8f0';
};
export const JOB_POSTS_PAGE_SIZE = 5;
