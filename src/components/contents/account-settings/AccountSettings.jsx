import React, { useEffect, useState } from "react";
import {
	Container,
	Box,
	Paper,
	Typography,
	Divider,
	Collapse,
	Stack,
	CircularProgress,
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LanguageSwitcher from "../../../components/languages/LanguageSwitcher.jsx";
import { useNavigate } from "react-router-dom";
import apiClient from "../../../../axiosConfig.js";
import { useTranslation } from "react-i18next";

import {
	SUBSCRIPTION_STATUS,
	TENANT_ID,
	USER_EMAIL,
	USER_FIRST_NAME,
	USER_LAST_NAME
} from "../../../constants.js";
import QorvaChip from "../../commons/QorvaChip.jsx";


const AccountSettings = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();

	// UI states
	const [loadingPortal, setLoadingPortal] = useState(false);
	const [showUserInfo, setShowUserInfo] = useState(false);

	// User info pulled from localStorage
	const [userInfo, setUserInfo] = useState({
		email: "",
		firstName: "",
		lastName: "",
		tenantId: "",
		subscriptionStatus: ""
	});

	useEffect(() => {
		setUserInfo({
			email: localStorage.getItem(USER_EMAIL) || "",
			firstName: localStorage.getItem(USER_FIRST_NAME) || "",
			lastName: localStorage.getItem(USER_LAST_NAME) || "",
			tenantId: localStorage.getItem(TENANT_ID) || "",
			subscriptionStatus: localStorage.getItem(SUBSCRIPTION_STATUS) || ""
		});
	}, []);

	// Redirect to Stripe Billing Portal via backend-created session (recommended)
	const handleOpenBillingPortal = async () => {
		try {
			setLoadingPortal(true);
			const endpoint = import.meta.env.VITE_APP_API_PORTAL_SESSION_URL;
			const res = await apiClient.post(endpoint);
			if (res?.data?.url) {
				window.location.href = res.data.url;
				return;
			}
			const fallback = import.meta.env.VITE_STRIPE_TEST_PORTAL_URL;
			if (fallback) window.location.href = fallback;
		} catch (e) {
			console.error("Failed to open billing portal", e);
			navigate("/error", {
				state: {
					errorCode: e.response?.status || 500,
					errorMessage: t("errors.generic.message")
				}
			});
		} finally {
			setLoadingPortal(false);
		}
	};

	return (
		<Container
			maxWidth="xl"
			sx={{
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				minHeight: "100vh",
				py: 4
			}}
		>
			{/* White paper */}
			<Paper
				elevation={4}
				sx={{
					width: { xs: "96%", md: "60%" },
					height: "80vh",
					backgroundColor: "white",
					borderRadius: 2,
					overflow: "hidden",
					display: "flex",
					flexDirection: "column"
				}}
			>
				{/* Header */}
				<Box sx={{ p: 3, backgroundColor: "#F7F7F8" }}>
					<Typography variant="h5" sx={{ fontWeight: 600 }}>
						{t("accountSettings.title")}
					</Typography>
					<Typography variant="body2" color="text.secondary">
						{t("accountSettings.subtitle")}
					</Typography>
				</Box>

				<Divider />

				{/* Content */}
				<Box sx={{ flex: 1, p: 3, overflowY: "auto" }}>
					{/* Two big rectangular actions */}
					<Box
						sx={{
							display: "grid",
							gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
							gap: 2,
							mb: 2
						}}
					>
						{/* Stripe Portal (clickable rectangle) */}
						<Paper
							elevation={1}
							onClick={handleOpenBillingPortal}
							role="button"
							tabIndex={0}
							onKeyDown={(e) => {
								if (e.key === "Enter" || e.key === " ") handleOpenBillingPortal();
							}}
							sx={{
								cursor: "pointer",
								p: 3,
								minHeight: 180,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								borderRadius: 2,
								transition: "transform 120ms ease, box-shadow 120ms ease, background-color 120ms ease",
								"&:hover": {
									transform: "scale(1.01)",
									boxShadow: 6,
									backgroundColor: "#f7faf7"
								},
								"&:active": { transform: "scale(0.995)" }
							}}
						>
							{loadingPortal ? (
								<Stack alignItems="center" spacing={1}>
									<CircularProgress size={28} />
									<Typography variant="body2" color="text.secondary">
										{t("accountSettings.openingBillingPortal", "Opening billing portal…")}
									</Typography>
								</Stack>
							) : (
								<Stack alignItems="center" spacing={1.2}>
									<OpenInNewIcon fontSize="large" />
									<Typography variant="h6" sx={{ fontWeight: 600, textAlign: "center" }}>
										{t("accountSettings.manageBilling")}
									</Typography>
									<Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
										{t(
											"accountSettings.manageBillingHint",
											"View invoices, change plan, update payment method"
										)}
									</Typography>
								</Stack>
							)}
						</Paper>

						{/* Toggle User Info (clickable rectangle) */}
						<Paper
							elevation={3}
							onClick={() => setShowUserInfo((v) => !v)}
							role="button"
							tabIndex={0}
							onKeyDown={(e) => {
								if (e.key === "Enter" || e.key === " ") setShowUserInfo((v) => !v);
							}}
							sx={{
								cursor: "pointer",
								p: 3,
								minHeight: 180,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								borderRadius: 2,
								transition: "transform 120ms ease, box-shadow 120ms ease, background-color 120ms ease",
								"&:hover": {
									transform: "scale(1.01)",
									boxShadow: 6,
									backgroundColor: "#f7f9ff"
								},
								"&:active": { transform: "scale(0.995)" }
							}}
						>
							<Stack alignItems="center" spacing={1.2}>
								<AccountCircleIcon fontSize="large" />
								<Typography variant="h6" sx={{ fontWeight: 600, textAlign: "center" }}>
									{t("accountSettings.viewProfile")}
								</Typography>
								<Typography variant="body2" color="text.secondary" textAlign="center">
									{showUserInfo
										? t("accountSettings.hideProfileHint", "Hide your profile information")
										: t("accountSettings.viewProfileHint", "Show your profile information")}
								</Typography>
							</Stack>
						</Paper>
					</Box>

					{/* Collapsible User Info */}
					<Collapse in={showUserInfo} timeout="auto" unmountOnExit>
						<Box
							sx={{
								mt: 2,
								p: 2,
								border: "1px solid",
								borderColor: "divider",
								borderRadius: 1,
								backgroundColor: "#FAFAFA"
							}}
						>
							<Typography variant="h6" gutterBottom>
								{t("accountSettings.profileInformation")}
							</Typography>

							<Stack spacing={1.2}>
								<Typography variant="body2">
									<strong>{t("accountSettings.firstName")}:</strong> {userInfo.firstName || "—"}
								</Typography>
								<Typography variant="body2">
									<strong>{t("accountSettings.lastName")}:</strong> {userInfo.lastName || "—"}
								</Typography>
								<Typography variant="body2">
									<strong>{t("accountSettings.email")}:</strong> {userInfo.email || "—"}
								</Typography>
								<Typography variant="body2" sx={{ display: "flex", justifyContent: "center",  alignItems: "center", textAlign: "center", gap: 1 }}>
									<strong>{t("accountSettings.subscriptionStatus")}:</strong>
									<QorvaChip statusCode={userInfo.subscriptionStatus} />
								</Typography>
							</Stack>
						</Box>
					</Collapse>
				</Box>

				<Divider />

				{/* Footer */}
				<Box
					sx={{
						p: 2,
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between"
					}}
				>
					<Typography variant="caption" color="text.secondary" sx={{ width: "80%", textAlign: "left" }}>
						{t("accountSettings.footerHint")}
					</Typography>
					<LanguageSwitcher />
				</Box>
			</Paper>
		</Container>
	);
};

export default AccountSettings;
