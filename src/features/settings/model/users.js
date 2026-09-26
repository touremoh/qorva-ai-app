export const ALL_ACTIONS = [
	'VIEW_DASHBOARD',
	'ADD_CV', 'VIEW_CV', 'MODIFY_CV', 'DELETE_CV',
	'ADD_JOB', 'VIEW_JOB', 'MODIFY_JOB', 'DELETE_JOB',
	'GENERATE_REPORT', 'VIEW_REPORT', 'MODIFY_REPORT', 'DELETE_REPORT',
	'START_CHAT', 'VIEW_CHAT', 'VIEW_MESSAGE', 'REPLY_MESSAGE', 'MODIFY_CHAT', 'DELETE_CHAT',
	'VIEW_USERS', 'MANAGE_USERS',
	'ATS_REPORT_EXPORT',
	'MANAGE_INTEGRATIONS',
	'CONTACT_CANDIDATE',
	'UPDATE_SUBSCRIPTION', 'CANCEL_SUBSCRIPTION',
];

export const AUTHORITY_GROUPS = [
	{ key: 'dashboard', actions: ['VIEW_DASHBOARD'] },
	{ key: 'resumes', actions: ['ADD_CV', 'VIEW_CV', 'MODIFY_CV', 'DELETE_CV'] },
	{ key: 'jobPosts', actions: ['ADD_JOB', 'VIEW_JOB', 'MODIFY_JOB', 'DELETE_JOB'] },
	{ key: 'reports', actions: ['GENERATE_REPORT', 'VIEW_REPORT', 'MODIFY_REPORT', 'DELETE_REPORT'] },
	{ key: 'aiChat', actions: ['START_CHAT', 'VIEW_CHAT', 'VIEW_MESSAGE', 'REPLY_MESSAGE', 'MODIFY_CHAT', 'DELETE_CHAT'] },
	{ key: 'users', actions: ['VIEW_USERS', 'MANAGE_USERS'] },
	{ key: 'atsExport', actions: ['ATS_REPORT_EXPORT'] },
	// Saving this editor rewrites the whole authority list, so an action missing from here
	// is silently revoked on the next edit — every granted action must appear.
	{ key: 'integrations', actions: ['MANAGE_INTEGRATIONS'] },
	{ key: 'outreach', actions: ['CONTACT_CANDIDATE'] },
	{ key: 'billing', actions: ['UPDATE_SUBSCRIPTION', 'CANCEL_SUBSCRIPTION'] },
];

export const emptyPerms = () => Object.fromEntries(ALL_ACTIONS.map(a => [a, false]));

export const fullPerms = () => Object.fromEntries(ALL_ACTIONS.map(a => [a, true]));

export const permsFromAuthorities = (authorities = []) => {
	const p = emptyPerms();
	(authorities || []).forEach(auth => {
		if (auth.permission === 'ALLOWED' && Object.prototype.hasOwnProperty.call(p, auth.action)) {
			p[auth.action] = true;
		}
	});
	return p;
};

export const getRoleFromAuthorities = (authorities = []) =>
	(authorities || []).find(a => a.role)?.role ?? null;

export const ROLE_LABELS = {
	ACCOUNT_OWNER: 'Owner',
	ACCOUNT_MANAGER: 'Manager',
};

export const permsToAuthorities = (perms, role) =>
	Object.entries(perms)
		.filter(([, v]) => v)
		.map(([action]) => ({ role: role ?? null, action, permission: 'ALLOWED' }));

export const SWITCH_SX = {
	'& .MuiSwitch-switchBase.Mui-checked': { color: '#629C44' },
	'& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#629C44' },
};

export const DIALOG_PAPER_SX = { elevation: 0, sx: { borderRadius: 3, border: '1px solid #e2e8f0' } };
