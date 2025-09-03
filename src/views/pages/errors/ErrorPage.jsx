import React from "react";
import { useLocation } from "react-router-dom";
import { Container, Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

const ErrorPage = () => {
	const { t } = useTranslation();
	const location = useLocation();

	// Extract error code and message from the state
	const { errorCode = "generic", errorMessage = t("errors.generic.message") } = location.state || {};

	return (
		<Container
			maxWidth="xl"
			sx={{
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				height: "100vh",
				backgroundColor: "transparent",
				color: "black"
			}}
		>
			<Box
				sx={{
					width: "70vw",
					height: "50vh",
					backgroundColor: "white",
					boxShadow: 3,
					borderRadius: 2,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					textAlign: "center",
					padding: 4,
				}}
			>
				<Typography
					variant="h4"
					sx={{ color: "red", marginBottom: 2 }}
				>
					{t(`errors.${errorCode}.title`)}
				</Typography>
				<Typography
					variant="h6"
					sx={{ marginBottom: 2 }}
				>
					{errorMessage}
				</Typography>
				<Typography variant="body1">
					{t("errors.contactSupport")}
				</Typography>
			</Box>
		</Container>
	);
};

export default ErrorPage;
