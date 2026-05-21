import {
	AUTH_TOKEN,
	SUBSCRIPTION_STATUS,
	TENANT_ID,
	TOKEN_EXPIRY,
	USER_EMAIL,
	USER_FIRST_NAME,
	USER_ID,
	USER_LAST_NAME
} from "./src/constants.js";

const SELECTED_PRICE_ID = 'SELECTED_PRICE_ID';

const setAuthResults = (authResults) => {
	const { jwt, user } = authResults;
	const { access_token, expires_in } = jwt;
	const { id, email, firstName, lastName, tenantId } = user;

	const subscriptionInfo = user.tenant?.subscriptionInfo;
	const subscriptionStatus = subscriptionInfo?.subscriptionStatus ?? user.subscriptionStatus;
	const priceId = subscriptionInfo?.priceId;

	localStorage.clear();
	localStorage.setItem(AUTH_TOKEN, access_token);
	localStorage.setItem(TOKEN_EXPIRY, expires_in);
	localStorage.setItem(USER_ID, id);
	localStorage.setItem(USER_EMAIL, email);
	localStorage.setItem(USER_FIRST_NAME, firstName);
	localStorage.setItem(USER_LAST_NAME, lastName);
	localStorage.setItem(TENANT_ID, tenantId);
	localStorage.setItem(SUBSCRIPTION_STATUS, subscriptionStatus ?? '');
	if (priceId) {
		localStorage.setItem(SELECTED_PRICE_ID, priceId);
	}
};

export { setAuthResults };
