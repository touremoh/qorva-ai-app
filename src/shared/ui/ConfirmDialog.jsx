import PropTypes from 'prop-types';
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

const CONFIRM_TONES = {
	primary: { backgroundColor: 'brand.main', '&:hover': { backgroundColor: 'brand.hover' } },
	danger: { backgroundColor: 'status.error.main', '&:hover': { backgroundColor: 'status.error.dark' } },
};

/**
 * "Are you sure?" dialog. While `busy`, both buttons are disabled and the dialog cannot be dismissed,
 * so an action in flight is never abandoned half-way. A string message is rendered as dialog text;
 * any other node is rendered as given. `subject` names what the action applies to (a chat, a user),
 * shown in a tinted box under the message.
 */
export default function ConfirmDialog({
	open, title, children, subject, confirmLabel, cancelLabel, onConfirm, onCancel,
	busy = false, tone = 'primary', confirmDisabled = false, maxWidth = 'sm', fullWidth = false,
}) {
	const close = () => { if (!busy) onCancel(); };
	return (
		<Dialog open={open} onClose={close} maxWidth={maxWidth} fullWidth={fullWidth} PaperProps={{ sx: { borderRadius: 2.5 } }}>
			<DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700, fontSize: '0.95rem', color: 'ink.strong' }}>
				{tone === 'danger' && <DeleteOutlineIcon sx={{ fontSize: 18, color: 'status.error.main' }} />}
				{title}
			</DialogTitle>
			<DialogContent>
				{typeof children === 'string'
					? <DialogContentText sx={{ fontSize: '0.88rem', color: 'ink.muted' }}>{children}</DialogContentText>
					: children}
				{subject && (
					<Box sx={{ mt: 1.5, px: 1.5, py: 1, borderRadius: 2, backgroundColor: 'surface.subtle', border: '1px solid', borderColor: 'line.main' }}>
						{subject}
					</Box>
				)}
			</DialogContent>
			<DialogActions sx={{ px: 2, pb: 2, gap: 1 }}>
				<Button onClick={close} disabled={busy} sx={{ textTransform: 'none', color: 'ink.muted', borderRadius: 1.5 }}>
					{cancelLabel}
				</Button>
				<Button
					onClick={onConfirm}
					disabled={busy || confirmDisabled}
					variant="contained"
					sx={{ textTransform: 'none', borderRadius: 1.5, boxShadow: 'none', ...CONFIRM_TONES[tone] }}
				>
					{busy ? <CircularProgress size={16} color="inherit" aria-label="busy" /> : confirmLabel}
				</Button>
			</DialogActions>
		</Dialog>
	);
}

ConfirmDialog.propTypes = {
	open: PropTypes.bool.isRequired,
	title: PropTypes.node.isRequired,
	children: PropTypes.node,
	subject: PropTypes.node,
	confirmLabel: PropTypes.node.isRequired,
	cancelLabel: PropTypes.node.isRequired,
	onConfirm: PropTypes.func.isRequired,
	onCancel: PropTypes.func.isRequired,
	busy: PropTypes.bool,
	tone: PropTypes.oneOf(['primary', 'danger']),
	confirmDisabled: PropTypes.bool,
	maxWidth: PropTypes.oneOf(['xs', 'sm', 'md']),
	fullWidth: PropTypes.bool,
};
