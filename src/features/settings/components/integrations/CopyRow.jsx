import PropTypes from 'prop-types';
import { Box, IconButton, Typography } from '@mui/material';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';

/** One copyable value (webhook URL or secret) with its label. */
const CopyRow = ({ label, value, onCopy, mask }) => (
	<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
		<Typography sx={{
			fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700,
			textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap',
		}}>
			{label}
		</Typography>
		<Typography sx={{ fontSize: '0.72rem', color: '#475569', flex: 1, minWidth: 0 }} noWrap>
			{mask ? '•'.repeat(24) : value}
		</Typography>
		<IconButton size="small" onClick={onCopy}>
			<ContentCopyOutlinedIcon sx={{ fontSize: 14 }} />
		</IconButton>
	</Box>
);
CopyRow.propTypes = {
	label: PropTypes.node,
	value: PropTypes.string,
	onCopy: PropTypes.func.isRequired,
	mask: PropTypes.bool,
};

export default CopyRow;
