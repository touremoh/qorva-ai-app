import apiClient from '../shared/api/client.js';

// Which providers this environment can connect ({ microsoft: boolean }).
export const getMailboxAvailability = () =>
    apiClient.get('/mailbox-connections/availability');

// 200 { provider, emailAddress, status, connectedAt, lastUsedAt } or 204 when nothing is connected.
export const getMyMailbox = () =>
    apiClient.get('/mailbox-connections/me');

/** Returns the provider consent URL; the caller redirects the whole window to it. */
export const startMailboxOauth = (provider) =>
    apiClient.post('/mailbox-connections/oauth/start', { provider });

export const disconnectMailbox = () =>
    apiClient.delete('/mailbox-connections/me');
