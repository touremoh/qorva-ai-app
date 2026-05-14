import React, { useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { TENANT_ID, USER_EMAIL } from '../../../constants.js';

const StripePricingTable = () => {
	useEffect(() => {
		if (!window.customElements.get('stripe-pricing-table')) return;
	}, []);

	const tableId = import.meta.env.VITE_APP_STRIPE_PRICING_TABLE_ID;
	const publishableKey = import.meta.env.VITE_APP_STRIPE_PUBLISHABLE_KEY;
	const tenantId = localStorage.getItem(TENANT_ID);
	const customerEmail = localStorage.getItem(USER_EMAIL);

	return (
		<Box sx={{
			width: '100%',
			backgroundColor: '#ffffff',
			border: '1px solid #e2e8f0',
			borderTop: '3px solid #629C44',
			borderRadius: 2.5,
			overflow: 'hidden',
			boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
		}}>
			<stripe-pricing-table
				pricing-table-id={tableId}
				publishable-key={publishableKey}
				client-reference-id={tenantId}
				customer-email={customerEmail}
			/>

			{/* Secure badge */}
			<Box sx={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				gap: 0.75,
				py: 1.75,
				borderTop: '1px solid #f1f5f9',
				backgroundColor: '#fafcfa',
			}}>
				<LockOutlinedIcon sx={{ fontSize: 13, color: '#94a3b8' }} />
				<Typography sx={{ fontSize: '0.72rem', color: '#94a3b8' }}>
					Secured by Stripe
				</Typography>
			</Box>
		</Box>
	);
};

export default StripePricingTable;
