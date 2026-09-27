import PropTypes from 'prop-types';
import ConfirmDialog from '../../../../shared/ui/ConfirmDialog.jsx';
import { Box, Typography, CircularProgress, DialogContentText } from '@mui/material';
import { useTranslation } from 'react-i18next';
import * as tokens from '../../../../theme/tokens.js';

/** Clears the whole library: preflight counts, and DELETE must be typed first. */
const ClearLibraryDialog = ({ clearConfirmText, clearDialogOpen, clearPreflight, clearing, handleClearLibrary, setClearConfirmText, setClearDialogOpen }) => {
	const { t } = useTranslation();
	return (
		<>
		<ConfirmDialog
			open={clearDialogOpen}
			title={t('appCVContent.clearLibrary.title', 'Clear the whole resume library?')}
			cancelLabel={t('appCVContent.cancel')}
			confirmLabel={t('appCVContent.clearLibrary.confirm', 'Clear library')}
			onCancel={() => setClearDialogOpen(false)}
			onConfirm={handleClearLibrary}
			busy={clearing}
			confirmDisabled={clearConfirmText !== 'DELETE' || !clearPreflight}
			tone="danger"
			maxWidth="xs"
			fullWidth
		>
			<DialogContentText component="div" sx={{ fontSize: tokens.fontSize.body2, color: tokens.ink.body }}>
				{clearPreflight ? (
					t('appCVContent.clearLibrary.summary',
						'This permanently deletes {{cvs}} resumes, {{reports}} matching reports and {{chats}} AI chats — including their stored documents. Job posts and usage history are kept. This cannot be undone.',
						{ cvs: clearPreflight.cvs, reports: clearPreflight.reports, chats: clearPreflight.chats })
				) : (
					<Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
						<CircularProgress size={18} sx={{ color: tokens.status.error.main }} />
					</Box>
				)}
			</DialogContentText>
			<Typography sx={{ fontSize: tokens.fontSize.small, color: tokens.ink.muted, mt: 2, mb: 0.75 }}>
				{t('appCVContent.clearLibrary.typeToConfirm', 'Type DELETE to confirm.')}
			</Typography>
			<input
				value={clearConfirmText}
				onChange={(e) => setClearConfirmText(e.target.value)}
				disabled={clearing}
				autoFocus
				style={{
					width: '100%', boxSizing: 'border-box', padding: '8px 10px',
					border: `1px solid ${tokens.line.main}`, borderRadius: 8, fontSize: tokens.fontSize.body,
					letterSpacing: '0.08em', fontFamily: 'inherit',
				}}
			/>

		</ConfirmDialog>
		</>
	);
};

ClearLibraryDialog.propTypes = {
	clearConfirmText: PropTypes.any,
	clearDialogOpen: PropTypes.any,
	clearPreflight: PropTypes.any,
	clearing: PropTypes.any,
	handleClearLibrary: PropTypes.func,
	setClearConfirmText: PropTypes.func,
	setClearDialogOpen: PropTypes.func,
};

export default ClearLibraryDialog;
