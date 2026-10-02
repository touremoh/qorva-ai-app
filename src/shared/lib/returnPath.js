// "Return after login": a page of the app the user was sent away from (expired session, or a link in an
// email while signed out) is carried to the login page as ?next= and opened once they are signed in.
// Only paths inside the app are accepted, so the login page can't be used to send users elsewhere.

const MAX_LENGTH = 2000;

/** The path itself when it is an app page (/app/…), otherwise null. */
export const safeReturnPath = (raw) => {
	if (typeof raw !== 'string' || raw.length > MAX_LENGTH) return null;
	if (!raw.startsWith('/app/') && raw !== '/app') return null;
	// No protocol-relative URL, backslash tricks or control characters.
	if (raw.includes('//') || raw.includes('\\') || [...raw].some((c) => c.charCodeAt(0) < 0x20)) return null;
	return raw;
};

/** /login, flagged as an expired session if so, with the page to come back to when it is an app page. */
export const loginPath = ({ expired = false, from } = {}) => {
	const params = new URLSearchParams();
	if (expired) params.set('expired', '1');
	const next = safeReturnPath(from);
	if (next) params.set('next', next);
	const query = params.toString();
	return query ? `/login?${query}` : '/login';
};
