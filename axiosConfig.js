import axios from 'axios';
import {AUTH_TOKEN, QORVA_USER_LANGUAGE} from "./src/constants.js";
import { toastError } from './src/utils/errorHandler.js';
import { isDemoUser, openUpgradeDialog } from './src/utils/demoMode.js';

// Never bake the token into client defaults: a default header snapshots whatever was
// in localStorage at page load and shadows the fresh token after login/refresh — the
// request interceptor below reads localStorage on every request instead.
const apiClient = axios.create({
	baseURL: import.meta.env.VITE_APP_API_BASE_URL, // Base URL for your backend
	headers: {
		'Content-Type': 'application/json',
	},
});

export const apiFormDataClient = axios.create({
	baseURL: import.meta.env.VITE_APP_API_BASE_URL, // Base URL for your backend
	headers: {
		'Content-Type': 'multipart/form-data',
	},
});

// Intercept requests to attach Authorization token
apiClient.interceptors.request.use(config => {
	return getConfig(config);
}, error => Promise.reject(error));

// Intercept requests to attach Authorization token
apiFormDataClient.interceptors.request.use(config => {
	return getConfig(config);
}, error => Promise.reject(error));

// Error codes that individual components handle with inline alerts — skip global toast
const SILENT_ERROR_CODES = new Set([
	'error.auth.authentication_failed',
	'error.user.already_exists',
	'error.user.password_incorrect',
]);

const handleResponseError = (error) => {
	const status = error?.response?.status;

	// Session died (expired/invalid token): back to login instead of a toast storm.
	if (status === 401 && !publicEndpoint(error?.config?.url ?? '')) {
		localStorage.removeItem(AUTH_TOKEN);
		window.location.assign('/login');
		return Promise.reject(error);
	}

	// A demo user hit a backend-enforced write restriction (or an exhausted
	// quota). Turn the raw 403 into an "Upgrade to unlock" prompt instead of a
	// bare error toast.
	if (status === 403 && isDemoUser()) {
		openUpgradeDialog('forbidden');
		return Promise.reject(error);
	}

	const errorCode = error?.response?.data?.errorCode;
	if (!SILENT_ERROR_CODES.has(errorCode)) {
		toastError(error);
	}
	return Promise.reject(error);
};

apiClient.interceptors.response.use(response => response, handleResponseError);
apiFormDataClient.interceptors.response.use(response => response, handleResponseError);

// Endpoints whose 401 is not a dead session: the caller deals with it, so the response
// interceptor must not clear storage and bounce to /login.
const publicEndpoint = (url) => url.includes('/registrations')
	|| url.includes('/auth/login')
	|| url.includes('/auth/token/validate')
	|| url.includes('/auth/password/set')
	|| url.includes('/auth/password/resend')
	|| url.includes('/stripe/checkout/success')
	|| url.includes('/stripe/checkout/cancel');

// Endpoints that take no bearer token at all. /auth/token/validate is deliberately NOT
// here even though it is public: the token under test is its only input, and stripping
// the header makes the backend answer 400 (missing Authorization) on every check.
const sendsNoCredentials = (url) => url.includes('/registrations')
	|| url.includes('/auth/login')
	|| url.includes('/auth/password/set')
	|| url.includes('/auth/password/resend')
	|| url.includes('/stripe/checkout/success')
	|| url.includes('/stripe/checkout/cancel');

const getConfig = (config) => {
	if (sendsNoCredentials(config.url)) {
		// A stale token on a credential-free call (e.g. login with an expired session) helps nobody.
		delete config.headers['Authorization'];
	} else {
		const token = localStorage.getItem(AUTH_TOKEN);
		if (token) {
			config.headers['Authorization'] = `Bearer ${token}`;
		}
	}
	const language = localStorage.getItem(QORVA_USER_LANGUAGE) || 'en';
	config.headers['Accept-Language'] = language;
	return config;
}

export default apiClient;
