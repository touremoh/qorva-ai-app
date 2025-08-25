import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
	SUBSCRIPTION_INCOMPLETE,
	SUBSCRIPTION_STATUS
} from "../constants.js";

const SecureSubscriptionPage = ({ children }) => {
	const navigate = useNavigate();
	const subscriptionStatus = localStorage.getItem(SUBSCRIPTION_STATUS);

	useEffect(() => {
		if (subscriptionStatus !== SUBSCRIPTION_INCOMPLETE) {
			navigate('/');
		}
	}, [navigate]);

	return children;
};

export default SecureSubscriptionPage;
