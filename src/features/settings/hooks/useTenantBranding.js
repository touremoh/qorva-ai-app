import { useEffect, useState } from 'react';
import { TENANT_ID } from '../../../constants.js';
import { getTenantById, getTenantLogo } from '../api/tenantService.js';

/**
 * The signed-in tenant's profile and logo, for branding shared documents (resume, match report).
 * The logo is fetched as a blob and exposed as an object URL, revoked when it changes or on unmount.
 */
export default function useTenantBranding() {
	const [tenant, setTenant] = useState(null);
	const [tenantLogoUrl, setTenantLogoUrl] = useState('');

	useEffect(() => {
		const tenantId = localStorage.getItem(TENANT_ID);
		if (!tenantId) return;
		getTenantById(tenantId)
			.then(res => setTenant(res?.data?.data ?? null))
			.catch(() => {});
	}, []);

	useEffect(() => {
		if (!tenant?.companyLogoUrl) { setTenantLogoUrl(''); return; }
		let objectUrl = '';
		getTenantLogo()
			.then(res => {
				objectUrl = URL.createObjectURL(res.data);
				setTenantLogoUrl(objectUrl);
			})
			.catch(() => setTenantLogoUrl(''));
		return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
	}, [tenant?.companyLogoUrl]);

	return { tenant, tenantLogoUrl };
}
