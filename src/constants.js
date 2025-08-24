export const COMP_ID_REPORTS = 'REPORTS';
export const COMP_ID_CHAT = 'CHAT';
export const COMP_ID_JOBS = 'JOBS';
export const COMP_ID_CVLIB = 'CVLIB';
export const COMP_ID_SETTINGS = 'SETTINGS';
export const COMP_ID_DASHBOARD = 'DASHBOARD';
export const AUTH_TOKEN = 'authToken';
export const USER_EMAIL = 'USER_EMAIL';
export const USER_FIRST_NAME = 'USER_FIRST_NAME';
export const USER_LAST_NAME = 'USER_LAST_NAME';
export const TENANT_ID = 'TENANT_ID';
export const SUBSCRIPTION_STATUS = 'SUBSCRIPTION_STATUS';
export const TOKEN_EXPIRY = 'tokenExpiry';
export const QORVA_USER_LANGUAGE = 'QORVA_USER_LANGUAGE';
export const FREE_TRIAL_PERIOD_ACTIVE = 'FREE_TRIAL_PERIOD_ACTIVE';
export const SUBSCRIPTION_ACTIVE = 'SUBSCRIPTION_ACTIVE';
export const CANCELLATION_GRACE_PERIOD_STARTED = 'CANCELLATION_GRACE_PERIOD_STARTED';
export const SUBSCRIPTION_INCOMPLETE = 'SUBSCRIPTION_INCOMPLETE';
export const SUBSCRIPTION_CANCELLED = 'SUBSCRIPTION_CANCELLED';
export const SUBSCRIPTION_FAILED = 'SUBSCRIPTION_FAILED';

export const STATUS_MAP = {
	FREE_TRIAL_PERIOD_ACTIVE: {
		key: "accountSettings.status.freeTrialActive",
		fallback: "Free trial — active",
		color: "info"
	},
	SUBSCRIPTION_ACTIVE: {
		key: "accountSettings.status.active",
		fallback: "Active subscription",
		color: "success"
	},
	SUBSCRIPTION_PAYMENT_FAILED: {
		key: "accountSettings.status.paymentFailed",
		fallback: "Payment failed",
		color: "warning"
	},
	SUBSCRIPTION_EXPIRED: {
		key: "accountSettings.status.expired",
		fallback: "Expired",
		color: "default"
	},
	SUBSCRIPTION_LOCKED: {
		key: "accountSettings.status.locked",
		fallback: "Locked",
		color: "default"
	},
	SUBSCRIPTION_INCOMPLETE: {
		key: "accountSettings.status.incomplete",
		fallback: "Incomplete setup",
		color: "warning"
	},
	SUBSCRIPTION_FAILED: {
		key: "accountSettings.status.failed",
		fallback: "Subscription failed",
		color: "error"
	},
	SUBSCRIPTION_CANCELLED: {
		key: "accountSettings.status.cancelled",
		fallback: "Cancelled",
		color: "default"
	},
	CANCELLATION_GRACE_PERIOD_STARTED: {
		key: "accountSettings.status.cancellationGraceStarted",
		fallback: "Cancellation scheduled — grace period",
		color: "warning"
	},
	CANCELLATION_GRACE_PERIOD_FINISHED: {
		key: "accountSettings.status.cancellationGraceFinished",
		fallback: "Cancelled — grace period ended",
		color: "default"
	}
};
