import {
	AUTH_TOKEN,
	SUBSCRIPTION_STATUS,
	TENANT_ID,
	TOKEN_EXPIRY,
	USER_EMAIL,
	USER_FIRST_NAME,
	USER_LAST_NAME
} from "./src/constants.js";

const setAuthResults = (authResults) => {
	const { jwt, user } = authResults;
	const {access_token, expires_in } = jwt;
	const {email, firstName, lastName, tenantId, subscriptionStatus } = user;

	localStorage.clear();
	localStorage.setItem(AUTH_TOKEN, access_token);
	localStorage.setItem(TOKEN_EXPIRY, expires_in);
	localStorage.setItem(USER_EMAIL, email);
	localStorage.setItem(USER_FIRST_NAME, firstName);
	localStorage.setItem(USER_LAST_NAME, lastName);
	localStorage.setItem(TENANT_ID, tenantId);
	localStorage.setItem(SUBSCRIPTION_STATUS, subscriptionStatus);
};

export { setAuthResults };
