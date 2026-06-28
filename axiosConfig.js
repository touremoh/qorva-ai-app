import axios from 'axios';
import {AUTH_TOKEN, QORVA_USER_LANGUAGE} from "./src/constants.js";
import { toastError } from './src/utils/errorHandler.js';

const authToken = localStorage.getItem(AUTH_TOKEN);

const apiClient = axios.create({
	baseURL: import.meta.env.VITE_APP_API_BASE_URL, // Base URL for your backend
	headers: {
		'Content-Type': 'application/json',
		Authorization: authToken ? `Bearer ${authToken}` : '',
	},
});

export const apiFormDataClient = axios.create({
	baseURL: import.meta.env.VITE_APP_API_BASE_URL, // Base URL for your backend
	headers: {
		'Content-Type': 'multipart/form-data',
		Authorization: authToken ? `Bearer ${authToken}` : '',
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
	const errorCode = error?.response?.data?.errorCode;
	if (!SILENT_ERROR_CODES.has(errorCode)) {
		toastError(error);
	}
	return Promise.reject(error);
};

apiClient.interceptors.response.use(response => response, handleResponseError);
apiFormDataClient.interceptors.response.use(response => response, handleResponseError);

const publicEndpoint = (url) => url.includes('/registrations')
	|| url.includes('/auth/login')
	|| url.includes('/auth/token/validate')
	|| url.includes('/stripe/checkout/success')
	|| url.includes('/stripe/checkout/cancel');

const getConfig = (config) => {
	const token = localStorage.getItem(AUTH_TOKEN);
	const auth = config.headers['Authorization'];
	if (!auth) {
		if (!publicEndpoint(config.url)) {
			config.headers['Authorization'] = `Bearer ${token}`;
		}
	}
	const language = localStorage.getItem(QORVA_USER_LANGUAGE) || 'en';
	config.headers['Accept-Language'] = language;
	return config;
}

export default apiClient;
