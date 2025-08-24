import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from "../../axiosConfig.js";
import {t} from "i18next";
import {
	AUTH_TOKEN,
	CANCELLATION_GRACE_PERIOD_STARTED,
	FREE_TRIAL_PERIOD_ACTIVE,
	SUBSCRIPTION_ACTIVE,
	SUBSCRIPTION_CANCELLED, SUBSCRIPTION_FAILED, SUBSCRIPTION_INCOMPLETE,
	SUBSCRIPTION_STATUS
} from "../constants.js";
import {setAuthResults} from "../../localStorageManager.js";

const SecureHomePage = ({ children }) => {
	const navigate = useNavigate();
	const token = localStorage.getItem(AUTH_TOKEN);

	// Check token validity via API call
	const isTokenValid = async () => {
		try {
			if (!token) {
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
				const response = await apiClient.post(
					import.meta.env.VITE_APP_API_REFRESH_TOKEN_URL,
					{
						headers: {
							Authorization: `Bearer ${localStorage.getItem(AUTH_TOKEN)}`,
						},
					}
				);


				if (response.status === 200) {
					setAuthResults(response.data.data);

					const subscriptionStatus = localStorage.getItem(SUBSCRIPTION_STATUS);

					// Check if subscription is incomplete in
					if (subscriptionStatus === FREE_TRIAL_PERIOD_ACTIVE
						|| subscriptionStatus === SUBSCRIPTION_ACTIVE
						|| subscriptionStatus === CANCELLATION_GRACE_PERIOD_STARTED) {
						console.log('Redirecting to home page');
					} else if (subscriptionStatus === SUBSCRIPTION_INCOMPLETE
						|| subscriptionStatus === SUBSCRIPTION_CANCELLED
						|| subscriptionStatus === SUBSCRIPTION_FAILED) {
						// Redirect to the home page
						navigate('/subscription');
					} else {
						navigate('/error', {
							state: {
								errorCode: response.status,
								errorMessage: t('errors.generic.message')
							}
						});
					}
				} else {
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
				localStorage.clear();
				navigate('/login');
			}
		};
		verifyToken().then(r => console.log("Token verification done! ", r));
	}, [navigate]);

	return children;
};

export default SecureHomePage;
