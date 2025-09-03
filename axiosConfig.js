import axios from 'axios';
import {AUTH_TOKEN} from "./src/constants.js";

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

const publicEndpoint = (url) => url.includes('/registrations')
	|| url.includes('/auth/login')
	|| url.includes('/auth/token/validate');

const getConfig = (config) => {
	const token = localStorage.getItem(AUTH_TOKEN);
	const auth = config.headers['Authorization'];
	if (!auth) {
		if (!publicEndpoint(config.url)) {
			config.headers['Authorization'] = `Bearer ${token}`;
		}
	}
	return config;
}

export default apiClient;
