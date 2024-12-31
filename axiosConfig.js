import axios from 'axios';

const authToken = localStorage.getItem('authToken');

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

export default apiClient;
