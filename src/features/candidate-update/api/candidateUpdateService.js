import axios from 'axios';

// Bare client on purpose: the app's apiClient injects auth headers and redirects on 401 —
// this page is public and must stay free of the authenticated shell's behavior.
const publicClient = axios.create({ baseURL: import.meta.env.VITE_APP_API_BASE_URL });

/** The update form behind a candidate's emailed link (the token is the only credential). */
export const getCandidateUpdate = (token) => publicClient.get(`/public/candidate-update/${token}`);

export const submitCandidateUpdate = (token, payload) => publicClient.post(`/public/candidate-update/${token}`, payload);

/** Processing status of a submitted update (the resume is re-analyzed in the background). */
export const getCandidateUpdateStatus = (token) => publicClient.get(`/public/candidate-update/${token}/status`);

export const unsubscribeCandidate = (token) => publicClient.post(`/public/candidate-update/${token}/unsubscribe`);
