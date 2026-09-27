import { describe, expect, it } from 'vitest';
import { ALL_ACTIONS, AUTHORITY_GROUPS, permsFromAuthorities, permsToAuthorities } from './users.js';

// Copy of qorva-ai UserActionsEnum (src/main/java/ai/qorva/core/enums/UserActionsEnum.java).
// Saving the permission editor replaces the user's whole authority list, so an action the backend
// grants but this list lacks is revoked on the next save. Update both sides together.
const BACKEND_ACTIONS = [
	'VIEW_DASHBOARD',
	'ADD_CV', 'VIEW_CV', 'MODIFY_CV', 'DELETE_CV',
	'ADD_JOB', 'VIEW_JOB', 'MODIFY_JOB', 'DELETE_JOB',
	'GENERATE_REPORT', 'VIEW_REPORT', 'MODIFY_REPORT', 'DELETE_REPORT',
	'START_CHAT', 'VIEW_CHAT', 'VIEW_MESSAGE', 'REPLY_MESSAGE', 'MODIFY_CHAT', 'DELETE_CHAT',
	'VIEW_USERS', 'MANAGE_USERS',
	'ATS_REPORT_EXPORT',
	'MANAGE_INTEGRATIONS',
	'UPDATE_SUBSCRIPTION', 'CANCEL_SUBSCRIPTION',
	'VIEW_LIBRARY_INSIGHTS',
	'CONTACT_CANDIDATE',
];

const allowed = (action, role = 'ACCOUNT_MANAGER') => ({ role, action, permission: 'ALLOWED' });

describe('permission model', () => {
	it('knows every backend action', () => {
		expect([...ALL_ACTIONS].sort()).toEqual([...BACKEND_ACTIONS].sort());
	});

	it('shows every known action in exactly one group', () => {
		const grouped = AUTHORITY_GROUPS.flatMap(g => g.actions);
		expect([...grouped].sort()).toEqual([...ALL_ACTIONS].sort());
	});

	it('keeps Talent Intelligence through an edit round-trip', () => {
		const current = [allowed('VIEW_CV'), allowed('VIEW_LIBRARY_INSIGHTS')];
		const perms = { ...permsFromAuthorities(current), VIEW_DASHBOARD: true };

		const saved = permsToAuthorities(perms, 'ACCOUNT_MANAGER', current).map(a => a.action);

		expect(saved).toEqual(expect.arrayContaining(['VIEW_CV', 'VIEW_LIBRARY_INSIGHTS', 'VIEW_DASHBOARD']));
	});

	it('carries over actions it does not know instead of revoking them', () => {
		const current = [allowed('VIEW_CV'), allowed('SOME_FUTURE_ACTION', 'ACCOUNT_OWNER')];

		const saved = permsToAuthorities(permsFromAuthorities(current), 'ACCOUNT_MANAGER', current);

		expect(saved).toContainEqual(allowed('SOME_FUTURE_ACTION', 'ACCOUNT_OWNER'));
	});

	it('still revokes a known action the editor unticked', () => {
		const current = [allowed('VIEW_CV'), allowed('DELETE_CV')];
		const perms = { ...permsFromAuthorities(current), DELETE_CV: false };

		const saved = permsToAuthorities(perms, 'ACCOUNT_MANAGER', current).map(a => a.action);

		expect(saved).toEqual(['VIEW_CV']);
	});
});
