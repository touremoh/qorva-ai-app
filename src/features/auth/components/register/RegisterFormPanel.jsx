import PropTypes from 'prop-types';
import { Grid2, Typography, Button, Box, Alert, MenuItem, Divider } from '@mui/material';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import { RECRUITMENT_TYPES, ORGANIZATION_SIZES } from '../../../../constants.js';
import { fieldSpacingSx } from '../../model/styles.js';
import { useTranslation } from 'react-i18next';
import * as tokens from '../../../../theme/tokens.js';
import RegisterField from './RegisterField.jsx';
import RegisterSubmitButton from './RegisterSubmitButton.jsx';

/** Registration form: company, account and plan steps. */
const RegisterFormPanel = ({ accountExists, formError, handleBlur, handleChange, handleSubmit, liveErrors, navigate, progressStep, status, touched, userInfo }) => {
	const { t } = useTranslation();
	const form = { values: userInfo, touched, errors: liveErrors, onChange: handleChange, onBlur: handleBlur };
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
						<RegisterField name="firstName" label={t('registration.firstName')} Icon={PersonOutlinedIcon} form={form} />
					</Grid2>
					<Grid2 size={{ xs: 12, sm: 6 }}>
						<RegisterField name="lastName" label={t('registration.lastName')} Icon={PersonOutlinedIcon} form={form} />
					</Grid2>
					<Grid2 size={{ xs: 12 }}>
						<RegisterField name="email" type="email" label={t('registration.email')} Icon={EmailOutlinedIcon} form={form} />
					</Grid2>
					<Grid2 size={{ xs: 12 }}>
						<RegisterField name="organizationName" label={t('registration.organizationName')} Icon={BusinessOutlinedIcon} form={form} />
					</Grid2>
					<Grid2 size={{ xs: 12 }}>
						<RegisterField select name="recruitmentType" label={t('registration.recruitmentType')} Icon={WorkOutlineOutlinedIcon} form={form}>
							{RECRUITMENT_TYPES.map((value) => (
								<MenuItem key={value} value={value}>
									{t(`recruitment.${value}`)}
								</MenuItem>
							))}
						</RegisterField>
					</Grid2>
					<Grid2 size={{ xs: 12 }}>
						<RegisterField
							select
							name="organizationSize"
							label={t('registration.organizationSize')}
							Icon={GroupsOutlinedIcon}
							form={form}
							sx={{ ...fieldSpacingSx, mb: 0 }}
						>
							{ORGANIZATION_SIZES.map((size) => (
								<MenuItem key={size} value={size}>
									{t('registration.orgSizeEmployees', '{{size}} employees', { size })}
								</MenuItem>
							))}
						</RegisterField>
					</Grid2>
				</Grid2>

				<RegisterSubmitButton status={status} progressStep={progressStep} />
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
