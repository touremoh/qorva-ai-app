import ReactGA from 'react-ga4';

export const initGA = () => {
	ReactGA.initialize(import.meta.env.VITE_APP_GOOGLE_ANALYTICS_PIXEL);
};

export const logPageView = () => {
	ReactGA.send({ hitType: "pageview", page: window.location.pathname });
};
