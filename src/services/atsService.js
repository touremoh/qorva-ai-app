import apiClient from '../../axiosConfig.js';

// ATS integrations: connection management, manual syncs, and the OAuth handoff.

export const getAtsProviders = () =>
    apiClient.get('/ats/providers');

export const getAtsConnections = () =>
    apiClient.get('/ats/connections');

export const createAtsConnection = ({ provider, displayName, apiKey, subdomain, companyId, onBehalfOfUserId }) =>
    apiClient.post('/ats/connections', { provider, displayName, apiKey, subdomain, companyId, onBehalfOfUserId });

export const updateAtsConnection = (connectionId, settings) =>
    apiClient.patch(`/ats/connections/${connectionId}`, settings);

export const deleteAtsConnection = (connectionId) =>
    apiClient.delete(`/ats/connections/${connectionId}`);

export const testAtsConnection = (connectionId) =>
    apiClient.post(`/ats/connections/${connectionId}/test`);

export const startAtsSync = (connectionId) =>
    apiClient.post(`/ats/connections/${connectionId}/sync`);

export const getAtsSyncRuns = (connectionId) =>
    apiClient.get(`/ats/connections/${connectionId}/runs`);

/** Returns the provider consent URL; the caller redirects the whole window to it. */
// region is the provider datacenter to authenticate against (Zoho only; ignored elsewhere).
export const startAtsOauth = (provider, region) =>
    apiClient.post('/ats/connections/oauth/start', { provider, region });
