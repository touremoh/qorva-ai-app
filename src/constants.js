export const COMP_ID_REPORTS = 'REPORTS';
export const COMP_ID_CHAT = 'CHAT';
export const COMP_ID_USAGE_MONITORING = 'USAGE_MONITORING';
export const COMP_ID_JOBS = 'JOBS';
export const COMP_ID_INTELLIGENCE = 'INTELLIGENCE';
export const COMP_ID_CVLIB = 'CVLIB';
export const COMP_ID_SETTINGS = 'SETTINGS';
export const COMP_ID_DASHBOARD = 'DASHBOARD';
export const AUTH_TOKEN = 'authToken';
export const USER_ID = 'USER_ID';
export const USER_EMAIL = 'USER_EMAIL';
export const USER_FIRST_NAME = 'USER_FIRST_NAME';
export const USER_LAST_NAME = 'USER_LAST_NAME';
export const TENANT_ID = 'TENANT_ID';
export const SUBSCRIPTION_STATUS = 'SUBSCRIPTION_STATUS';
export const TOKEN_EXPIRY = 'tokenExpiry';
export const QORVA_USER_LANGUAGE = 'QORVA_USER_LANGUAGE';
// Subscription status values returned by the API
export const STATUS_ACTIVE = 'active';
export const STATUS_TRIALING = 'trialing';
export const STATUS_PENDING_SUBSCRIPTION = 'pending_subscription';
export const STATUS_PAST_DUE = 'past_due';
export const STATUS_INCOMPLETE = 'incomplete';
export const STATUS_PAUSED = 'paused';
export const STATUS_CANCELED = 'canceled';

// Statuses that allow full dashboard access
export const DASHBOARD_STATUSES = [STATUS_ACTIVE, STATUS_TRIALING];

// Statuses that require payment to continue
export const NEEDS_PAYMENT_STATUSES = [
	STATUS_PENDING_SUBSCRIPTION,
	STATUS_PAST_DUE,
	STATUS_INCOMPLETE,
	STATUS_PAUSED,
];

export const STATUS_MAP = {
	active: {
		key: 'accountSettings.status.active',
		fallback: 'Active',
		color: 'success',
	},
	trialing: {
		key: 'accountSettings.status.freeTrialActive',
		fallback: 'Trial — active',
		color: 'info',
	},
	pending_subscription: {
		key: 'accountSettings.status.pendingSubscription',
		fallback: 'Pending payment',
		color: 'warning',
	},
	past_due: {
		key: 'accountSettings.status.pastDue',
		fallback: 'Past due',
		color: 'error',
	},
	incomplete: {
		key: 'accountSettings.status.incomplete',
		fallback: 'Incomplete setup',
		color: 'warning',
	},
	paused: {
		key: 'accountSettings.status.paused',
		fallback: 'Paused',
		color: 'default',
	},
	canceled: {
		key: 'accountSettings.status.cancelled',
		fallback: 'Cancelled',
		color: 'default',
	},
};
