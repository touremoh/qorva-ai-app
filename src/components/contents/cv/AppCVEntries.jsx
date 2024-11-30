// eslint-disable-next-line no-unused-vars
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
	Box,
	Typography,
	Divider,
	List,
	ListItem,
	ListItemText,
	IconButton,
	Menu,
	MenuItem
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useTranslation } from 'react-i18next';

const AppCVEntries = ({ cvEntries, setSelectedCV, setDeleteDialogOpen }) => {
	const { t } = useTranslation();
	const [anchorEl, setAnchorEl] = useState(null);
	const [selectedCVId, setSelectedCVId] = useState(null);

	const handleMenuOpen = (event, cvId) => {
		setAnchorEl(event.currentTarget);
		setSelectedCVId(cvId);
	};

	const handleMenuClose = () => {
		setAnchorEl(null);
		setSelectedCVId(null);
	};

	const handleUpdateTags = () => {
		// Logic for updating tags
		handleMenuClose();
	};

	const handleDeleteCV = () => {
		setDeleteDialogOpen(true);
		handleMenuClose();
	};

	return (
		<Box sx={{ width: '30%', height: '75vh', backgroundColor: 'white', padding: 2, boxShadow: 1, overflowY: 'scroll' }}>
			<Typography variant="h5" gutterBottom>
				{t('appCVContent.cvListTitle')}
			</Typography>
			<Divider />
			{cvEntries.length === 0 ? (
				<Typography variant="body1">
					{t('appCVContent.noCVEntries')}
				</Typography>
			) : (
				<List>
					{cvEntries.map((cv, index) => (
						<ListItem
							divider={true}
							button
							key={index}
							onClick={() => setSelectedCV(cv)}
							sx={{ cursor: 'pointer' }}
						>
							<ListItemText
								primary={cv.personalInformation.name}
								secondary={`${cv.personalInformation.role} - ${new Date(cv.createdAt).toLocaleDateString()}`}
							/>
							<IconButton edge="end" onClick={(event) => handleMenuOpen(event, cv._id)}>
								<MoreVertIcon />
							</IconButton>
						</ListItem>
					))}
				</List>
			)}
			<Menu
				anchorEl={anchorEl}
				open={Boolean(anchorEl)}
				onClose={handleMenuClose}
				anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
				transformOrigin={{ vertical: 'top', horizontal: 'right' }}
			>
				<MenuItem onClick={handleUpdateTags}>{t('appCVContent.updateTags')}</MenuItem>
				<MenuItem onClick={handleDeleteCV}>{t('appCVContent.deleteCVEntry')}</MenuItem>
			</Menu>
		</Box>
	);
};

AppCVEntries.propTypes = {
	cvEntries: PropTypes.arrayOf(
		PropTypes.shape({
			personalInformation: PropTypes.shape({
				name: PropTypes.string.isRequired,
				role: PropTypes.string.isRequired,
			}).isRequired,
			createdAt: PropTypes.string.isRequired,
			_id: PropTypes.string.isRequired,
		})
	).isRequired,
	setSelectedCV: PropTypes.func.isRequired,
	setDeleteDialogOpen: PropTypes.func.isRequired,
};

export default AppCVEntries;
