import React, { useEffect, useState } from 'react';
import {
	Avatar,
	Box,
	Button,
	CircularProgress,
	Divider,
	IconButton,
	InputAdornment,
	Paper,
	Stack,
	TextField,
	Tooltip,
	Typography,
} from '@mui/material';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import FingerprintOutlinedIcon from '@mui/icons-material/FingerprintOutlined';
import TranslateOutlinedIcon from '@mui/icons-material/TranslateOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import LanguageSwitcher from '../../../components/languages/LanguageSwitcher.jsx';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../../../axiosConfig.js';
import { useTranslation } from 'react-i18next';
import {
	SUBSCRIPTION_STATUS,
	TENANT_ID,
	USER_EMAIL,
	USER_FIRST_NAME,
	USER_ID,
	USER_LAST_NAME,
} from '../../../constants.js';
import QorvaChip from '../../commons/QorvaChip.jsx';
import AccountUsersTab from './AccountUsersTab.jsx';

const SectionHeader = ({ icon: Icon, label, action }) => (
	<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, pb: 1, borderBottom: '2px solid #629C44' }}>
		<Icon sx={{ fontSize: 15, color: '#629C44' }} />
		<Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#629C44', textTransform: 'uppercase', letterSpacing: '0.07em', flex: 1 }}>
			{label}
		</Typography>
		{action}
	</Box>
);

const FieldCard = ({ icon: Icon, label, value }) => (
	<Box sx={{
		p: 1.5, borderRadius: 2,
		backgroundColor: '#f8fafc', border: '1px solid #f1f5f9',
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

const BTN_GREEN_SX = {
	backgroundColor: '#629C44', borderRadius: 2, textTransform: 'none',
	fontSize: '0.82rem', fontWeight: 600, boxShadow: 'none',
	'&:hover': { backgroundColor: '#4a7a33', boxShadow: 'none' },
};

const NAV_TABS = [
	{ id: 'profile', Icon: PersonOutlineOutlinedIcon, labelKey: 'accountSettings.tabs.profile' },
	{ id: 'users', Icon: GroupOutlinedIcon, labelKey: 'accountSettings.tabs.users' },
	{ id: 'billing', Icon: CreditCardOutlinedIcon, labelKey: 'accountSettings.tabs.billing' },
];

const AccountSettings = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();

	const [activeTab, setActiveTab] = useState('profile');
	const [loadingPortal, setLoadingPortal] = useState(false);
	const [userInfo, setUserInfo] = useState({
		id: '', email: '', firstName: '', lastName: '', tenantId: '', subscriptionStatus: '',
	});

	// Profile edit
	const [editMode, setEditMode] = useState(false);
	const [editValues, setEditValues] = useState({ firstName: '', lastName: '' });
	const [savingProfile, setSavingProfile] = useState(false);

	// Password change
	const [pwMode, setPwMode] = useState(false);
	const [pwValues, setPwValues] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
	const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
	const [savingPw, setSavingPw] = useState(false);
	const [pwError, setPwError] = useState('');

	useEffect(() => {
		const info = {
			id: localStorage.getItem(USER_ID) || '',
			email: localStorage.getItem(USER_EMAIL) || '',
			firstName: localStorage.getItem(USER_FIRST_NAME) || '',
			lastName: localStorage.getItem(USER_LAST_NAME) || '',
			tenantId: localStorage.getItem(TENANT_ID) || '',
			subscriptionStatus: localStorage.getItem(SUBSCRIPTION_STATUS) || '',
		};
		setUserInfo(info);
		setEditValues({ firstName: info.firstName, lastName: info.lastName });
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

	const handleSaveProfile = async () => {
		try {
			setSavingProfile(true);
			const usersUrl = import.meta.env.VITE_APP_API_USERS_URL;
			await apiClient.patch(`${usersUrl}/${userInfo.id}`, { firstName: editValues.firstName, lastName: editValues.lastName });
			const updated = { ...userInfo, firstName: editValues.firstName, lastName: editValues.lastName };
			setUserInfo(updated);
			localStorage.setItem(USER_FIRST_NAME, editValues.firstName);
			localStorage.setItem(USER_LAST_NAME, editValues.lastName);
			setEditMode(false);
		} catch (e) {
			console.error('Failed to update profile', e);
		} finally {
			setSavingProfile(false);
		}
	};

	const handleCancelEdit = () => {
		setEditMode(false);
		setEditValues({ firstName: userInfo.firstName, lastName: userInfo.lastName });
	};

	const handleSavePassword = async () => {
		if (pwValues.newPassword !== pwValues.confirmPassword) {
			setPwError(t('accountSettings.passwordMismatch'));
			return;
		}
		try {
			setSavingPw(true);
			const usersUrl = import.meta.env.VITE_APP_API_USERS_URL;
			await apiClient.patch(`${usersUrl}/${userInfo.id}/password`, {
				currentPassword: pwValues.currentPassword,
				newPassword: pwValues.newPassword,
			});
			setPwMode(false);
			setPwValues({ currentPassword: '', newPassword: '', confirmPassword: '' });
			setPwError('');
		} catch (e) {
			console.error('Failed to update password', e);
			setPwError(t('accountSettings.passwordError'));
		} finally {
			setSavingPw(false);
		}
	};

	const handleCancelPw = () => {
		setPwMode(false);
		setPwValues({ currentPassword: '', newPassword: '', confirmPassword: '' });
		setPwError('');
	};

	const initials = `${userInfo.firstName.charAt(0)}${userInfo.lastName.charAt(0)}`.toUpperCase() || '?';
	const fullName = `${userInfo.firstName} ${userInfo.lastName}`.trim() || '—';

	const PW_FIELDS = [
		{ field: 'currentPassword', labelKey: 'accountSettings.currentPassword', showKey: 'current' },
		{ field: 'newPassword', labelKey: 'accountSettings.newPassword', showKey: 'new' },
		{ field: 'confirmPassword', labelKey: 'accountSettings.confirmPassword', showKey: 'confirm' },
	];

	return (
		<Box sx={{ display: 'flex', width: '100%', height: '100%', overflow: 'hidden', backgroundColor: '#f8fafc' }}>

			{/* ── Left navigation ── */}
			<Box sx={{
				width: 210, flexShrink: 0,
				backgroundColor: '#ffffff',
				borderRight: '1px solid #e2e8f0',
				display: 'flex', flexDirection: 'column',
				pt: 2.5, gap: 0.25,
			}}>
				<Typography sx={{ px: 2, mb: 1, fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
					{t('accountSettings.title')}
				</Typography>
				{NAV_TABS.map(({ id, Icon, labelKey }) => {
					const isActive = activeTab === id;
					return (
						<Box
							key={id}
							onClick={() => setActiveTab(id)}
							sx={{
								mx: 1, display: 'flex', alignItems: 'center', gap: 1.25,
								px: 1.5, py: 1.1, borderRadius: '0 8px 8px 0',
								cursor: 'pointer',
								borderLeft: isActive ? '3px solid #629C44' : '3px solid transparent',
								backgroundColor: isActive ? 'rgba(98,156,68,0.06)' : 'transparent',
								color: isActive ? '#629C44' : '#64748b',
								transition: 'all 0.1s ease',
								'&:hover': {
									backgroundColor: isActive ? 'rgba(98,156,68,0.08)' : '#f8fafc',
									color: isActive ? '#629C44' : '#334155',
								},
							}}
						>
							<Icon sx={{ fontSize: 17 }} />
							<Typography sx={{ fontSize: '0.82rem', fontWeight: isActive ? 600 : 400 }}>
								{t(labelKey)}
							</Typography>
						</Box>
					);
				})}
			</Box>

			{/* ── Content area ── */}
			<Box sx={{ flex: 1, minWidth: 0, overflowY: 'auto', p: { xs: 2, md: 3 } }}>

				{/* ══ Profile Tab ══ */}
				{activeTab === 'profile' && (
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, maxWidth: 860 }}>

						{/* Banner */}
						<Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2.5, overflow: 'hidden' }}>
							<Box sx={{ height: 6, background: 'linear-gradient(90deg, #629C44 0%, #8dc96b 100%)' }} />
							<Box sx={{ px: { xs: 2, md: 3 }, py: 2.5, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
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

						{/* Profile fields */}
						<Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2.5, p: 2.5 }}>
							<SectionHeader
								icon={PersonOutlineOutlinedIcon}
								label={t('accountSettings.profileInformation')}
								action={!editMode && (
									<Tooltip title={t('accountSettings.editProfile')}>
										<IconButton size="small" onClick={() => setEditMode(true)}
											sx={{ color: '#629C44', border: '1px solid rgba(98,156,68,0.3)', borderRadius: 1.5, p: 0.5 }}>
											<EditOutlinedIcon sx={{ fontSize: 14 }} />
										</IconButton>
									</Tooltip>
								)}
							/>
							{editMode ? (
								<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
									<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
										<TextField size="small" label={t('accountSettings.firstName')}
											value={editValues.firstName}
											onChange={e => setEditValues(p => ({ ...p, firstName: e.target.value }))}
											sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: '0.85rem' } }} />
										<TextField size="small" label={t('accountSettings.lastName')}
											value={editValues.lastName}
											onChange={e => setEditValues(p => ({ ...p, lastName: e.target.value }))}
											sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: '0.85rem' } }} />
									</Box>
									<FieldCard icon={EmailOutlinedIcon} label={t('accountSettings.email')} value={userInfo.email} />
									<FieldCard icon={FingerprintOutlinedIcon} label={t('accountSettings.tenantId')} value={userInfo.tenantId} />
									<Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
										<Button size="small" onClick={handleCancelEdit}
											sx={{ borderRadius: 2, textTransform: 'none', fontSize: '0.82rem', color: '#64748b' }}>
											{t('accountSettings.cancel')}
										</Button>
										<Button size="small" variant="contained" onClick={handleSaveProfile}
											disabled={savingProfile || !editValues.firstName.trim()}
											startIcon={savingProfile ? <CircularProgress size={12} color="inherit" /> : null}
											sx={BTN_GREEN_SX}>
											{t('accountSettings.saveChanges')}
										</Button>
									</Box>
								</Box>
							) : (
								<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
									<FieldCard icon={BadgeOutlinedIcon} label={t('accountSettings.firstName')} value={userInfo.firstName} />
									<FieldCard icon={BadgeOutlinedIcon} label={t('accountSettings.lastName')} value={userInfo.lastName} />
									<FieldCard icon={EmailOutlinedIcon} label={t('accountSettings.email')} value={userInfo.email} />
									<FieldCard icon={FingerprintOutlinedIcon} label={t('accountSettings.tenantId')} value={userInfo.tenantId} />
								</Box>
							)}
						</Paper>

						{/* Security / password */}
						<Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2.5, p: 2.5 }}>
							<SectionHeader
								icon={LockOutlinedIcon}
								label={t('accountSettings.security')}
								action={!pwMode && (
									<Button size="small" onClick={() => setPwMode(true)}
										sx={{ borderRadius: 2, textTransform: 'none', fontSize: '0.72rem', color: '#629C44', border: '1px solid rgba(98,156,68,0.3)', py: 0.25, px: 1 }}>
										{t('accountSettings.changePassword')}
									</Button>
								)}
							/>
							{pwMode ? (
								<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
									{pwError && (
										<Typography sx={{ fontSize: '0.78rem', color: '#ef4444' }}>{pwError}</Typography>
									)}
									{PW_FIELDS.map(({ field, labelKey, showKey }) => (
										<TextField
											key={field} size="small" label={t(labelKey)} fullWidth
											type={showPw[showKey] ? 'text' : 'password'}
											value={pwValues[field]}
											onChange={e => { setPwError(''); setPwValues(p => ({ ...p, [field]: e.target.value })); }}
											InputProps={{
												endAdornment: (
													<InputAdornment position="end">
														<IconButton size="small" onClick={() => setShowPw(p => ({ ...p, [showKey]: !p[showKey] }))}>
															{showPw[showKey]
																? <VisibilityOffOutlinedIcon sx={{ fontSize: 16 }} />
																: <VisibilityOutlinedIcon sx={{ fontSize: 16 }} />
															}
														</IconButton>
													</InputAdornment>
												),
											}}
											sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: '0.85rem' } }}
										/>
									))}
									<Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
										<Button size="small" onClick={handleCancelPw}
											sx={{ borderRadius: 2, textTransform: 'none', fontSize: '0.82rem', color: '#64748b' }}>
											{t('accountSettings.cancel')}
										</Button>
										<Button size="small" variant="contained" onClick={handleSavePassword}
											disabled={savingPw || !pwValues.currentPassword || !pwValues.newPassword || !pwValues.confirmPassword}
											startIcon={savingPw ? <CircularProgress size={12} color="inherit" /> : null}
											sx={BTN_GREEN_SX}>
											{t('accountSettings.saveChanges')}
										</Button>
									</Box>
								</Box>
							) : (
								<Typography sx={{ fontSize: '0.82rem', color: '#94a3b8' }}>
									{t('accountSettings.passwordHint')}
								</Typography>
							)}
						</Paper>
					</Box>
				)}

				{/* ══ Users Tab ══ */}
				{activeTab === 'users' && <AccountUsersTab />}

				{/* ══ Billing Tab ══ */}
				{activeTab === 'billing' && (
					<Box sx={{ maxWidth: 480 }}>
						<Paper
							elevation={0}
							onClick={handleOpenBillingPortal}
							role="button" tabIndex={0}
							onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleOpenBillingPortal(); }}
							sx={{
								border: '1px solid #e2e8f0', borderTop: '3px solid #629C44',
								borderRadius: 2.5, p: 2.5,
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
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, pt: 1.5, mt: 0.5, borderTop: '1px solid #f1f5f9' }}>
										<OpenInNewOutlinedIcon sx={{ fontSize: 14, color: '#629C44' }} />
										<Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: '#629C44' }}>
											{t('accountSettings.manageBillingLink')}
										</Typography>
									</Box>
								</>
							)}
						</Paper>
						<Typography sx={{ fontSize: '0.72rem', color: '#94a3b8', lineHeight: 1.6, px: 0.5, mt: 2 }}>
							{t('accountSettings.footerHint')}
						</Typography>
					</Box>
				)}
			</Box>
		</Box>
	);
};

export default AccountSettings;
