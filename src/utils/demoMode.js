import {
	USER_ACCOUNT_STATUS,
	USER_AUTHORITIES,
	ACCOUNT_STATUS_DEMO,
} from '../constants.js';

// ---------------------------------------------------------------------------
// Demo-mode detection & permission helpers
// ---------------------------------------------------------------------------
// A demo account is identified by user.userAccountStatus === "DEMO". Demo users
// have restricted permissions: they can browse sample data and generate matching
// reports (bounded), but every write action is hidden/disabled with an
// "Upgrade to unlock" CTA. The backend enforces this and returns HTTP 403 on a
// forbidden write; the axios layer turns that 403 into an upgrade prompt.

export const isDemoUser = () =>
	localStorage.getItem(USER_ACCOUNT_STATUS) === ACCOUNT_STATUS_DEMO;

export const getAuthorities = () => {
	try {
		const raw = localStorage.getItem(USER_AUTHORITIES);
		return raw ? JSON.parse(raw) : [];
	} catch {
		return [];
	}
};

// Fine-grained gate: an action is allowed when the user is not a demo user, or
// when their authorities explicitly mark the action as ALLOWED. Callers that
// just want to hide writes for demo users can use !isDemoUser() directly.
export const isActionAllowed = (action) => {
	if (!isDemoUser()) return true;
	const authorities = getAuthorities();
	const match = authorities.find((a) => a?.action === action);
	return match ? match.permission === 'ALLOWED' : false;
};

// ---------------------------------------------------------------------------
// Upgrade-dialog event bus
// ---------------------------------------------------------------------------
// The upgrade flow (Screen 7) can be triggered from several disconnected places:
// the persistent demo banner, a gated write-action CTA, or the global 403
// handler that lives outside React (in axiosConfig). A window CustomEvent keeps
// them decoupled from the single <UpgradeDialogHost/> that renders the dialog.

export const OPEN_UPGRADE_EVENT = 'qorva:open-upgrade';

export const openUpgradeDialog = (reason = 'banner') => {
	window.dispatchEvent(new CustomEvent(OPEN_UPGRADE_EVENT, { detail: { reason } }));
};
