import apiClient from '../shared/api/client.js';

// Everything the composer needs on open: candidate name/email, suppression, the caller's mailbox state, history.
export const getOutreachContext = (cvId) =>
    apiClient.get('/candidate-outreach/context', { params: { cvId } });

// { cvId, jobPostId?, matchingReportId?, intent, tone?, language?, instructions? } → { subject, body }
export const draftOutreach = (body) =>
    apiClient.post('/candidate-outreach/draft', body);

// Send through the caller's connected mailbox (Phase 2). { cvId, jobPostId?, matchingReportId?, to, subject, body }
export const sendOutreach = (body) =>
    apiClient.post('/candidate-outreach/send', body);

// The composer opened the recruiter's own client; record the hand-off. via = GMAIL | OUTLOOK_WEB | MAILTO
export const recordExternalOutreach = (body) =>
    apiClient.post('/candidate-outreach/external', body);
