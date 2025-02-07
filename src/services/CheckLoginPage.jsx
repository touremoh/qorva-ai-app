import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {AUTH_TOKEN} from "../constants.js";

const CheckLoginPage = ({ children }) => {
	const navigate = useNavigate();
	const token = localStorage.getItem(AUTH_TOKEN);

	// Check token validity via API call
	const hasToken = async () => {
		try {
			return !!token;
		} catch (error) {
			console.error('Error validating token:', error);
			return false;
		}
	};

	useEffect(() => {
		const verifyToken = async () => {
			await hasToken() ? navigate('/') : navigate('/login');
		};
		verifyToken().then(r => console.log("Token verification done! ", r));
	}, [navigate]);

	return children;
};

export default CheckLoginPage;
