import PropTypes from 'prop-types';
import { Menu, MenuItem } from '@mui/material';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import { useTranslation } from 'react-i18next';

/** Per-resume menu: email, unarchive, delete. */
const CvRowMenu = ({ anchorEl, canContact, handleDeleteClick, handleEmailClick, handleMenuClose, menuCVHasEmail, menuCVId, onUnarchive, showArchived }) => {
	const { t } = useTranslation();
	return (
		<>
		<Menu
			anchorEl={anchorEl}
			open={Boolean(anchorEl)}
			onClose={handleMenuClose}
			anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
			transformOrigin={{ vertical: 'top', horizontal: 'right' }}
			PaperProps={{
				sx: {
					borderRadius: 1.5,
					border: '1px solid #e2e8f0',
					boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
					minWidth: 160,
				},
			}}
		>
			{canContact && (
				<MenuItem
					onClick={handleEmailClick}
					disabled={!menuCVHasEmail}
					sx={{ fontSize: '0.84rem', color: '#334155', py: 1, gap: 1 }}
				>
					<MailOutlineIcon sx={{ fontSize: 16, color: '#64748b' }} />
					{menuCVHasEmail ? t('candidateOutreach.emailCandidate') : t('candidateOutreach.noEmailShort')}
				</MenuItem>
			)}
			{showArchived && onUnarchive && (
				<MenuItem
					onClick={() => { onUnarchive(menuCVId); handleMenuClose(); }}
					sx={{ fontSize: '0.84rem', color: '#629C44', py: 1 }}
				>
					{t('appCVContent.unarchive', 'Unarchive')}
				</MenuItem>
			)}
			<MenuItem
				onClick={handleDeleteClick}
				sx={{ fontSize: '0.84rem', color: '#ef4444', py: 1 }}
			>
				{t('appCVContent.deleteCVEntry')}
			</MenuItem>
		</Menu>
		</>
	);
};

CvRowMenu.propTypes = {
	anchorEl: PropTypes.any,
	canContact: PropTypes.bool,
	handleDeleteClick: PropTypes.func,
	handleEmailClick: PropTypes.func,
	handleMenuClose: PropTypes.func,
	menuCVHasEmail: PropTypes.any,
	menuCVId: PropTypes.any,
	onUnarchive: PropTypes.func,
	showArchived: PropTypes.bool,
};

export default CvRowMenu;
