import { useCallback, useEffect, useState, useMemo } from 'react';
import {
	Grid2,
	Box,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../api/registrationService.js';
import { useTranslation } from 'react-i18next';
import { EMAIL_REGEX } from '../../../shared/lib/validators.js';
import RegisterBrandPanel from './register/RegisterBrandPanel.jsx';
import RegisterFormPanel from './register/RegisterFormPanel.jsx';
import RegisterTopBar from './register/RegisterTopBar.jsx';
import { PROGRESS_STEPS } from '../model/registration.js';

const UserRegistration = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();

	const [userInfo, setUserInfo] = useState({
		firstName: '',
		lastName: '',
		email: '',
		organizationName: '',
		recruitmentType: '',
		organizationSize: '',
	});
	const [touched, setTouched] = useState({});
	const [formError, setFormError] = useState('');
	const [accountExists, setAccountExists] = useState(false);
	// idle → loading (spinner + staged progress text) → success (green check, then navigate)
	const [status, setStatus] = useState('idle');
	const [progressStep, setProgressStep] = useState(0);

	// Advance the behind-the-scenes message while the request is in flight.
	useEffect(() => {
		if (status !== 'loading') return undefined;
		setProgressStep(0);
		const interval = setInterval(
			() => setProgressStep((step) => Math.min(step + 1, PROGRESS_STEPS.length - 1)),
			2200,
		);
		return () => clearInterval(interval);
	}, [status]);

	const validate = useCallback((values) => {
		const next = {};
		if (!values.firstName?.trim()) next.firstName = t('registration.firstNameRequired', 'First name is required');
		if (!values.lastName?.trim()) next.lastName = t('registration.lastNameRequired', 'Last name is required');
		if (!values.organizationName?.trim()) next.organizationName = t('registration.organizationNameRequired', 'Organization name is required');
		if (!values.recruitmentType) next.recruitmentType = t('registration.recruitmentTypeRequired', 'Please select a recruitment type');
		if (!values.organizationSize) next.organizationSize = t('registration.organizationSizeRequired', 'Please select an organization size');
		if (!values.email) {
			next.email = t('registration.emailRequired', 'Email is required');
		} else if (!EMAIL_REGEX.test(values.email)) {
			next.email = t('registration.emailInvalid', 'Enter a valid business email');
		}
		return next;
	}, [t]);

	const liveErrors = useMemo(() => validate(userInfo), [validate, userInfo]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setUserInfo((prev) => ({ ...prev, [name]: value }));
		if (accountExists) setAccountExists(false);
	};

	const handleBlur = (field) => () => {
		setTouched((prev) => ({ ...prev, [field]: true }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setFormError('');
		setAccountExists(false);
		const finalErrors = validate(userInfo);
		setTouched({
			firstName: true, lastName: true, email: true,
			organizationName: true, recruitmentType: true, organizationSize: true,
		});
		if (Object.keys(finalErrors).length) return;

		setStatus('loading');
		try {
			const response = await registerUser(userInfo);
			if (response.status === 200 && response.data?.data?.success) {
				// Flash the green success state so the user sees the API responded before we move on.
				setStatus('success');
				setTimeout(() => navigate('/success', { state: { email: userInfo.email } }), 900);
			} else {
				setStatus('idle');
				setFormError(t('registration.errorMessage', 'Something went wrong. Try again.'));
			}
		} catch (error) {
			setStatus('idle');
			const httpStatus = error?.response?.status;
			const backend = error?.response?.data;
			if (httpStatus === 406 || backend?.errorCode === 'error.user.already_exists') {
				setAccountExists(true);
			} else if (httpStatus >= 400 && httpStatus < 500) {
				setFormError(backend?.message || t('registration.clientError', 'Request error. Check your input.'));
			} else if (httpStatus >= 500) {
				setFormError(backend?.message || t('registration.serverError', 'Server issue. Please try later.'));
			} else {
				setFormError(backend?.message || t('registration.networkError', 'Network issue. Check your connection.'));
			}
		}
	};

	const trustItems = [
		{ title: t('registration.freeTrialTitle'), desc: t('registration.freeTrial') },
		{ title: t('registration.cancelAnytimeTitle'), desc: t('registration.cancelAnytime') },
		{ title: t('registration.dataDeletedTitle'), desc: t('registration.dataDeleted') },
	];

	return (
		<Box
			sx={{
				position: 'fixed',
				top: 0,
				left: 0,
				width: '100vw',
				height: '100vh',
				overflowY: 'auto',
				overflowX: 'hidden',
				background: 'linear-gradient(135deg, #f0f4f8 0%, #e8edf2 100%)',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				pb: 6,
			}}
		>
			{/* Top bar */}
			<RegisterTopBar />

			<Box
				sx={{
					width: { xs: '100%', sm: '95%', md: '860px', lg: '920px' },
					mt: { xs: 0, sm: 4 },
					borderRadius: { xs: 0, sm: 3 },
					overflow: 'hidden',
					boxShadow: { xs: 'none', sm: '0 24px 64px rgba(0,0,0,0.14)' },
				}}
			>
				<Grid2 container>
					{/* Left: Form panel */}
					<RegisterFormPanel
						accountExists={accountExists}
						formError={formError}
						handleBlur={handleBlur}
						handleChange={handleChange}
						handleSubmit={handleSubmit}
						liveErrors={liveErrors}
						navigate={navigate}
						progressStep={progressStep}
						status={status}
						touched={touched}
						userInfo={userInfo}
					/>

					{/* Right: Brand panel */}
					<RegisterBrandPanel trustItems={trustItems} />
				</Grid2>
			</Box>
		</Box>
	);
};

export default UserRegistration;
