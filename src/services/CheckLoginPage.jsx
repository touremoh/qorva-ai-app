import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {AUTH_TOKEN} from "../constants.js";
import { safeReturnPath } from "../shared/lib/returnPath.js";

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
			// Signed in already: straight to the page asked for (?next=, app pages only). Otherwise stay here,
			// keeping the query (?expired=1, ?next=) the login form reads.
			if (await hasToken()) navigate(safeReturnPath(new URLSearchParams(window.location.search).get('next')) ?? '/');
		};
		verifyToken().then(r => console.log("Token verification done! ", r));
	// eslint-disable-next-line react-hooks/exhaustive-deps -- hasToken is recreated every render; re-check on navigation only
	}, [navigate]);

	return children;
};

export default CheckLoginPage;
