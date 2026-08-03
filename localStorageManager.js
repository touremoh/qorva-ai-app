import {
	AUTH_TOKEN,
	QORVA_USER_LANGUAGE,
	SUBSCRIPTION_STATUS,
	TENANT_ID,
	TOKEN_EXPIRY,
	USER_ACCOUNT_STATUS,
	USER_AUTHORITIES,
	USER_EMAIL,
	USER_FIRST_NAME,
	USER_ID,
	USER_LAST_NAME
} from "./src/constants.js";

const SELECTED_PRICE_ID = 'SELECTED_PRICE_ID';

const setAuthResults = (authResults) => {
	const { jwt, user } = authResults;
	const { access_token, expires_in } = jwt;
	const { id, email, firstName, lastName, tenantId, userAccountStatus, authorities } = user;

	const subscriptionInfo = user.tenant?.subscriptionInfo;
	const subscriptionStatus = subscriptionInfo?.subscriptionStatus ?? user.subscriptionStatus;
	const priceId = subscriptionInfo?.priceId;

	// Preserve the chosen UI language across the clear() below.
	const language = localStorage.getItem(QORVA_USER_LANGUAGE);

	localStorage.clear();
	if (language) {
		localStorage.setItem(QORVA_USER_LANGUAGE, language);
	}
	localStorage.setItem(AUTH_TOKEN, access_token);
	localStorage.setItem(TOKEN_EXPIRY, expires_in);
	localStorage.setItem(USER_ID, id);
	localStorage.setItem(USER_EMAIL, email);
	localStorage.setItem(USER_FIRST_NAME, firstName);
	localStorage.setItem(USER_LAST_NAME, lastName);
	localStorage.setItem(TENANT_ID, tenantId);
	localStorage.setItem(SUBSCRIPTION_STATUS, subscriptionStatus ?? '');
	localStorage.setItem(USER_ACCOUNT_STATUS, userAccountStatus ?? '');
	localStorage.setItem(USER_AUTHORITIES, JSON.stringify(authorities ?? []));
	if (priceId) {
		localStorage.setItem(SELECTED_PRICE_ID, priceId);
	}
};

export { setAuthResults };
