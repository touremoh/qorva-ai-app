import PropTypes from 'prop-types';
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, MenuItem, Select, TextField, Typography } from '@mui/material';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import PermissionsEditor from './PermissionsEditor.jsx';
import { DIALOG_PAPER_SX } from '../../model/users.js';
import { useTranslation } from 'react-i18next';
import { brandPillButtonSx } from '../../../../shared/ui/buttonSx.js';

/** Invites a team member with a role and permissions. */
const AddUserDialog = ({ addForm, addPerms, addRole, handleAddUser, openAdd, saving, setAddForm, setAddPerms, setAddRole, setOpenAdd }) => {
	const { t } = useTranslation();
	return (
		<>
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
					sx={brandPillButtonSx}>
					{t('accountSettings.addUser')}
				</Button>
			</DialogActions>
		</Dialog>
		</>
	);
};

AddUserDialog.propTypes = {
	addForm: PropTypes.any,
	addPerms: PropTypes.any,
	addRole: PropTypes.any,
	handleAddUser: PropTypes.func,
	openAdd: PropTypes.func,
	saving: PropTypes.bool,
	setAddForm: PropTypes.func,
	setAddPerms: PropTypes.func,
	setAddRole: PropTypes.func,
	setOpenAdd: PropTypes.func,
};

export default AddUserDialog;
