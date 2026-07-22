import React, { useEffect, useState } from 'react';
import {
	Avatar,
	Box,
	Button,
	Chip,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	IconButton,
	MenuItem,
	Paper,
	Select,
	Switch,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TextField,
	Tooltip,
	Typography,
} from '@mui/material';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import { useTranslation } from 'react-i18next';
import { getUsers, createUser, updateUserAuthorities, deleteUser } from '../../../services/userService.js';
import { toastError } from '../../../utils/errorHandler.js';
import { USER_EMAIL } from '../../../constants.js';
import { isDemoUser } from '../../../utils/demoMode.js';
import UpgradeButton from '../../demo/UpgradeButton.jsx';

const ALL_ACTIONS = [
	'VIEW_DASHBOARD',
	'ADD_CV', 'VIEW_CV', 'MODIFY_CV', 'DELETE_CV',
	'ADD_JOB', 'VIEW_JOB', 'MODIFY_JOB', 'DELETE_JOB',
	'GENERATE_REPORT', 'VIEW_REPORT', 'MODIFY_REPORT', 'DELETE_REPORT',
	'START_CHAT', 'VIEW_CHAT', 'VIEW_MESSAGE', 'REPLY_MESSAGE', 'MODIFY_CHAT', 'DELETE_CHAT',
	'VIEW_USERS', 'MANAGE_USERS',
	'ATS_REPORT_EXPORT',
	'UPDATE_SUBSCRIPTION', 'CANCEL_SUBSCRIPTION',
];

const AUTHORITY_GROUPS = [
	{ key: 'dashboard', actions: ['VIEW_DASHBOARD'] },
	{ key: 'resumes', actions: ['ADD_CV', 'VIEW_CV', 'MODIFY_CV', 'DELETE_CV'] },
	{ key: 'jobPosts', actions: ['ADD_JOB', 'VIEW_JOB', 'MODIFY_JOB', 'DELETE_JOB'] },
	{ key: 'reports', actions: ['GENERATE_REPORT', 'VIEW_REPORT', 'MODIFY_REPORT', 'DELETE_REPORT'] },
	{ key: 'aiChat', actions: ['START_CHAT', 'VIEW_CHAT', 'VIEW_MESSAGE', 'REPLY_MESSAGE', 'MODIFY_CHAT', 'DELETE_CHAT'] },
	{ key: 'users', actions: ['VIEW_USERS', 'MANAGE_USERS'] },
	{ key: 'atsExport', actions: ['ATS_REPORT_EXPORT'] },
	{ key: 'billing', actions: ['UPDATE_SUBSCRIPTION', 'CANCEL_SUBSCRIPTION'] },
];

const emptyPerms = () => Object.fromEntries(ALL_ACTIONS.map(a => [a, false]));
const fullPerms = () => Object.fromEntries(ALL_ACTIONS.map(a => [a, true]));

const permsFromAuthorities = (authorities = []) => {
	const p = emptyPerms();
	(authorities || []).forEach(auth => {
		if (auth.permission === 'ALLOWED' && Object.prototype.hasOwnProperty.call(p, auth.action)) {
			p[auth.action] = true;
		}
	});
	return p;
};

const getRoleFromAuthorities = (authorities = []) =>
	(authorities || []).find(a => a.role)?.role ?? null;

const ROLE_LABELS = {
	ACCOUNT_OWNER: 'Owner',
	ACCOUNT_MANAGER: 'Manager',
};

const permsToAuthorities = (perms, role) =>
	Object.entries(perms)
		.filter(([, v]) => v)
		.map(([action]) => ({ role: role ?? null, action, permission: 'ALLOWED' }));

const SWITCH_SX = {
	'& .MuiSwitch-switchBase.Mui-checked': { color: '#629C44' },
	'& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#629C44' },
};

const PermissionsEditor = ({ perms, onChange, t }) => (
	<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
		{AUTHORITY_GROUPS.map(({ key, actions }) => (
			<Box key={key} sx={{ p: 1.5, borderRadius: 2, border: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
				<Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: '#629C44', textTransform: 'uppercase', letterSpacing: '0.07em', mb: 1 }}>
					{t(`accountSettings.authorityGroups.${key}`)}
				</Typography>
				{actions.map(action => (
					<Box key={action} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 0.25 }}>
						<Typography sx={{ fontSize: '0.78rem', color: '#334155' }}>
							{t(`accountSettings.authorities.${action}`)}
						</Typography>
						<Switch
							size="small"
							checked={perms[action] || false}
							onChange={(e) => onChange(action, e.target.checked)}
							sx={SWITCH_SX}
						/>
					</Box>
				))}
			</Box>
		))}
	</Box>
);

const DIALOG_PAPER_SX = { elevation: 0, sx: { borderRadius: 3, border: '1px solid #e2e8f0' } };
const BTN_GREEN_SX = {
	backgroundColor: '#629C44', borderRadius: 2, textTransform: 'none',
	fontSize: '0.82rem', fontWeight: 600, boxShadow: 'none',
	'&:hover': { backgroundColor: '#4a7a33', boxShadow: 'none' },
};

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

	useEffect(() => { fetchUsers(); /* eslint-disable-next-line */ }, []);

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
				<GroupOutlinedIcon sx={{ fontSize: 20, color: '#629C44' }} />
				<Typography sx={{ fontWeight: 600, fontSize: '0.95rem', color: '#0f172a', flex: 1 }}>
					{t('accountSettings.tabs.users')}
				</Typography>
				{demo ? (
					<UpgradeButton reason="invite-user" variant="contained" size="medium" />
				) : (
					<Button
						variant="contained"
						size="small"
						startIcon={<PersonAddOutlinedIcon sx={{ fontSize: 15 }} />}
						onClick={() => setOpenAdd(true)}
						sx={{ ...BTN_GREEN_SX, px: 1.5, fontSize: '0.78rem' }}
					>
						{t('accountSettings.addUser')}
					</Button>
				)}
			</Box>

			{/* Users table */}
			<Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2.5, overflow: 'hidden' }}>
				{loadingUsers ? (
					<Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
						<CircularProgress size={24} sx={{ color: '#629C44' }} />
					</Box>
				) : users.length === 0 ? (
					<Box sx={{ py: 4, textAlign: 'center' }}>
						<Typography sx={{ fontSize: '0.82rem', color: '#94a3b8' }}>
							{t('accountSettings.noUsers')}
						</Typography>
					</Box>
				) : (
					<TableContainer>
						<Table size="small">
							<TableHead>
								<TableRow sx={{ backgroundColor: '#f8fafc' }}>
									{['tableUser', 'tableEmail', 'tableRole', 'tableActions'].map(key => (
										<TableCell key={key} sx={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #e2e8f0', py: 1 }}>
											{t(`accountSettings.${key}`)}
										</TableCell>
									))}
								</TableRow>
							</TableHead>
							<TableBody>
								{users.map((user) => {
									const isSelf = user.email === currentEmail;
									const role = getRoleFromAuthorities(user.authorities);
									const initials = `${(user.firstName || '')[0] || ''}${(user.lastName || '')[0] || ''}`.toUpperCase() || '?';
									return (
										<TableRow key={user.id} sx={{
											'&:last-child td': { borderBottom: 0 },
											'&:hover': { backgroundColor: isSelf ? 'rgba(98,156,68,0.06)' : '#f8fafc' },
											...(isSelf && { backgroundColor: 'rgba(98,156,68,0.05)' }),
										}}>
											<TableCell sx={{ py: 1.25 }}>
												<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
													<Avatar sx={{ width: 28, height: 28, fontSize: '0.65rem', fontWeight: 700, backgroundColor: isSelf ? 'rgba(98,156,68,0.25)' : 'rgba(98,156,68,0.12)', color: '#629C44' }}>
														{initials}
													</Avatar>
													<Typography sx={{ fontSize: '0.82rem', fontWeight: isSelf ? 700 : 500, color: '#0f172a' }}>
														{userDisplayName(user)}
													</Typography>
													{isSelf && (
														<Chip size="small" label={t('accountSettings.you', 'You')}
															sx={{ fontSize: '0.6rem', height: 16, backgroundColor: 'rgba(98,156,68,0.12)', color: '#629C44', fontWeight: 700, '& .MuiChip-label': { px: 0.75 } }} />
													)}
												</Box>
											</TableCell>
											<TableCell sx={{ fontSize: '0.82rem', color: '#475569', py: 1.25 }}>
												{user.email || '—'}
											</TableCell>
											<TableCell sx={{ py: 1.25 }}>
												<Chip
													size="small"
													label={ROLE_LABELS[role] || t('accountSettings.roleManager', 'Manager')}
													sx={{
														fontSize: '0.68rem', height: 18,
														backgroundColor: role === 'ACCOUNT_OWNER' ? 'rgba(98,156,68,0.12)' : '#f1f5f9',
														color: role === 'ACCOUNT_OWNER' ? '#629C44' : '#475569',
														fontWeight: role === 'ACCOUNT_OWNER' ? 700 : 400,
														'& .MuiChip-label': { px: 0.75 },
													}}
												/>
											</TableCell>
											<TableCell sx={{ py: 1.25 }}>
												<Box sx={{ display: 'flex', gap: 0.5 }}>
													{!demo && (
														<Tooltip title={t('accountSettings.managePermissions')}>
															<IconButton size="small" onClick={() => openEditPermissions(user)} sx={{ color: '#64748b', '&:hover': { color: '#629C44' } }}>
																<ManageAccountsOutlinedIcon sx={{ fontSize: 16 }} />
															</IconButton>
														</Tooltip>
													)}
													{!demo && (
														<Tooltip title={isSelf ? t('accountSettings.cannotDeleteSelf', 'You cannot delete your own account') : t('accountSettings.deleteUser')}>
															<span>
																<IconButton size="small" onClick={() => setUserToDelete(user)} disabled={isSelf}
																	sx={{ color: '#94a3b8', '&:hover': { color: '#ef4444' }, '&.Mui-disabled': { color: '#e2e8f0' } }}>
																	<DeleteOutlineIcon sx={{ fontSize: 16 }} />
																</IconButton>
															</span>
														</Tooltip>
													)}
												</Box>
											</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					</TableContainer>
				)}
			</Paper>

			{/* ── Add User Dialog ── */}
			<Dialog open={openAdd} onClose={() => { if (!saving) { setOpenAdd(false); setAddRole('ACCOUNT_MANAGER'); } }} maxWidth="md" fullWidth slotProps={{ paper: DIALOG_PAPER_SX }}>
				<DialogTitle sx={{ pb: 1 }}>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
						<PersonAddOutlinedIcon sx={{ fontSize: 18, color: '#629C44' }} />
						<Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>{t('accountSettings.addUserTitle')}</Typography>
					</Box>
				</DialogTitle>
				<Divider sx={{ borderColor: '#f1f5f9' }} />
				<DialogContent sx={{ pt: 2.5 }}>
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
						<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
							<TextField size="small" label={t('accountSettings.firstName')} value={addForm.firstName}
								onChange={e => setAddForm(p => ({ ...p, firstName: e.target.value }))}
								sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: '0.85rem' } }} />
							<TextField size="small" label={t('accountSettings.lastName')} value={addForm.lastName}
								onChange={e => setAddForm(p => ({ ...p, lastName: e.target.value }))}
								sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: '0.85rem' } }} />
							<TextField size="small" label={t('accountSettings.email')} value={addForm.email} type="email"
								onChange={e => setAddForm(p => ({ ...p, email: e.target.value }))}
								sx={{ gridColumn: { sm: '1 / -1' }, '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: '0.85rem' } }} />
							<Select size="small" value={addRole} onChange={e => setAddRole(e.target.value)}
								sx={{ gridColumn: { sm: '1 / -1' }, borderRadius: 2, fontSize: '0.85rem' }}>
								<MenuItem value="ACCOUNT_MANAGER" sx={{ fontSize: '0.85rem' }}>
									{t('accountSettings.roleManager', 'Manager')}
								</MenuItem>
								<MenuItem value="ACCOUNT_OWNER" sx={{ fontSize: '0.85rem' }}>
									{t('accountSettings.roleOwner', 'Owner')}
								</MenuItem>
							</Select>
						</Box>
						<Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
							{t('accountSettings.permissions')}
						</Typography>
						<PermissionsEditor perms={addPerms} onChange={(action, val) => setAddPerms(p => ({ ...p, [action]: val }))} t={t} />
					</Box>
				</DialogContent>
				<Divider sx={{ borderColor: '#f1f5f9' }} />
				<DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
					<Button onClick={() => { setOpenAdd(false); setAddRole('ACCOUNT_MANAGER'); }} disabled={saving} sx={{ borderRadius: 2, textTransform: 'none', fontSize: '0.82rem', color: '#64748b' }}>
						{t('accountSettings.cancel')}
					</Button>
					<Button variant="contained" onClick={handleAddUser} disabled={saving || !addForm.email.trim()}
						startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <PersonAddOutlinedIcon sx={{ fontSize: 15 }} />}
						sx={BTN_GREEN_SX}>
						{t('accountSettings.addUser')}
					</Button>
				</DialogActions>
			</Dialog>

			{/* ── Edit Permissions Dialog ── */}
			<Dialog open={!!editUser} onClose={() => { if (!savingEdit) setEditUser(null); }} maxWidth="md" fullWidth slotProps={{ paper: DIALOG_PAPER_SX }}>
				<DialogTitle sx={{ pb: 1 }}>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
						<ManageAccountsOutlinedIcon sx={{ fontSize: 18, color: '#629C44' }} />
						<Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>
							{t('accountSettings.managePermissions')}
						</Typography>
						{editUser && (
							<Typography sx={{ fontSize: '0.82rem', color: '#64748b' }}>
								— {userDisplayName(editUser)}
							</Typography>
						)}
					</Box>
				</DialogTitle>
				<Divider sx={{ borderColor: '#f1f5f9' }} />
				<DialogContent sx={{ pt: 2.5 }}>
					<PermissionsEditor perms={editPerms} onChange={(action, val) => setEditPerms(p => ({ ...p, [action]: val }))} t={t} />
				</DialogContent>
				<Divider sx={{ borderColor: '#f1f5f9' }} />
				<DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
					<Button onClick={() => setEditUser(null)} disabled={savingEdit} sx={{ borderRadius: 2, textTransform: 'none', fontSize: '0.82rem', color: '#64748b' }}>
						{t('accountSettings.cancel')}
					</Button>
					<Button variant="contained" onClick={handleSavePermissions} disabled={savingEdit}
						startIcon={savingEdit ? <CircularProgress size={14} color="inherit" /> : null}
						sx={BTN_GREEN_SX}>
						{t('accountSettings.saveChanges')}
					</Button>
				</DialogActions>
			</Dialog>

			{/* ── Delete Confirmation Dialog ── */}
			<Dialog open={!!userToDelete} onClose={() => { if (!deleting) setUserToDelete(null); }} maxWidth="xs" fullWidth slotProps={{ paper: DIALOG_PAPER_SX }}>
				<DialogTitle sx={{ pb: 1 }}>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
						<DeleteOutlineIcon sx={{ fontSize: 18, color: '#ef4444' }} />
						<Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>{t('accountSettings.deleteUserTitle')}</Typography>
					</Box>
				</DialogTitle>
				<Divider sx={{ borderColor: '#f1f5f9' }} />
				<DialogContent sx={{ pt: 2 }}>
					<Typography sx={{ fontSize: '0.85rem', color: '#475569' }}>
						{t('accountSettings.deleteUserMessage')}
					</Typography>
					{userToDelete && (
						<Box sx={{ mt: 1.5, px: 1.5, py: 1, borderRadius: 2, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
							<Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}>
								{userDisplayName(userToDelete)}
							</Typography>
							<Typography sx={{ fontSize: '0.72rem', color: '#64748b' }}>{userToDelete.email}</Typography>
						</Box>
					)}
				</DialogContent>
				<Divider sx={{ borderColor: '#f1f5f9' }} />
				<DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
					<Button onClick={() => setUserToDelete(null)} disabled={deleting} sx={{ borderRadius: 2, textTransform: 'none', fontSize: '0.82rem', color: '#64748b' }}>
						{t('accountSettings.cancel')}
					</Button>
					<Button variant="contained" onClick={handleDeleteUser} disabled={deleting}
						startIcon={deleting ? <CircularProgress size={14} color="inherit" /> : <DeleteOutlineIcon sx={{ fontSize: 15 }} />}
						sx={{ backgroundColor: '#ef4444', borderRadius: 2, textTransform: 'none', fontSize: '0.82rem', fontWeight: 600, boxShadow: 'none', '&:hover': { backgroundColor: '#dc2626', boxShadow: 'none' } }}>
						{t('accountSettings.deleteUser')}
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export default AccountUsersTab;
