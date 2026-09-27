import { IconButton } from '@mui/material';
import PropTypes from 'prop-types';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import * as tokens from '../../../../theme/tokens.js';

// The edit pencil on a resume section header.
const EditSectionButton = ({ onClick }) => (onClick ? (
	<IconButton size="small" onClick={onClick} sx={{ p: 0.25, color: 'ink.subtle', '&:hover': { color: 'brand.main' } }}>
		<EditOutlinedIcon sx={{ fontSize: tokens.iconSize.sm }} />
	</IconButton>
) : null);

EditSectionButton.propTypes = { onClick: PropTypes.func };

export default EditSectionButton;
