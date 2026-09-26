import PropTypes from 'prop-types';
import { Box, Button, CircularProgress, IconButton, Tooltip } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import UpgradeButton from '../../../../components/demo/UpgradeButton.jsx';
import * as tokens from '../../../../theme/tokens.js';

/** Library toolbar: upload (or upgrade in demo), archived toggle, clear-library. */
const CvToolbar = ({ demo, upload, showArchived, onToggleArchived, onOpenClearLibrary }) => {
	const { t } = useTranslation();
	return (
		<Box sx={{
			display: 'flex',
			alignItems: 'center',
			gap: 1.5,
			py: 1.5,
			backgroundColor: tokens.surface.paper,
			borderBottom: `1px solid ${tokens.line.main}`,
			borderRadius: 2,
			mb: 2,
			px: 2,
		}}>
			{demo ? (
				<UpgradeButton reason="cv-upload" variant="contained" size="medium" />
			) : (
				<Button
					startIcon={upload.isUploading ? <CircularProgress size={16} color="inherit" /> : <FileUploadIcon />}
					variant="contained"
					disabled={upload.isUploading}
					onClick={() => upload.setOpenUploadModal(true)}
					sx={{
						backgroundColor: tokens.brand.main,
						'&:hover': { backgroundColor: tokens.brand.hover },
						borderRadius: 1.5,
						textTransform: 'none',
						fontWeight: 600,
						fontSize: tokens.fontSize.body2,
						boxShadow: 'none',
						px: 2,
						whiteSpace: 'nowrap',
					}}
				>
					{t('appCVContent.uploadCV')}
					<Box component="span" sx={{
						ml: 1, px: 0.75, py: 0.15, display: { xs: 'none', sm: 'inline' },
						backgroundColor: 'rgba(255,255,255,0.22)',
						borderRadius: 0.75,
						fontSize: tokens.fontSize.caption,
						fontWeight: 500,
						letterSpacing: '0.02em',
					}}>
						· up to {upload.bulkLimit}
					</Box>
				</Button>
			)}

			<Tooltip title={t('appCVContent.showArchivedTooltip', 'Show archived resumes')}>
				<Button
					startIcon={<Inventory2OutlinedIcon sx={{ fontSize: tokens.iconSize.md }} />}
					variant="outlined"
					onClick={onToggleArchived}
					sx={{
						borderColor: showArchived ? `${tokens.brand.main}` : `${tokens.line.main}`,
						color: showArchived ? `${tokens.brand.main}` : `${tokens.ink.muted}`,
						backgroundColor: showArchived ? alpha(tokens.brand.main, 0.06) : 'transparent',
						'&:hover': { borderColor: tokens.brand.main, color: tokens.brand.text, backgroundColor: alpha(tokens.brand.main, 0.04) },
						borderRadius: 1.5,
						textTransform: 'none',
						fontWeight: 600,
						fontSize: tokens.fontSize.body2,
						boxShadow: 'none',
						px: 1.5,
					}}
				>
					{t('appCVContent.archived', 'Archived')}
				</Button>
			</Tooltip>

			{!demo && (
				<Tooltip title={t('appCVContent.clearLibrary.tooltip', 'Clear the whole library…')}>
					<IconButton
						size="small"
						onClick={onOpenClearLibrary}
						sx={{
							borderRadius: 1.5,
							color: tokens.ink.subtle,
							'&:hover': { color: tokens.status.error.main, backgroundColor: 'rgba(220,38,38,0.06)' },
						}}
					>
						<DeleteForeverOutlinedIcon sx={{ fontSize: tokens.iconSize.lg }} />
					</IconButton>
				</Tooltip>
			)}

			<Box sx={{ flexGrow: 1 }} />
		</Box>
	);
};

CvToolbar.propTypes = {
	demo: PropTypes.bool.isRequired,
	upload: PropTypes.shape({
		isUploading: PropTypes.bool,
		bulkLimit: PropTypes.number,
		setOpenUploadModal: PropTypes.func,
	}).isRequired,
	showArchived: PropTypes.bool.isRequired,
	onToggleArchived: PropTypes.func.isRequired,
	onOpenClearLibrary: PropTypes.func.isRequired,
};

export default CvToolbar;
