// Example: src/pages/PricingPage.jsx
import React from 'react';
import StripePricingTable from "./StripePricingTable.jsx";
import {Box, Typography} from "@mui/material";


const PricingPage = () => {
	return (
		<Box sx={{ width: '100vw', height: '100vh', paddingTop: '5%', backgroundColor: 'transparent', color: '#232F3E', top: 0, position: 'fixed', left: 0, maxWidth: { xs: '100vw', md: '100vw' }, borderRadius: 2, overflow: 'hidden' }}>
			<Typography variant="h3" gutterBottom> Qorva AI - Choose Your Plan </Typography>
			<StripePricingTable />
		</Box>
	);
};

export default PricingPage;
