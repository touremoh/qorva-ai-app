import { useCallback, useState, useMemo } from "react";
import {
	Grid2,
	Box,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { login as loginUser } from '../api/authService.js';
import { createCheckoutSession } from '../api/registrationService.js';
import { useTranslation } from 'react-i18next';
import { setAuthResults } from "../../../shared/lib/session.js";
import { DASHBOARD_STATUSES, NEEDS_PAYMENT_STATUSES, ACCOUNT_STATUS_DEMO } from '../../../constants.js';
import { EMAIL_REGEX } from '../../../shared/lib/validators.js';
import LoginMobileSignUp from './login/LoginMobileSignUp.jsx';
import LoginBrandPanel from './login/LoginBrandPanel.jsx';
import LoginFormPanel from './login/LoginFormPanel.jsx';
import * as tokens from '../../../theme/tokens.js';

const Login = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [touched, setTouched] = useState({ email: false, password: false });
	const [formError, setFormError] = useState("");
	// idle → loading (spinner + progress text) → success (green check, then navigate)
	const [status, setStatus] = useState('idle');
	// Set when the password was right but the account has email MFA on: the form becomes the code step.
	const [mfaChallenge, setMfaChallenge] = useState(null);

	const validate = useCallback((values) => {
		const next = { email: "", password: "" };
		if (!values.email) {
			next.email = t('login.emailRequired', 'Email is required');
		} else if (!EMAIL_REGEX.test(values.email)) {
			next.email = t('login.emailInvalid', 'Please enter a valid email address');
		}
		if (!values.password) {
			next.password = t('login.passwordRequired', 'Password is required');
		}
		return next;
	}, [t]);

	const liveErrors = useMemo(() => validate({ email, password }), [validate, email, password]);

	const handleBlur = (field) => () => {
		setTouched((prev) => ({ ...prev, [field]: true }));
	};

	const handleLogin = async (e) => {
		e.preventDefault();
		setFormError("");
		const finalErrors = validate({ email, password });
		setTouched({ email: true, password: true });
		if (Object.values(finalErrors).some(Boolean)) return;

		setStatus('loading');
		try {
			const response = await loginUser(email, password);

			if (response.status === 200) {
				const data = response.data.data;
				if (data.mfa) {
					setStatus('idle');
					setMfaChallenge(data.mfa);
					return;
				}
				await completeLogin(data);
			} else {
				setStatus('idle');
				setFormError(t('errors.unexpected', 'Something went wrong. Please try again.'));
			}
		} catch (error) {
			setStatus('idle');
			const httpStatus = error?.response?.status;
			const backend = error?.response?.data;
			if (httpStatus === 401) {
				setFormError(backend?.message || t('login.invalidCredentials', 'Invalid email or password'));
			} else if (httpStatus >= 400 && httpStatus < 500) {
				setFormError(backend?.message || t('errors.client', 'Request error.'));
			} else if (httpStatus >= 500) {
				// The MFA email could not be sent: say so rather than a generic server error.
				setFormError(backend?.errorCode === 'error.auth.mfa_delivery_failed'
					? backend.message
					: t('errors.server', 'Server error. Please try again later.'));
			} else {
				setFormError(t('errors.network', 'Network error. Check your connection.'));
			}
		}
	};

	// Post-login routing, shared by a plain login and a verified MFA code ({ jwt, user } either way).
	const completeLogin = async (data) => {
		const { user } = data;
		const subscriptionStatus = user.tenant?.subscriptionInfo?.subscriptionStatus;

		// Demo accounts enter the workspace directly — no active subscription
		// is required; the UI runs in restricted demo mode with sample data.
		if (user.userAccountStatus === ACCOUNT_STATUS_DEMO) {
			setAuthResults(data);
			showSuccessThen(() => navigate('/'));
		} else if (DASHBOARD_STATUSES.includes(subscriptionStatus)) {
			setAuthResults(data);
			showSuccessThen(() => navigate('/'));
		} else if (NEEDS_PAYMENT_STATUSES.includes(subscriptionStatus)) {
			const tenantId = user.tenantId;
			const userId = user.id;
			const priceId = user.tenant?.subscriptionInfo?.priceId;
			try {
				const checkoutRes = await createCheckoutSession({ tenantId, userId, priceId });
				const checkoutUrl = checkoutRes.data?.data?.checkoutUrl;
				if (checkoutUrl) {
					showSuccessThen(() => { window.location.href = checkoutUrl; });
				} else {
					failLogin(t('login.checkoutError', 'Could not initiate checkout. Please contact support.'));
				}
			} catch {
				failLogin(t('login.checkoutError', 'Could not initiate checkout. Please contact support.'));
			}
		} else {
			failLogin(t('login.subscriptionInactive', 'Your account is not active. Please contact support.'));
		}
	};

	// Back on the password form (leaving the MFA step if we were on it) with an optional message.
	const failLogin = (message) => {
		setStatus('idle');
		setMfaChallenge(null);
		setFormError(message);
	};

	const restartLogin = (message) => {
		setPassword('');
		setTouched((prev) => ({ ...prev, password: false }));
		failLogin(message || '');
	};

	// Flash the green success state so the user sees the API responded before we move on.
	const showSuccessThen = (action) => {
		setStatus('success');
		setTimeout(action, 800);
	};

	return (
		<Box
			sx={{
				minHeight: '100vh',
				width: '100vw',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				background: `linear-gradient(135deg, ${tokens.surface.cool} 0%, ${tokens.surface.coolDeep} 100%)`,
				position: 'fixed',
				top: 0,
				left: 0,
			}}
		>
			<Box
				sx={{
					width: { xs: '100%', sm: '90%', md: '780px', lg: '860px' },
					height: { xs: '100%', sm: 'auto' },
					minHeight: { xs: '100vh', sm: 'auto' },
					borderRadius: { xs: 0, sm: 3 },
					overflow: 'hidden',
					boxShadow: { xs: 'none', sm: '0 24px 64px rgba(0,0,0,0.14)' },
				}}
			>
				<Grid2 container sx={{ height: '100%' }}>

					{/* Left: Form panel */}
					<LoginFormPanel
						completeLogin={completeLogin}
						email={email}
						formError={formError}
						handleBlur={handleBlur}
						handleLogin={handleLogin}
						liveErrors={liveErrors}
						mfaChallenge={mfaChallenge}
						password={password}
						restartLogin={restartLogin}
						setEmail={setEmail}
						setPassword={setPassword}
						setShowPassword={setShowPassword}
						showPassword={showPassword}
						status={status}
						touched={touched}
					/>

					{/* Right: Brand panel */}
					<LoginBrandPanel navigate={navigate} />

					{/* Mobile: sign-up row */}
					<LoginMobileSignUp navigate={navigate} />

				</Grid2>
			</Box>
		</Box>
	);
};

export default Login;
