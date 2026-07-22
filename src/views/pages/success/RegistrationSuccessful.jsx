import { useState } from "react";
import {
	Box,
	Container,
	Paper,
	Typography,
	Button,
	Stack,
	Divider
} from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { resendActivation } from "../../../services/authService.js";

const RegistrationSuccessful = () => {
	const { t } = useTranslation();
	const location = useLocation();
	const email = location.state?.email;

	// resendState: 'idle' | 'sending' | 'sent'
	const [resendState, setResendState] = useState('idle');

	const handleResend = async () => {
		if (!email) return;
		setResendState('sending');
		try {
			await resendActivation(email);
		} catch {
			// Neutral outcome regardless — no account enumeration.
		} finally {
			setResendState('sent');
		}
	};

	return (
		<Box
			sx={{
				height: "100vh",
				width: "100vw",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				background: "radial-gradient(1200px 600px at 20% -10%, rgba(35,47,62,0.08) 0%, rgba(0,0,0,0) 55%), linear-gradient(180deg, rgba(0,0,0,0.02), rgba(0,0,0,0))",
				px: 2,
				top: 0,
				left: 0,
				position: "fixed"
			}}
		>
			<Container maxWidth="md">
				<Paper
					elevation={10}
					sx={{
						borderRadius: 4,
						px: { xs: 3, sm: 6 },
						py: { xs: 4, sm: 6 },
						mx: "auto",
						maxWidth: 920,
						backdropFilter: "blur(4px)"
					}}
				>
					<Stack spacing={3} alignItems="center" textAlign="center">
						<Box
							sx={{
								width: 88,
								height: 88,
								borderRadius: "50%",
								display: "grid",
								placeItems: "center",
								bgcolor: (theme) =>
									theme.palette.mode === "dark"
										? "success.dark"
										: "success.main",
								boxShadow: (theme) =>
									`0 10px 30px ${theme.palette.success.main}33`
							}}
							aria-hidden
						>
							<CheckCircleRoundedIcon
								sx={{ fontSize: 56, color: "common.white" }}
							/>
						</Box>

						<Stack spacing={1.2}>
							<Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: 0.2 }}>
								{t("registrationSuccess.title")}
							</Typography>
							<Typography variant="h6" color="text.secondary">
								{t("registrationSuccess.subtitle")}
							</Typography>
						</Stack>

						<Divider flexItem sx={{ my: 1 }} />

						<Typography
							variant="body1"
							color="text.secondary"
							sx={{ maxWidth: 640 }}
						>
							{t("registrationSuccess.emailNote")}
						</Typography>

						<Button
							component={RouterLink}
							to="/login"
							variant="contained"
							size="large"
							startIcon={<LoginRoundedIcon />}
							sx={{
								mt: 1,
								px: 4,
								py: 1.25,
								borderRadius: 2,
								textTransform: "none",
								fontWeight: 700,
								letterSpacing: 0.2
							}}
							data-testid="go-to-login"
							aria-label={t("registrationSuccess.ctaLogin")}
						>
							{t("registrationSuccess.ctaLogin")}
						</Button>

						{/* Didn't get it? Resend */}
						{resendState === 'sent' ? (
							<Typography variant="body2" sx={{ color: 'success.main', fontWeight: 600 }}>
								{t("registrationSuccess.resendConfirm", "If that email exists, we've sent a new link.")}
							</Typography>
						) : (
							<Typography variant="body2" color="text.secondary">
								{t("registrationSuccess.noEmail", "Didn't get it?")}
								{' '}
								{email ? (
									<Typography
										component="span"
										onClick={resendState === 'sending' ? undefined : handleResend}
										sx={{
											color: 'primary.main',
											fontWeight: 600,
											cursor: resendState === 'sending' ? 'default' : 'pointer',
											opacity: resendState === 'sending' ? 0.6 : 1,
											'&:hover': { textDecoration: resendState === 'sending' ? 'none' : 'underline' },
										}}
									>
										{resendState === 'sending'
											? t("registrationSuccess.resending", "Sending…")
											: t("registrationSuccess.resend", "Resend")}
									</Typography>
								) : (
									<Typography
										component={RouterLink}
										to="/resend-activation"
										sx={{ color: 'primary.main', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
									>
										{t("registrationSuccess.resend", "Resend")}
									</Typography>
								)}
							</Typography>
						)}

						<Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
							{t("registrationSuccess.help")}
						</Typography>
					</Stack>
				</Paper>
			</Container>
		</Box>
	);
};

export default RegistrationSuccessful;
