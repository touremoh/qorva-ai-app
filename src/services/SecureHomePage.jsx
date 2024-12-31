import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from "../../axiosConfig.js";
import {t} from "i18next";

const SecureHomePage = ({ children }) => {
	const navigate = useNavigate();
	const token = localStorage.getItem('authToken');
	const tokenExpiry = localStorage.getItem('tokenExpiry');

	// Check token validity
	const isTokenValid = () => {
		const now = Date.now();
		return token && tokenExpiry && now < tokenExpiry;
	};

	useEffect(() => {
		const verifyToken = async () => {
			if (isTokenValid()) {
				const now = Date.now();
				const ONE_HOUR = 3600000;
				if (tokenExpiry - now <= ONE_HOUR) {
					console.log('Token expires in less than one hour - Refreshing the token');
					const response = await apiClient.post(
						import.meta.env.VITE_APP_API_REFRESH_TOKEN_URL,
						{
							headers: {
								Authorization: `Bearer ${localStorage.getItem('authToken')}`,
							},
						}
					);

					console.log('Token refresh response', response);

					if (response.status === 200 && response.data?.data?.access_token) {
						const { access_token, expires_in } = response.data.data;

						// Save the access token and expiration time in localStorage
						localStorage.setItem('authToken', access_token);
						localStorage.setItem('tokenExpiry', expires_in);

						console.log('Token refresh successful. Access token saved.');

						// Redirect to the home page
						navigate('/');
					} else {
						console.error('Unexpected response format', response);
						// Redirect to the error page
						navigate('/error', {
							state: {
								errorCode: response.status,
								errorMessage: t('errors.generic.message')
							}
						});
					}
				} else {
					navigate('/');
				}
			} else {
				// Redirect to login if token is invalid or expired
				console.log('Token is invalid or expired. Redirecting to login.');
				localStorage.removeItem('authToken');
				localStorage.removeItem('tokenExpiry');
				navigate('/login');
			}
		};
		verifyToken();
	}, [navigate]);

	return children;
};

export default SecureHomePage;
