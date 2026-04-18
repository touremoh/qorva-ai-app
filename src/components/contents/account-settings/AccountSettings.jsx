import React, { useEffect, useState } from 'react';
import {
	Avatar,
	Box,
	CircularProgress,
	Divider,
	Paper,
	Stack,
	Typography,
} from '@mui/material';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import FingerprintOutlinedIcon from '@mui/icons-material/FingerprintOutlined';
import TranslateOutlinedIcon from '@mui/icons-material/TranslateOutlined';
import LanguageSwitcher from '../../../components/languages/LanguageSwitcher.jsx';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../../../axiosConfig.js';
import { useTranslation } from 'react-i18next';
import {
	SUBSCRIPTION_STATUS,
	TENANT_ID,
	USER_EMAIL,
	USER_FIRST_NAME,
	USER_LAST_NAME,
} from '../../../constants.js';
import QorvaChip from '../../commons/QorvaChip.jsx';

const SectionHeader = ({ icon: Icon, label }) => (
	<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, pb: 1, borderBottom: '2px solid #629C44' }}>
		<Icon sx={{ fontSize: 15, color: '#629C44' }} />
		<Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#629C44', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
			{label}
		</Typography>
	</Box>
);

const FieldCard = ({ icon: Icon, label, value }) => (
	<Box sx={{
		p: 1.5, borderRadius: 2,
		backgroundColor: '#f8fafc',
		border: '1px solid #f1f5f9',
		display: 'flex', alignItems: 'flex-start', gap: 1.25,
	}}>
		<Box sx={{
			width: 28, height: 28, borderRadius: 1.25, flexShrink: 0,
			display: 'flex', alignItems: 'center', justifyContent: 'center',
			backgroundColor: '#ffffff', border: '1px solid #e2e8f0',
		}}>
			<Icon sx={{ fontSize: 14, color: '#64748b' }} />
		</Box>
		<Box sx={{ minWidth: 0 }}>
			<Typography sx={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
				{label}
			</Typography>
			<Typography sx={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: 500, mt: 0.25, wordBreak: 'break-all' }}>
				{value || '—'}
			</Typography>
		</Box>
	</Box>
);

const AccountSettings = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();

	const [loadingPortal, setLoadingPortal] = useState(false);
	const [userInfo, setUserInfo] = useState({
		email: '', firstName: '', lastName: '', tenantId: '', subscriptionStatus: '',
	});

	useEffect(() => {
		setUserInfo({
			email: localStorage.getItem(USER_EMAIL) || '',
			firstName: localStorage.getItem(USER_FIRST_NAME) || '',
			lastName: localStorage.getItem(USER_LAST_NAME) || '',
			tenantId: localStorage.getItem(TENANT_ID) || '',
			subscriptionStatus: localStorage.getItem(SUBSCRIPTION_STATUS) || '',
		});
	}, []);

	const handleOpenBillingPortal = async () => {
		try {
			setLoadingPortal(true);
			const endpoint = import.meta.env.VITE_APP_API_PORTAL_SESSION_URL;
			const res = await apiClient.post(endpoint);
			if (res?.data?.url) { window.location.href = res.data.url; return; }
			const fallback = import.meta.env.VITE_STRIPE_TEST_PORTAL_URL;
			if (fallback) window.location.href = fallback;
		} catch (e) {
			console.error('Failed to open billing portal', e);
			navigate('/error', { state: { errorCode: e.response?.status || 500, errorMessage: t('errors.generic.message') } });
		} finally {
			setLoadingPortal(false);
		}
	};

	const initials = `${userInfo.firstName.charAt(0)}${userInfo.lastName.charAt(0)}`.toUpperCase() || '?';
	const fullName = `${userInfo.firstName} ${userInfo.lastName}`.trim() || '—';

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', overflow: 'hidden', backgroundColor: '#f8fafc' }}>
			<Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, md: 3 }, display: 'flex', flexDirection: 'column', gap: 2.5 }}>

				{/* ── Profile banner ── */}
				<Paper elevation={0} sx={{
					border: '1px solid #e2e8f0', borderRadius: 2.5, overflow: 'hidden',
				}}>
					{/* Green top strip */}
					<Box sx={{ height: 6, background: 'linear-gradient(90deg, #629C44 0%, #8dc96b 100%)' }} />

					<Box sx={{
						px: { xs: 2, md: 3 }, py: 2.5,
						display: 'flex', alignItems: 'center', gap: 2,
						flexWrap: 'wrap',
					}}>
						<Avatar sx={{
							width: 60, height: 60, fontSize: '1.15rem', fontWeight: 700,
							backgroundColor: '#629C44', color: '#fff', flexShrink: 0,
							boxShadow: '0 0 0 3px #ffffff, 0 0 0 5px rgba(98,156,68,0.25)',
						}}>
							{initials}
						</Avatar>

						<Box sx={{ flex: 1, minWidth: 0 }}>
							<Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#0f172a', lineHeight: 1.3 }}>
								{fullName}
							</Typography>
							<Typography sx={{ fontSize: '0.8rem', color: '#64748b', mt: 0.25 }}>
								{userInfo.email || '—'}
							</Typography>
						</Box>

						<Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
							<QorvaChip statusCode={userInfo.subscriptionStatus} />
							<Divider orientation="vertical" flexItem sx={{ borderColor: '#e2e8f0' }} />
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
								<TranslateOutlinedIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
								<LanguageSwitcher />
							</Box>
						</Box>
					</Box>
				</Paper>

				{/* ── Main content grid ── */}
				<Box sx={{
					display: 'grid',
					gridTemplateColumns: { xs: '1fr', lg: '1fr 320px' },
					gap: 2.5,
					alignItems: 'stretch',
				}}>

					{/* Left: Profile information */}
					<Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2.5, p: 2.5 }}>
						<SectionHeader icon={PersonOutlineOutlinedIcon} label={t('accountSettings.profileInformation')} />

						{/* Fields in responsive 2-column grid */}
						<Box sx={{
							display: 'grid',
							gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
							gap: 1.5,
						}}>
							<FieldCard icon={BadgeOutlinedIcon} label={t('accountSettings.firstName')} value={userInfo.firstName} />
							<FieldCard icon={BadgeOutlinedIcon} label={t('accountSettings.lastName')} value={userInfo.lastName} />
							<FieldCard icon={EmailOutlinedIcon} label={t('accountSettings.email')} value={userInfo.email} />
							<FieldCard icon={FingerprintOutlinedIcon} label={t('accountSettings.tenantId')} value={userInfo.tenantId} />
						</Box>

						<Box sx={{
							mt: 1.5, p: 1.5, borderRadius: 2,
							backgroundColor: '#f8fafc', border: '1px solid #f1f5f9',
							display: 'flex', alignItems: 'center', gap: 1.5,
						}}>
							<Box sx={{
								width: 28, height: 28, borderRadius: 1.25, flexShrink: 0,
								display: 'flex', alignItems: 'center', justifyContent: 'center',
								backgroundColor: '#ffffff', border: '1px solid #e2e8f0',
							}}>
								<PersonOutlineOutlinedIcon sx={{ fontSize: 14, color: '#64748b' }} />
							</Box>
							<Box sx={{ flex: 1, minWidth: 0 }}>
								<Typography sx={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
									{t('accountSettings.subscriptionStatus')}
								</Typography>
								<Box sx={{ mt: 0.25 }}>
									<QorvaChip statusCode={userInfo.subscriptionStatus} />
								</Box>
							</Box>
						</Box>
					</Paper>

					{/* Right column: Billing + hint */}
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minHeight: 0 }}>

						{/* Billing portal */}
						<Paper
							elevation={0}
							onClick={handleOpenBillingPortal}
							role="button"
							tabIndex={0}
							onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleOpenBillingPortal(); }}
							sx={{
								border: '1px solid #e2e8f0',
								borderTop: '3px solid #629C44',
								borderRadius: 2.5, p: 2.5,
								flex: 1,
								cursor: loadingPortal ? 'default' : 'pointer',
								transition: 'box-shadow 0.15s ease, background-color 0.15s ease',
								'&:hover': { boxShadow: '0 6px 20px rgba(0,0,0,0.08)', backgroundColor: '#fafcfa' },
								'&:active': { transform: 'scale(0.998)' },
								display: 'flex', flexDirection: 'column', gap: 1.5,
							}}
						>
							<SectionHeader icon={CreditCardOutlinedIcon} label={t('accountSettings.manageBilling')} />
							{loadingPortal ? (
								<Stack alignItems="center" spacing={1} sx={{ py: 2 }}>
									<CircularProgress size={22} sx={{ color: '#629C44' }} />
									<Typography sx={{ fontSize: '0.78rem', color: '#64748b' }}>
										{t('accountSettings.openingBillingPortal', 'Opening billing portal…')}
									</Typography>
								</Stack>
							) : (
								<>
									<Typography sx={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.65 }}>
										{t('accountSettings.manageBillingHint')}
									</Typography>
									<Box sx={{
										display: 'flex', alignItems: 'center', gap: 0.75,
										pt: 1.5, mt: 0.5, borderTop: '1px solid #f1f5f9',
									}}>
										<OpenInNewOutlinedIcon sx={{ fontSize: 14, color: '#629C44' }} />
										<Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: '#629C44' }}>
											{t('accountSettings.manageBillingLink')}
										</Typography>
									</Box>
								</>
							)}
						</Paper>

						{/* Footer hint */}
						<Typography sx={{ fontSize: '0.72rem', color: '#94a3b8', lineHeight: 1.6, px: 0.5 }}>
							{t('accountSettings.footerHint')}
						</Typography>
					</Box>
				</Box>
			</Box>
		</Box>
	);
};

export default AccountSettings;
