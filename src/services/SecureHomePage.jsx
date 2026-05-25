import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateToken, refreshToken } from './authService.js';
import { t } from "i18next";
import {
	AUTH_TOKEN,
	SUBSCRIPTION_STATUS,
	DASHBOARD_STATUSES,
	NEEDS_PAYMENT_STATUSES,
} from "../constants.js";
import { setAuthResults } from "../../localStorageManager.js";

const SecureHomePage = ({ children }) => {
	const navigate = useNavigate();
	const token = localStorage.getItem(AUTH_TOKEN);

	const isTokenValid = async () => {
		try {
			if (!token) return false;
			const response = await validateToken(token);
			return response.data?.data === true;
		} catch {
			return false;
		}
	};

	useEffect(() => {
		const verifyToken = async () => {
			if (!(await isTokenValid())) {
				localStorage.clear();
				navigate('/login');
				return;
			}

			try {
				const response = await refreshToken();

				if (response.status !== 200) {
					navigate('/error', { state: { errorCode: response.status, errorMessage: t('errors.generic.message') } });
					return;
				}

				setAuthResults(response.data.data);
				const subscriptionStatus = localStorage.getItem(SUBSCRIPTION_STATUS);

				if (DASHBOARD_STATUSES.includes(subscriptionStatus)) {
					// valid — stay on dashboard
				} else if (NEEDS_PAYMENT_STATUSES.includes(subscriptionStatus)) {
					navigate('/billing/cancel');
				} else {
					navigate('/error', { state: { errorCode: 'subscription', errorMessage: t('errors.generic.message') } });
				}
			} catch {
				navigate('/error', { state: { errorCode: 'generic', errorMessage: t('errors.generic.message') } });
			}
		};

		verifyToken();
	}, [navigate]);

	return children;
};

export default SecureHomePage;
