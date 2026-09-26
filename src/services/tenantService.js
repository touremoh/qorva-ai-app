import apiClient, { apiFormDataClient } from '../shared/api/client.js';

export const updateTenantProfile = (profileData, logoFile) => {
    const formData = new FormData();
    formData.append('profile', new Blob([JSON.stringify(profileData)], { type: 'application/json' }));
    if (logoFile) {
        formData.append('logo', logoFile);
    }
    return apiFormDataClient.patch('/tenants/profile', formData);
};

export const getTenantById = (tenantId) => apiClient.get(`/tenants/${tenantId}`);

/** The tenant's logo as a blob (for branding the CV and report views), or a rejected promise when none is set. */
export const getTenantLogo = () => apiClient.get('/tenants/logo', { responseType: 'blob' });
