import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import PropTypes from 'prop-types';
import { validateToken, refreshToken } from '../features/auth/api/authService.js';
import { t } from "i18next";
import {
	AUTH_TOKEN,
	SUBSCRIPTION_STATUS,
	DASHBOARD_STATUSES,
	NEEDS_PAYMENT_STATUSES,
} from "../constants.js";
import { setAuthResults } from "../shared/lib/session.js";
import { isDemoUser } from "../utils/demoMode.js";
import * as tokens from '../theme/tokens.js';

const SecureHomePage = ({ children }) => {
	const navigate = useNavigate();
	const [isAuthorized, setIsAuthorized] = useState(false);

	useEffect(() => {
		const isTokenValid = async (token) => {
			try {
				if (!token) return false;
				const response = await validateToken(token);
				return response.data?.data === true;
			} catch {
				return false;
			}
		};

		const verifyToken = async () => {
			const token = localStorage.getItem(AUTH_TOKEN);

			if (!(await isTokenValid(token))) {
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

				// Demo accounts have no active subscription yet but still get full
				// (restricted) access to the workspace with sample data.
				if (isDemoUser()) {
					setIsAuthorized(true);
				} else if (DASHBOARD_STATUSES.includes(subscriptionStatus)) {
					setIsAuthorized(true);
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

	if (!isAuthorized) {
		return (
			<Box
				sx={{
					height: '100vh',
					width: '100vw',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<CircularProgress sx={{ color: tokens.brand.text }} />
			</Box>
		);
	}

	return children;
};

SecureHomePage.propTypes = {
	children: PropTypes.node,
};

export default SecureHomePage;
