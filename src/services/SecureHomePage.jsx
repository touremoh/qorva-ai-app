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
import { renewSession, setAuthResults } from "../shared/lib/session.js";
import { loginPath } from "../shared/lib/returnPath.js";
import useSessionRefresh from "../shared/hooks/useSessionRefresh.js";
import { isDemoUser } from "../utils/demoMode.js";
import * as tokens from '../theme/tokens.js';

const SecureHomePage = ({ children }) => {
	const navigate = useNavigate();
	const [isAuthorized, setIsAuthorized] = useState(false);

	// Refresh before the token expires while the user is active (the API cannot renew an expired one).
	useSessionRefresh({
		active: isAuthorized,
		refresh: refreshToken,
		onRefreshed: (response) => renewSession(response.data.data),
	});

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

		// Read before any await: once a redirect has happened (or a second effect run), the URL is the login page.
		const requested = window.location.pathname + window.location.search;

		const verifyToken = async () => {
			const token = localStorage.getItem(AUTH_TOKEN);

			if (!(await isTokenValid(token))) {
				localStorage.clear();
				// A stored token that no longer validates is an expired (or ended) session. Either way the page
				// asked for (e.g. a digest email's link) is opened again after login.
				navigate(loginPath({ expired: !!token, from: requested }));
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
