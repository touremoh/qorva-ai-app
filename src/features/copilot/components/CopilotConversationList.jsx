import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useTranslation } from 'react-i18next';
import { alpha } from '@mui/material/styles';
import * as tokens from '../../../theme/tokens.js';
import RunStatusChip from './RunStatusChip.jsx';
import { ACTIVE_STATUSES } from '../model/agentRun.js';

const CopilotConversationList = ({ conversations, activeConvId, onSelect, onNew, onDelete, loading }) => {
	const { t } = useTranslation();
	return (
		<>
			<Box sx={{ p: 1.5, borderBottom: `1px solid ${tokens.line.main}` }}>
				<Button fullWidth variant="outlined" startIcon={<AddIcon />} onClick={onNew} data-testid="copilot-new-conversation"
					sx={{ fontSize: tokens.fontSize.caption, textTransform: 'none', fontWeight: 600 }}>
					{t('copilot.conversations.new')}
				</Button>
			</Box>
			<Box sx={{ flex: 1, overflowY: 'auto' }}>
				{loading && (
					<Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
						<CircularProgress size={20} sx={{ color: tokens.brand.text }} />
					</Box>
				)}
				{!loading && conversations.length === 0 && (
					<Typography sx={{ fontSize: tokens.fontSize.caption, color: tokens.ink.subtle, p: 2, textAlign: 'center' }}>
						{t('copilot.conversations.empty')}
					</Typography>
				)}
				<List dense disablePadding>
					{conversations.map((c) => {
						const active = c.conversationId === activeConvId;
						const busy = ACTIVE_STATUSES.includes(c.lastStatus);
						return (
							<ListItemButton
								key={c.conversationId}
								selected={active}
								onClick={() => onSelect(c.conversationId)}
								data-testid="copilot-conversation"
								sx={{
									alignItems: 'flex-start',
									gap: 1,
									px: 1.5,
									py: 1,
									borderBottom: `1px solid ${tokens.line.main}`,
									'&.Mui-selected': { backgroundColor: alpha(tokens.brand.main, 0.08) },
									'&:hover .copilot-delete': { opacity: 1 },
								}}
							>
								<Box sx={{ flex: 1, minWidth: 0 }}>
									<Typography sx={{
										fontSize: tokens.fontSize.caption,
										fontWeight: active ? 700 : 600,
										color: tokens.ink.strong,
										whiteSpace: 'nowrap',
										overflow: 'hidden',
										textOverflow: 'ellipsis',
									}}>
										{c.title}
									</Typography>
									{busy && <Box sx={{ mt: 0.5 }}><RunStatusChip status={c.lastStatus} /></Box>}
								</Box>
								{!busy && (
									<Tooltip title={t('copilot.conversations.delete')}>
										<IconButton
											className="copilot-delete"
											size="small"
											aria-label={t('copilot.conversations.delete')}
											onClick={(e) => { e.stopPropagation(); onDelete(c); }}
											sx={{ opacity: { xs: 1, md: 0 }, p: 0.25 }}
										>
											<DeleteOutlineIcon sx={{ fontSize: tokens.iconSize.sm }} />
										</IconButton>
									</Tooltip>
								)}
							</ListItemButton>
						);
					})}
				</List>
			</Box>
		</>
	);
};

CopilotConversationList.propTypes = {
	conversations: PropTypes.arrayOf(PropTypes.shape({
		conversationId: PropTypes.string,
		title: PropTypes.string,
		lastStatus: PropTypes.string,
	})).isRequired,
	activeConvId: PropTypes.string,
	onSelect: PropTypes.func.isRequired,
	onNew: PropTypes.func.isRequired,
	onDelete: PropTypes.func.isRequired,
	loading: PropTypes.bool,
};

export default CopilotConversationList;
