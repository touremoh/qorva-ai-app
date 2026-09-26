import PropTypes from 'prop-types';
import { Menu, MenuItem } from '@mui/material';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { useTranslation } from 'react-i18next';

/** Per-report menu (delete). */
const ReportRowMenu = ({ anchorEl, handleDeleteClick, handleMenuClose }) => {
	const { t } = useTranslation();
	return (
		<>
		<Menu
			anchorEl={anchorEl}
			open={Boolean(anchorEl)}
			onClose={handleMenuClose}
			anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
			transformOrigin={{ vertical: 'top', horizontal: 'right' }}
			slotProps={{
				paper: {
					elevation: 0,
					sx: { mt: 0.5, minWidth: 160, borderRadius: 2, border: '1px solid #e2e8f0', boxShadow: '0 8px 24px rgba(0,0,0,0.10)' },
				},
			}}
		>
			<MenuItem
				onClick={handleDeleteClick}
				sx={{ fontSize: '0.82rem', color: '#ef4444', gap: 1, '&:hover': { backgroundColor: '#fff5f5' } }}
			>
				<DeleteOutlineOutlinedIcon sx={{ fontSize: 16, color: '#ef4444' }} />
				{t('appReportContent.deleteReport')}
			</MenuItem>
		</Menu>
		</>
	);
};

ReportRowMenu.propTypes = {
	anchorEl: PropTypes.any,
	handleDeleteClick: PropTypes.func,
	handleMenuClose: PropTypes.func,
};

export default ReportRowMenu;
