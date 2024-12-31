import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SecureLoginPage = ({ children }) => {
	const navigate = useNavigate();
	const token = localStorage.getItem('authToken');
	const tokenExpiry = localStorage.getItem('tokenExpiry');

	// Check token validity
	const isTokenValid = () => {
		const now = new Date().getTime();
		return token && tokenExpiry && now < tokenExpiry;
	};

	useEffect(() => {
		const verifyToken = async () => {
			if (isTokenValid()) {
				console.log('Token valid - Redirecting to home page');
				navigate('/');
			} else {
				console.log('Token is invalid or expired. Redirecting to login.');
				localStorage.removeItem('authToken');
				localStorage.removeItem('tokenExpiry');
				navigate('/login');
			}
		};
		verifyToken();
	}, [navigate]);

	return children;
};

export default SecureLoginPage;
