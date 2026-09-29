import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';
import * as tokens from '../../../theme/tokens.js';
import AgentRunCard from './AgentRunCard.jsx';

/** A run in full, opened from the Activity table. Someone else's run is read-only apart from Cancel. */
const AgentRunDrawer = ({ open, run, onClose, onCancel }) => {
	const { t } = useTranslation();
	return (
		<Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 520 }, backgroundColor: tokens.surface.subtle } }}>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1.5, backgroundColor: tokens.surface.paper, borderBottom: `1px solid ${tokens.line.main}` }}>
				<Box sx={{ flex: 1, minWidth: 0 }}>
					<Typography sx={{ fontSize: tokens.fontSize.body2, fontWeight: 700, color: tokens.ink.strong, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
						{run?.title || t('copilot.activity.run')}
					</Typography>
					{run?.userEmail && (
						<Typography sx={{ fontSize: tokens.fontSize.micro, color: tokens.ink.faintest }}>{run.userEmail}</Typography>
					)}
				</Box>
				<IconButton size="small" onClick={onClose} aria-label={t('copilot.activity.close')}>
					<CloseIcon sx={{ fontSize: tokens.iconSize.md }} />
				</IconButton>
			</Box>
			<Box sx={{ p: 2, overflowY: 'auto' }} data-testid="copilot-run-drawer">
				{!run ? (
					<Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
						<CircularProgress size={22} sx={{ color: tokens.brand.text }} />
					</Box>
				) : (
					<AgentRunCard run={run} onCancel={onCancel} />
				)}
			</Box>
		</Drawer>
	);
};

AgentRunDrawer.propTypes = {
	open: PropTypes.bool.isRequired,
	run: PropTypes.object,
	onClose: PropTypes.func.isRequired,
	onCancel: PropTypes.func,
};

export default AgentRunDrawer;
