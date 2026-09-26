import { useEffect, useState } from 'react';
import ConfirmDialog from '../../../shared/ui/ConfirmDialog.jsx';
import {
	Box,
	Button,
	Typography,
} from '@mui/material';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import { useTranslation } from 'react-i18next';
import { getUsers, createUser, updateUserAuthorities, deleteUser } from '../api/userService.js';
import { toastError } from '../../../utils/errorHandler.js';
import { USER_EMAIL } from '../../../constants.js';
import { isDemoUser } from '../../../utils/demoMode.js';
import UpgradeButton from '../../../components/demo/UpgradeButton.jsx';
import { emptyPerms, fullPerms, permsFromAuthorities, getRoleFromAuthorities, permsToAuthorities } from '../model/users.js';
import EditPermissionsDialog from './users/EditPermissionsDialog.jsx';
import AddUserDialog from './users/AddUserDialog.jsx';
import UsersTable from './users/UsersTable.jsx';
import { brandPillButtonSx } from '../../../shared/ui/buttonSx.js';
import * as tokens from '../../../theme/tokens.js';

const AccountUsersTab = () => {
	const { t } = useTranslation();
	const demo = isDemoUser();
	const [users, setUsers] = useState([]);
	const [loadingUsers, setLoadingUsers] = useState(false);

	const [openAdd, setOpenAdd] = useState(false);
	const [addForm, setAddForm] = useState({ email: '', firstName: '', lastName: '' });
	const [addRole, setAddRole] = useState('ACCOUNT_MANAGER');
	const [addPerms, setAddPerms] = useState(fullPerms());
	const [saving, setSaving] = useState(false);

	const [editUser, setEditUser] = useState(null);
	const [editPerms, setEditPerms] = useState(emptyPerms());
	const [savingEdit, setSavingEdit] = useState(false);

	const [userToDelete, setUserToDelete] = useState(null);
	const [deleting, setDeleting] = useState(false);

	const fetchUsers = async () => {
		try {
			setLoadingUsers(true);
			const resp = await getUsers();
			const raw = resp?.data?.data;
			setUsers(Array.isArray(raw?.content) ? raw.content : []);
		} catch (e) {
			toastError(e);
		} finally {
			setLoadingUsers(false);
		}
	};

	useEffect(() => { fetchUsers(); }, []);

	const handleAddUser = async () => {
		try {
			setSaving(true);
			const resp = await createUser({
				email: addForm.email.trim(),
				firstName: addForm.firstName.trim(),
				lastName: addForm.lastName.trim(),
				authorities: permsToAuthorities(addPerms, addRole),
			});
			setUsers(prev => [...prev, resp.data?.data ?? resp.data]);
			setOpenAdd(false);
			setAddForm({ email: '', firstName: '', lastName: '' });
			setAddRole('ACCOUNT_MANAGER');
			setAddPerms(fullPerms());
		} catch (e) {
			toastError(e);
		} finally {
			setSaving(false);
		}
	};

	const handleSavePermissions = async () => {
		if (!editUser) return;
		try {
			setSavingEdit(true);
			const role = getRoleFromAuthorities(editUser.authorities);
			const authorities = permsToAuthorities(editPerms, role);
			await updateUserAuthorities(editUser.id, authorities);
			setUsers(prev => prev.map(u => u.id === editUser.id ? { ...u, authorities } : u));
			setEditUser(null);
		} catch (e) {
			toastError(e);
		} finally {
			setSavingEdit(false);
		}
	};

	const handleDeleteUser = async () => {
		if (!userToDelete) return;
		try {
			setDeleting(true);
			await deleteUser(userToDelete.id);
			setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
			setUserToDelete(null);
		} catch (e) {
			toastError(e);
		} finally {
			setDeleting(false);
		}
	};

	const openEditPermissions = (user) => {
		setEditUser(user);
		setEditPerms(permsFromAuthorities(user.authorities));
	};

	const currentEmail = localStorage.getItem(USER_EMAIL) || '';
	const userDisplayName = (u) => `${u?.firstName || ''} ${u?.lastName || ''}`.trim() || u?.email || '—';

	return (
		<Box sx={{ maxWidth: 900 }}>
			{/* Header */}
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
				<GroupOutlinedIcon sx={{ fontSize: tokens.iconSize.lg, color: tokens.brand.text }} />
				<Typography sx={{ fontWeight: 600, fontSize: tokens.fontSize.body, color: tokens.ink.strong, flex: 1 }}>
					{t('accountSettings.tabs.users')}
				</Typography>
				{demo ? (
					<UpgradeButton reason="invite-user" variant="contained" size="medium" />
				) : (
					<Button
						variant="contained"
						size="small"
						startIcon={<PersonAddOutlinedIcon sx={{ fontSize: tokens.iconSize.sm }} />}
						onClick={() => setOpenAdd(true)}
						sx={{ ...brandPillButtonSx, px: 1.5, fontSize: tokens.fontSize.small }}
					>
						{t('accountSettings.addUser')}
					</Button>
				)}
			</Box>

			{/* Users table */}
			<UsersTable
				currentEmail={currentEmail}
				demo={demo}
				loadingUsers={loadingUsers}
				openEditPermissions={openEditPermissions}
				setUserToDelete={setUserToDelete}
				userDisplayName={userDisplayName}
				users={users}
			/>

			{/* ── Add User Dialog ── */}
			<AddUserDialog
				addForm={addForm}
				addPerms={addPerms}
				addRole={addRole}
				handleAddUser={handleAddUser}
				openAdd={openAdd}
				saving={saving}
				setAddForm={setAddForm}
				setAddPerms={setAddPerms}
				setAddRole={setAddRole}
				setOpenAdd={setOpenAdd}
			/>

			{/* ── Edit Permissions Dialog ── */}
			<EditPermissionsDialog
				editPerms={editPerms}
				editUser={editUser}
				handleSavePermissions={handleSavePermissions}
				savingEdit={savingEdit}
				setEditPerms={setEditPerms}
				setEditUser={setEditUser}
				userDisplayName={userDisplayName}
			/>

			{/* ── Delete Confirmation Dialog ── */}
			<ConfirmDialog
				open={!!userToDelete}
				title={t('accountSettings.deleteUserTitle')}
				subject={userToDelete && (
					<>
						<Typography sx={{ fontSize: tokens.fontSize.body2, fontWeight: 600, color: 'ink.strong' }}>{userDisplayName(userToDelete)}</Typography>
						<Typography sx={{ fontSize: tokens.fontSize.caption, color: 'ink.muted' }}>{userToDelete.email}</Typography>
					</>
				)}
				cancelLabel={t('accountSettings.cancel')}
				confirmLabel={t('accountSettings.deleteUser')}
				onCancel={() => setUserToDelete(null)}
				onConfirm={handleDeleteUser}
				busy={deleting}
				tone="danger"
				maxWidth="xs"
				fullWidth
			>
				{t('accountSettings.deleteUserMessage')}
			</ConfirmDialog>
		</Box>
	);
};

export default AccountUsersTab;
