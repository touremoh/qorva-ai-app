import React from "react";
import { Container, Box, Typography, Link } from "@mui/material";
import { useTranslation } from "react-i18next";

const RegistrationSuccessful = () => {
	const { t } = useTranslation();

	return (
		<Container
			maxWidth="xl"
			sx={{
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				height: "100vh",
				backgroundColor: "transparent",
				color: "black",
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
					sx={{ color: "green", marginBottom: 2 }}
				>
					{t("registration.success.title")}
				</Typography>
				<Typography
					variant="h6"
					sx={{ marginBottom: 2 }}
				>
					{t("registration.success.message")}
				</Typography>
				<Typography variant="body1" sx={{ marginBottom: 2 }}>
					{t("registration.success.confirmationEmail")}
				</Typography>
				<Typography variant="body1">
					<Link href="/login" underline="hover">
						{t("registration.success.signInLink")}
					</Link>
				</Typography>
			</Box>
		</Container>
	);
};

export default RegistrationSuccessful;
