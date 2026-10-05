import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import ConfirmDialog from '../../../shared/ui/ConfirmDialog.jsx';
import CvSidePanel from './CvSidePanel.jsx';
import { useAgentRun } from '../../../contexts/AgentRunContext.jsx';
import useCopilotConversation from '../hooks/useCopilotConversation.js';
import { isActive } from '../model/agentRun.js';
import * as tokens from '../../../theme/tokens.js';
import AgentRunCard from './AgentRunCard.jsx';
import CopilotConversationList from './CopilotConversationList.jsx';
import CopilotEmptyState from './CopilotEmptyState.jsx';
import CopilotInputBar from './CopilotInputBar.jsx';

/** Chat tab: conversations on the left, the active conversation's requests in the middle, a resume on the right. */
const CopilotChat = () => {
	const { t } = useTranslation();
	const { activeRun } = useAgentRun();
	const chat = useCopilotConversation();
	const busy = chat.submitting || chat.loadingHistory || isActive(activeRun);

	return (
		<>
			<Box sx={{ display: 'flex', height: '100%', overflow: 'hidden', backgroundColor: tokens.surface.subtle }}>
				<Box sx={{
					width: 260, flexShrink: 0, borderRight: `1px solid ${tokens.line.main}`, backgroundColor: tokens.surface.paper,
					display: { xs: 'none', md: 'flex' }, flexDirection: 'column', overflow: 'hidden',
				}}>
					<CopilotConversationList
						conversations={chat.conversations}
						activeConvId={chat.activeConvId}
						onSelect={chat.handleSelectConversation}
						onNew={chat.handleNewConversation}
						onDelete={chat.setConversationToDelete}
						loading={chat.listLoading}
					/>
				</Box>

				<Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
					<Box sx={{ flex: 1, overflowY: 'auto', px: { xs: 2, md: 3 }, py: 2 }}>
						<Box sx={{ maxWidth: 820, mx: 'auto', width: '100%' }}>
							{chat.isEmpty && (
								<CopilotEmptyState onPick={(text) => { chat.setGoal(text); chat.setInputFocusToken((n) => n + 1); }} />
							)}
							{chat.loadingHistory && (
								<Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
									<CircularProgress size={22} sx={{ color: tokens.brand.text }} />
								</Box>
							)}
							{!chat.loadingHistory && chat.runs.map((run) => (
								<AgentRunCard key={run.id} run={run} onCancel={chat.handleCancel} onLinkClick={chat.handleLinkClick} onRunUpdate={chat.replaceRun} />
							))}
							<div ref={chat.bottomRef} />
						</Box>
					</Box>

					<CopilotInputBar
						goal={chat.goal}
						setGoal={chat.setGoal}
						mentions={chat.mentions}
						setMentions={chat.setMentions}
						submit={chat.submit}
						disabled={busy}
						focusToken={chat.inputFocusToken}
						error={chat.error}
						focus={chat.focus}
						onClearFocus={chat.clearFocus}
					/>
				</Box>

				<CvSidePanel cvLoading={chat.cvLoading} selectedCV={chat.selectedCV} setSelectedCV={chat.setSelectedCV} />
			</Box>

			<ConfirmDialog
				open={!!chat.conversationToDelete}
				title={t('copilot.deleteConversation.title')}
				subject={chat.conversationToDelete?.title && (
					<Typography sx={{ fontSize: tokens.fontSize.body2, fontWeight: 600, color: 'ink.strong' }}>{chat.conversationToDelete.title}</Typography>
				)}
				cancelLabel={t('copilot.deleteConversation.cancel')}
				confirmLabel={t('copilot.deleteConversation.confirm')}
				onCancel={() => chat.setConversationToDelete(null)}
				onConfirm={chat.handleDeleteConfirm}
				busy={chat.deleting}
				tone="danger"
				maxWidth="xs"
				fullWidth
			>
				{t('copilot.deleteConversation.message')}
			</ConfirmDialog>
		</>
	);
};

export default CopilotChat;
