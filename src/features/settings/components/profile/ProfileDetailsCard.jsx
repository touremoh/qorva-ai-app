import PropTypes from 'prop-types';
import FieldTile from '../../../../shared/ui/FieldTile.jsx';
import SectionHeader from '../../../../shared/ui/SectionHeader.jsx';
import { Box, Button, CircularProgress, IconButton, Paper, TextField, Tooltip } from '@mui/material';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { useTranslation } from 'react-i18next';
import { brandPillButtonSx } from '../../../../shared/ui/buttonSx.js';

/** The signed-in user's profile fields, read-only or in edit mode. */
const ProfileDetailsCard = ({ demo, editMode, editValues, handleCancelEdit, handleSaveProfile, savingProfile, setEditMode, setEditValues, userInfo }) => {
	const { t } = useTranslation();
	return (
		<>
		<Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2.5, p: 2.5 }}>
			<SectionHeader
				icon={PersonOutlineOutlinedIcon}
				label={t('accountSettings.profileInformation')}
				action={!demo && !editMode && (
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
					<FieldTile icon={EmailOutlinedIcon} label={t('accountSettings.email')} value={userInfo.email} />
					<Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
						<Button size="small" onClick={handleCancelEdit}
							sx={{ borderRadius: 2, textTransform: 'none', fontSize: '0.82rem', color: '#64748b' }}>
							{t('accountSettings.cancel')}
						</Button>
						<Button size="small" variant="contained" onClick={handleSaveProfile}
							disabled={savingProfile || !editValues.firstName.trim()}
							startIcon={savingProfile ? <CircularProgress size={12} color="inherit" /> : null}
							sx={brandPillButtonSx}>
							{t('accountSettings.saveChanges')}
						</Button>
					</Box>
				</Box>
			) : (
				<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
					<FieldTile icon={BadgeOutlinedIcon} label={t('accountSettings.firstName')} value={userInfo.firstName} />
					<FieldTile icon={BadgeOutlinedIcon} label={t('accountSettings.lastName')} value={userInfo.lastName} />
					<FieldTile icon={EmailOutlinedIcon} label={t('accountSettings.email')} value={userInfo.email} />
				</Box>
			)}
		</Paper>
		</>
	);
};

ProfileDetailsCard.propTypes = {
	demo: PropTypes.bool,
	editMode: PropTypes.bool,
	editValues: PropTypes.any,
	handleCancelEdit: PropTypes.func,
	handleSaveProfile: PropTypes.func,
	savingProfile: PropTypes.any,
	setEditMode: PropTypes.func,
	setEditValues: PropTypes.func,
	userInfo: PropTypes.any,
};

export default ProfileDetailsCard;
