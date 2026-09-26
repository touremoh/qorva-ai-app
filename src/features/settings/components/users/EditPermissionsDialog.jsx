import PropTypes from 'prop-types';
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Typography } from '@mui/material';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import PermissionsEditor from './PermissionsEditor.jsx';
import { DIALOG_PAPER_SX } from '../../model/users.js';
import { useTranslation } from 'react-i18next';
import { brandPillButtonSx } from '../../../../shared/ui/buttonSx.js';
import * as tokens from '../../../../theme/tokens.js';

/** Edits the permissions of one team member. */
const EditPermissionsDialog = ({ editPerms, editUser, handleSavePermissions, savingEdit, setEditPerms, setEditUser, userDisplayName }) => {
	const { t } = useTranslation();
	return (
		<>
		<Dialog open={!!editUser} onClose={() => { if (!savingEdit) setEditUser(null); }} maxWidth="md" fullWidth slotProps={{ paper: DIALOG_PAPER_SX }}>
			<DialogTitle sx={{ pb: 1 }}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
					<ManageAccountsOutlinedIcon sx={{ fontSize: 18, color: tokens.brand.text }} />
					<Typography sx={{ fontWeight: 700, fontSize: '1rem', color: tokens.ink.strong }}>
						{t('accountSettings.managePermissions')}
					</Typography>
					{editUser && (
						<Typography sx={{ fontSize: '0.82rem', color: tokens.ink.muted }}>
							— {userDisplayName(editUser)}
						</Typography>
					)}
				</Box>
			</DialogTitle>
			<Divider sx={{ borderColor: tokens.surface.muted }} />
			<DialogContent sx={{ pt: 2.5 }}>
				<PermissionsEditor perms={editPerms} onChange={(action, val) => setEditPerms(p => ({ ...p, [action]: val }))} t={t} />
			</DialogContent>
			<Divider sx={{ borderColor: tokens.surface.muted }} />
			<DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
				<Button onClick={() => setEditUser(null)} disabled={savingEdit} sx={{ borderRadius: 2, textTransform: 'none', fontSize: '0.82rem', color: tokens.ink.muted }}>
					{t('accountSettings.cancel')}
				</Button>
				<Button variant="contained" onClick={handleSavePermissions} disabled={savingEdit}
					startIcon={savingEdit ? <CircularProgress size={14} color="inherit" /> : null}
					sx={brandPillButtonSx}>
					{t('accountSettings.saveChanges')}
				</Button>
			</DialogActions>
		</Dialog>
		</>
	);
};

EditPermissionsDialog.propTypes = {
	editPerms: PropTypes.any,
	editUser: PropTypes.any,
	handleSavePermissions: PropTypes.func,
	savingEdit: PropTypes.any,
	setEditPerms: PropTypes.func,
	setEditUser: PropTypes.func,
	userDisplayName: PropTypes.any,
};

export default EditPermissionsDialog;
