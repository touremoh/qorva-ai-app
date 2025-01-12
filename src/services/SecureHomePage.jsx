import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from "../../axiosConfig.js";
import {t} from "i18next";

const SecureHomePage = ({ children }) => {
	const navigate = useNavigate();
	const token = localStorage.getItem('authToken');

	// Check token validity via API call
	const isTokenValid = async () => {
		try {
			if (!token) {
				console.log('Home - Token is null', token);
				return false;
			}
			console.log('Home - Token exists - Validating token:', token);

			console.log('Token exists - Validating token:', token);
			const response = await apiClient.post(import.meta.env.VITE_APP_API_VALIDATE_TOKEN_URL, null, {
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
			if (await isTokenValid()) {
				console.log('Token is valid. Refreshing Token and connecting to home page');
				const response = await apiClient.post(
					import.meta.env.VITE_APP_API_REFRESH_TOKEN_URL,
					{
						headers: {
							Authorization: `Bearer ${localStorage.getItem('authToken')}`,
						},
					}
				);

				if (response.status === 200 && response.data?.data?.access_token) {
					const access_token = response.data.data.access_token;

					// Save the access token and expiration time in localStorage
					localStorage.setItem('authToken', access_token);

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
				// Redirect to Login page if token is invalid or expired
				console.log('Token is invalid or expired. Redirecting to login.');
				navigate('/login');
			}
		};
		verifyToken().then(r => console.log("Token verification done! ", r));
	}, [navigate]);

	return children;
};

export default SecureHomePage;
