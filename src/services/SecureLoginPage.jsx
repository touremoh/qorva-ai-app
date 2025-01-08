import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from "../../axiosConfig.js";

const SecureLoginPage = ({ children }) => {
	const navigate = useNavigate();
	const token = localStorage.getItem('authToken');

	// Check token validity via API call
	const isTokenValid = async () => {
		try {
			if (!token) return false;

			const response = await apiClient.post(import.meta.env.VITE_APP_API_LOGIN_VALIDATE_URL, null, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			return response.data?.data === true;
		} catch (error) {
			console.error('Error validating token:', error);
			return false;
		}
	};

	useEffect(() => {
		const verifyToken = async () => {
			const valid = await isTokenValid();
			if (valid) {
				console.log('Token valid - Redirecting to home page');
				navigate('/');
			} else {
				console.log('Token is invalid or expired. Redirecting to login.');
				localStorage.removeItem('authToken');
				navigate('/login');
			}
		};
		verifyToken();
	}, [navigate]);

	return children;
};

export default SecureLoginPage;
