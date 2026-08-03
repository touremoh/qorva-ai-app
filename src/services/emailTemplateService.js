import apiClient from '../../axiosConfig.js';

// Recruiter-authored invitation templates for candidate-update campaigns.

export const getEmailTemplates = () =>
    apiClient.get('/email-templates/candidate-update');

export const createEmailTemplate = ({ name, subject, bodyText }) =>
    apiClient.post('/email-templates/candidate-update', { name, subject, bodyText });

export const updateEmailTemplate = (templateId, { name, subject, bodyText }) =>
    apiClient.put(`/email-templates/candidate-update/${templateId}`, { name, subject, bodyText });

export const deleteEmailTemplate = (templateId) =>
    apiClient.delete(`/email-templates/candidate-update/${templateId}`);

/** Renders a draft (saved or not) inside the production HTML shell with sample data. */
export const previewEmailTemplate = ({ subject, bodyText, language }) =>
    apiClient.post('/email-templates/candidate-update/preview', { subject, bodyText, language });

/** Sends the template to the calling user's own mailbox with a dead link. */
export const sendTestEmailTemplate = (templateId, language = 'en') =>
    apiClient.post(`/email-templates/candidate-update/${templateId}/test`, null, { params: { language } });
