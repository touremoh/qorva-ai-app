import { useEffect, useState } from 'react';
import { getInitials } from '../../../shared/lib/text.js';
import {
	Box,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { createPortalSession } from '../api/stripeService.js';
import { updateProfile, updatePassword } from '../api/userService.js';
import { useTranslation } from 'react-i18next';
import {
	TENANT_ID,
	USER_EMAIL,
	USER_FIRST_NAME,
	USER_ID,
	USER_LAST_NAME,
} from '../../../constants.js';
import AccountUsersTab from './AccountUsersTab.jsx';
import AccountCompanyTab from './AccountCompanyTab.jsx';
import AccountIntegrationsTab from './AccountIntegrationsTab.jsx';
import ConnectedMailboxCard from './ConnectedMailboxCard.jsx';
import MfaCard from './MfaCard.jsx';
import { isDemoUser } from '../../../utils/demoMode.js';
import BillingPanel from './BillingPanel.jsx';
import PasswordCard from './profile/PasswordCard.jsx';
import ProfileDetailsCard from './profile/ProfileDetailsCard.jsx';
import ProfileBanner from './profile/ProfileBanner.jsx';
import SettingsNav from './SettingsNav.jsx';
import * as tokens from '../../../theme/tokens.js';
import { storeAccessToken } from '../../../shared/lib/session.js';



const AccountSettings = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const demo = isDemoUser();

	const [activeTab, setActiveTab] = useState('profile');
	const [loadingPortal, setLoadingPortal] = useState(false);
	const [userInfo, setUserInfo] = useState({
		id: '', email: '', firstName: '', lastName: '', tenantId: '',
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
		};
		setUserInfo(info);
		setEditValues({ firstName: info.firstName, lastName: info.lastName });
	}, []);

	const handleOpenBillingPortal = async () => {
		try {
			setLoadingPortal(true);
			const res = await createPortalSession();
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
			await updateProfile(userInfo.id, { firstName: editValues.firstName, lastName: editValues.lastName });
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
			const response = await updatePassword(userInfo.id, {
				currentPassword: pwValues.currentPassword,
				newPassword: pwValues.newPassword,
			});
			// The change ends every other session; this one continues on the token that comes back.
			storeAccessToken(response?.data?.data);
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

	const initials = getInitials([userInfo.firstName, userInfo.lastName], '?');
	const fullName = `${userInfo.firstName} ${userInfo.lastName}`.trim() || '—';

	const PW_FIELDS = [
		{ field: 'currentPassword', labelKey: 'accountSettings.currentPassword', showKey: 'current' },
		{ field: 'newPassword', labelKey: 'accountSettings.newPassword', showKey: 'new' },
		{ field: 'confirmPassword', labelKey: 'accountSettings.confirmPassword', showKey: 'confirm' },
	];

	return (
		<Box sx={{ display: 'flex', width: '100%', height: '100%', overflow: 'hidden', backgroundColor: tokens.surface.subtle }}>

			{/* ── Left navigation ── */}
			<SettingsNav activeTab={activeTab} setActiveTab={setActiveTab} />

			{/* ── Content area ── */}
			<Box sx={{ flex: 1, minWidth: 0, overflowY: 'auto', p: { xs: 2, md: 3 } }}>

				{/* ══ Profile Tab ══ */}
				{activeTab === 'profile' && (
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, maxWidth: 860 }}>

						{/* Banner */}
						<ProfileBanner fullName={fullName} initials={initials} userInfo={userInfo} />

						{/* Profile fields */}
						<ProfileDetailsCard
							demo={demo}
							editMode={editMode}
							editValues={editValues}
							handleCancelEdit={handleCancelEdit}
							handleSaveProfile={handleSaveProfile}
							savingProfile={savingProfile}
							setEditMode={setEditMode}
							setEditValues={setEditValues}
							userInfo={userInfo}
						/>

						{/* Security / password */}
						<PasswordCard
							PW_FIELDS={PW_FIELDS}
							handleCancelPw={handleCancelPw}
							handleSavePassword={handleSavePassword}
							pwError={pwError}
							pwMode={pwMode}
							pwValues={pwValues}
							savingPw={savingPw}
							setPwError={setPwError}
							setPwMode={setPwMode}
							setPwValues={setPwValues}
							setShowPw={setShowPw}
							showPw={showPw}
						/>

						{/* Two-step verification (email code) — personal; hidden for demo users like the mailbox card */}
						{!demo && <MfaCard />}

						{/* Connected mailbox — personal; lets the candidate composer send as this user */}
						{!demo && <ConnectedMailboxCard />}
					</Box>
				)}

				{/* ══ Company Tab ══ */}
				{activeTab === 'company' && <AccountCompanyTab />}

				{/* ══ Users Tab ══ */}
				{activeTab === 'users' && <AccountUsersTab />}

				{/* ══ Integrations Tab ══ */}
				{activeTab === 'integrations' && <AccountIntegrationsTab />}

				{/* ══ Billing Tab ══ */}
				{activeTab === 'billing' && (
					<BillingPanel demo={demo} handleOpenBillingPortal={handleOpenBillingPortal} loadingPortal={loadingPortal} />
				)}
			</Box>
		</Box>
	);
};

export default AccountSettings;
