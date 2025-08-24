import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
	CANCELLATION_GRACE_PERIOD_STARTED,
	FREE_TRIAL_PERIOD_ACTIVE,
	SUBSCRIPTION_ACTIVE,
	SUBSCRIPTION_STATUS
} from "../constants.js";

const SecureSubscriptionPage = ({ children }) => {
	const navigate = useNavigate();
	const subscriptionStatus = localStorage.getItem(SUBSCRIPTION_STATUS);

	useEffect(() => {
		if (!subscriptionStatus) {
			navigate('/login');
		}
		if (subscriptionStatus === FREE_TRIAL_PERIOD_ACTIVE
			|| subscriptionStatus === SUBSCRIPTION_ACTIVE
			|| subscriptionStatus === CANCELLATION_GRACE_PERIOD_STARTED) {
			navigate('/');
		}
	}, [navigate]);

	return children;
};

export default SecureSubscriptionPage;
