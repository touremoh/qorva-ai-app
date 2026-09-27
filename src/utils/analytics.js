import ReactGA from 'react-ga4';

// Analytics is optional: without a measurement id (local runs, previews) nothing is sent,
// instead of ReactGA throwing and taking the whole app down with it.
const measurementId = import.meta.env.VITE_APP_GOOGLE_ANALYTICS_PIXEL;
let enabled = false;

export const initGA = () => {
	if (!measurementId) return;
	ReactGA.initialize(measurementId);
	enabled = true;
};

export const logPageView = () => {
	if (!enabled) return;
	ReactGA.send({ hitType: "pageview", page: window.location.pathname });
};
