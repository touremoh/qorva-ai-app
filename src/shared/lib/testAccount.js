import { TENANT_ACCESS_EXPIRES_AT, TENANT_ACCOUNT_TYPE } from '../../constants.js';

/** A test account created from the admin console: no Stripe subscription, access until a set date. */
export const isTestAccount = () => localStorage.getItem(TENANT_ACCOUNT_TYPE) === 'TESTER';

/** When a test account's access ends (ISO instant), or null. */
export const testAccessEndsAt = () => localStorage.getItem(TENANT_ACCESS_EXPIRES_AT) || null;
