// src/components/StripePricingTable.jsx
import React, {useEffect} from 'react';
import {Box} from "@mui/material";
import {TENANT_ID, USER_EMAIL} from "../../../constants.js";

const StripePricingTable = () => {

	useEffect(() => {
		// Wait until the custom element is defined
		if (!window.customElements.get('stripe-pricing-table')) return;
	}, []);

	const tableId = import.meta.env.VITE_APP_STRIPE_PRICING_TABLE_ID;
	const publishableKey = import.meta.env.VITE_APP_STRIPE_PUBLISHABLE_KEY;
	const tenantId = localStorage.getItem(TENANT_ID);
	const customerEmail = localStorage.getItem(USER_EMAIL);

	return (
		<Box sx={{ width: '60%', height: '70%', marginLeft: '20%', backgroundColor: 'white', padding: 5, maxWidth: { xs: '100%', md: '100%' }, boxShadow: 3, borderRadius: 2, overflowY: 'scroll' }}>
			<stripe-pricing-table
				pricing-table-id={tableId}
				publishable-key={publishableKey}
				client-reference-id={tenantId}
				customer-email={customerEmail}
			>
			</stripe-pricing-table>
		</Box>
	);
};

export default StripePricingTable;
