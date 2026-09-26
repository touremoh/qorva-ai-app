import PropTypes from 'prop-types';
import { Grid2, Typography, TextField, Button, Box, InputAdornment, Alert, MenuItem, Divider, CircularProgress } from '@mui/material';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { RECRUITMENT_TYPES, ORGANIZATION_SIZES } from '../../../../constants.js';
import { inputSx } from '../../model/styles.js';
import { useTranslation } from 'react-i18next';
import { PROGRESS_STEPS } from '../../model/registration.js';
import * as tokens from '../../../../theme/tokens.js';
import { alpha } from '@mui/material/styles';

/** Registration form: company, account and plan steps. */
const RegisterFormPanel = ({ accountExists, formError, handleBlur, handleChange, handleSubmit, liveErrors, navigate, progressStep, status, touched, userInfo }) => {
	const { t } = useTranslation();
	return (
		<>
		<Grid2
			size={{ xs: 12, md: 7 }}
			sx={{
				backgroundColor: tokens.surface.paper,
				padding: { xs: '36px 28px', sm: '44px 52px' },
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
			}}
		>
			<Typography
				variant="h5"
				sx={{ fontWeight: 700, color: tokens.ink.strong, letterSpacing: '-0.03em', mb: 0.5 }}
			>
				{t('registration.title')}
			</Typography>
			<Typography variant="body2" sx={{ color: tokens.ink.muted, mb: 2.5 }}>
				{t('registration.demoSubtext', 'Create your free demo workspace — no credit card, no payment.')}
			</Typography>

			{formError && (
				<Alert severity="error" variant="filled" sx={{ mb: 2, borderRadius: 1.5, fontSize: tokens.fontSize.body2 }}>
					{formError}
				</Alert>
			)}

			{accountExists && (
				<Alert
					severity="info"
					sx={{ mb: 2, borderRadius: 1.5, fontSize: tokens.fontSize.body2 }}
					action={
						<Button color="inherit" size="small" onClick={() => navigate('/login')}>
							{t('registration.signIn', 'Sign in')}
						</Button>
					}
				>
					{t('registration.accountExists', 'An account with this email already exists. Please log in.')}
				</Alert>
			)}

			<Box component="form" noValidate onSubmit={handleSubmit}>
				<Grid2 container spacing={1.5}>
					<Grid2 size={{ xs: 12, sm: 6 }}>
						<TextField
							label={t('registration.firstName')}
							name="firstName"
							variant="outlined"
							fullWidth
							required
							size="small"
							value={userInfo.firstName}
							onChange={handleChange}
							onBlur={handleBlur('firstName')}
							error={Boolean(touched.firstName && liveErrors.firstName)}
							helperText={(touched.firstName && liveErrors.firstName) || ' '}
							sx={inputSx}
							slotProps={{
								input: {
									startAdornment: (
										<InputAdornment position="start">
											<PersonOutlinedIcon sx={{ fontSize: tokens.iconSize.lg, color: tokens.ink.subtle }} />
										</InputAdornment>
									),
								},
							}}
						/>
					</Grid2>
					<Grid2 size={{ xs: 12, sm: 6 }}>
						<TextField
							label={t('registration.lastName')}
							name="lastName"
							variant="outlined"
							fullWidth
							required
							size="small"
							value={userInfo.lastName}
							onChange={handleChange}
							onBlur={handleBlur('lastName')}
							error={Boolean(touched.lastName && liveErrors.lastName)}
							helperText={(touched.lastName && liveErrors.lastName) || ' '}
							sx={inputSx}
							slotProps={{
								input: {
									startAdornment: (
										<InputAdornment position="start">
											<PersonOutlinedIcon sx={{ fontSize: tokens.iconSize.lg, color: tokens.ink.subtle }} />
										</InputAdornment>
									),
								},
							}}
						/>
					</Grid2>
					<Grid2 size={{ xs: 12 }}>
						<TextField
							label={t('registration.email')}
							name="email"
							type="email"
							variant="outlined"
							fullWidth
							required
							size="small"
							value={userInfo.email}
							onChange={handleChange}
							onBlur={handleBlur('email')}
							error={Boolean(touched.email && liveErrors.email)}
							helperText={(touched.email && liveErrors.email) || ' '}
							sx={inputSx}
							slotProps={{
								input: {
									startAdornment: (
										<InputAdornment position="start">
											<EmailOutlinedIcon sx={{ fontSize: tokens.iconSize.lg, color: tokens.ink.subtle }} />
										</InputAdornment>
									),
								},
							}}
						/>
					</Grid2>
					<Grid2 size={{ xs: 12 }}>
						<TextField
							label={t('registration.organizationName')}
							name="organizationName"
							variant="outlined"
							fullWidth
							required
							size="small"
							value={userInfo.organizationName}
							onChange={handleChange}
							onBlur={handleBlur('organizationName')}
							error={Boolean(touched.organizationName && liveErrors.organizationName)}
							helperText={(touched.organizationName && liveErrors.organizationName) || ' '}
							sx={inputSx}
							slotProps={{
								input: {
									startAdornment: (
										<InputAdornment position="start">
											<BusinessOutlinedIcon sx={{ fontSize: tokens.iconSize.lg, color: tokens.ink.subtle }} />
										</InputAdornment>
									),
								},
							}}
						/>
					</Grid2>
					<Grid2 size={{ xs: 12 }}>
						<TextField
							select
							label={t('registration.recruitmentType')}
							name="recruitmentType"
							variant="outlined"
							fullWidth
							required
							size="small"
							value={userInfo.recruitmentType}
							onChange={handleChange}
							onBlur={handleBlur('recruitmentType')}
							error={Boolean(touched.recruitmentType && liveErrors.recruitmentType)}
							helperText={(touched.recruitmentType && liveErrors.recruitmentType) || ' '}
							sx={inputSx}
							slotProps={{
								input: {
									startAdornment: (
										<InputAdornment position="start">
											<WorkOutlineOutlinedIcon sx={{ fontSize: tokens.iconSize.lg, color: tokens.ink.subtle }} />
										</InputAdornment>
									),
								},
							}}
						>
							{RECRUITMENT_TYPES.map((value) => (
								<MenuItem key={value} value={value}>
									{t(`recruitment.${value}`)}
								</MenuItem>
							))}
						</TextField>
					</Grid2>
					<Grid2 size={{ xs: 12 }}>
						<TextField
							select
							label={t('registration.organizationSize')}
							name="organizationSize"
							variant="outlined"
							fullWidth
							required
							size="small"
							value={userInfo.organizationSize}
							onChange={handleChange}
							onBlur={handleBlur('organizationSize')}
							error={Boolean(touched.organizationSize && liveErrors.organizationSize)}
							helperText={(touched.organizationSize && liveErrors.organizationSize) || ' '}
							sx={{ ...inputSx, mb: 0 }}
							slotProps={{
								input: {
									startAdornment: (
										<InputAdornment position="start">
											<GroupsOutlinedIcon sx={{ fontSize: tokens.iconSize.lg, color: tokens.ink.subtle }} />
										</InputAdornment>
									),
								},
							}}
						>
							{ORGANIZATION_SIZES.map((size) => (
								<MenuItem key={size} value={size}>
									{t('registration.orgSizeEmployees', '{{size}} employees', { size })}
								</MenuItem>
							))}
						</TextField>
					</Grid2>
				</Grid2>

				<Button
					type="submit"
					fullWidth
					variant="contained"
					disabled={status !== 'idle'}
					sx={{
						mt: 2,
						py: 1.3,
						borderRadius: 1.5,
						fontWeight: 600,
						fontSize: tokens.fontSize.body,
						textTransform: 'none',
						letterSpacing: 0,
						backgroundColor: tokens.brand.main,
						boxShadow: `0 2px 8px ${alpha(tokens.brand.main, 0.35)}`,
						transition: 'background-color 0.2s, box-shadow 0.2s, transform 0.1s',
						'&:hover': {
							backgroundColor: tokens.brand.hoverAlt,
							boxShadow: `0 4px 14px ${alpha(tokens.brand.main, 0.45)}`,
							transform: 'translateY(-1px)',
						},
						'&:active': { transform: 'translateY(0)' },
						'&.Mui-disabled': status === 'success'
							? { backgroundColor: tokens.status.success.tint, color: tokens.status.success.text, boxShadow: 'none' }
							: { backgroundColor: tokens.brand.soft, color: 'rgba(255,255,255,0.9)', boxShadow: 'none' },
					}}
				>
					{status === 'loading' && (
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
							<CircularProgress size={16} sx={{ color: 'rgba(255,255,255,0.9)' }} />
							{t(PROGRESS_STEPS[progressStep].key, PROGRESS_STEPS[progressStep].fallback)}
						</Box>
					)}
					{status === 'success' && (
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
							<CheckCircleRoundedIcon sx={{ fontSize: tokens.iconSize.lg, color: tokens.status.success.main }} />
							{t('registration.progress.done', 'Account created!')}
						</Box>
					)}
					{status === 'idle' && t('registration.createFreeAccount', 'Create free account')}
				</Button>
			</Box>

			<Divider sx={{ my: 2.5, borderColor: tokens.line.main }} />

			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
				<Typography sx={{ color: tokens.ink.muted, fontSize: tokens.fontSize.body2 }}>
					{t('registration.alreadyHaveAccount')}
					{' '}
					<Typography
						component="span"
						onClick={() => navigate('/login')}
						sx={{
							color: tokens.brand.text,
							fontSize: tokens.fontSize.body2,
							fontWeight: 600,
							cursor: 'pointer',
							'&:hover': { textDecoration: 'underline' },
						}}
					>
						{t('registration.signIn')}
					</Typography>
				</Typography>
			</Box>
		</Grid2>
		</>
	);
};

RegisterFormPanel.propTypes = {
	accountExists: PropTypes.any,
	formError: PropTypes.any,
	handleBlur: PropTypes.func,
	handleChange: PropTypes.func,
	handleSubmit: PropTypes.func,
	liveErrors: PropTypes.any,
	navigate: PropTypes.any,
	progressStep: PropTypes.any,
	status: PropTypes.any,
	touched: PropTypes.any,
	userInfo: PropTypes.any,
};

export default RegisterFormPanel;
