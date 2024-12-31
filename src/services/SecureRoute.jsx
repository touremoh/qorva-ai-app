import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SecureRoute = ({ children }) => {
	const navigate = useNavigate();
	const token = localStorage.getItem('authToken');
	const tokenExpiry = localStorage.getItem('tokenExpiry');

	// Check token validity
	const isTokenValid = () => {
		const now = new Date().getTime();
		return token && tokenExpiry && now < tokenExpiry;
	};

	useEffect(() => {
		if (!isTokenValid()) {
			// Redirect to login if token is invalid or expired
			console.log('Token is invalid or expired. Redirecting to login.');
			localStorage.removeItem('authToken');
			localStorage.removeItem('tokenExpiry');
			navigate('/login');
		}
	}, [navigate]);

	// Prevent rendering while checking the token
	if (!isTokenValid()) {
		console.log('Token is invalid or expired. Redirecting to login.');
		localStorage.removeItem('authToken');
		localStorage.removeItem('tokenExpiry');
		return null;
	}

	return children;
};

export default SecureRoute;
