import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from "../../axiosConfig.js";
import {t} from "i18next";
import {AUTH_TOKEN} from "../constants.js";

const SecureHomePage = ({ children }) => {
	const navigate = useNavigate();
	const token = localStorage.getItem(AUTH_TOKEN);

	// Check token validity via API call
	const isTokenValid = async () => {
		try {
			if (!token) {
				console.log('Home - Token is null', token);
				return false;
			}
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
							Authorization: `Bearer ${localStorage.getItem(AUTH_TOKEN)}`,
						},
					}
				);

				if (response.status === 200 && response.data?.data?.access_token) {
					const access_token = response.data.data.access_token;

					// Save the access token and expiration time in localStorage
					localStorage.setItem(AUTH_TOKEN, access_token);

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
				localStorage.removeItem(AUTH_TOKEN);
				navigate('/login');
			}
		};
		verifyToken().then(r => console.log("Token verification done! ", r));
	}, [navigate]);

	return children;
};

export default SecureHomePage;
