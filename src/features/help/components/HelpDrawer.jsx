import { useEffect, useRef, useState } from 'react';
import { Alert, Box, Button, Drawer, IconButton, Tooltip, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddCommentOutlinedIcon from '@mui/icons-material/AddCommentOutlined';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useHelpPanel } from '../hooks/HelpContext.jsx';
import { useHelpConversation } from '../hooks/useHelpConversation.js';
import { pageKeyFor, startersFor } from '../model/helpLinks.js';
import { useAgentRun } from '../../../contexts/AgentRunContext.jsx';
import HelpEmptyState from './HelpEmptyState.jsx';
import HelpAnswer from './HelpAnswer.jsx';
import HelpComposer from './HelpComposer.jsx';
import SupportTicketDialog from './SupportTicketDialog.jsx';
import * as tokens from '../../../theme/tokens.js';

export const HELP_DRAWER_WIDTH = 420;

/** Qorva Help: product questions answered in the UI language, and a way to reach support. */
const HelpDrawer = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { pathname, search } = useLocation();
	const { enabled, open, openTicket, closeHelp, ticketOpened } = useHelpPanel();
	const { availability } = useAgentRun();
	const { conversationId, messages, pending, error, ask, reset } = useHelpConversation();
	const [ticketOpen, setTicketOpen] = useState(false);
	const endRef = useRef(null);
	const page = pageKeyFor(pathname, search);

	useEffect(() => {
		if (open && openTicket) {
			setTicketOpen(true);
			ticketOpened();
		}
	}, [open, openTicket, ticketOpened]);

	useEffect(() => {
		endRef.current?.scrollIntoView?.({ block: 'end' });
	}, [messages.length, pending]);

	if (!enabled) return null;

	const askHere = (text) => ask(text, page);
	const firstQuestion = messages.find((m) => m.role === 'user')?.text;

	return (
		<>
			<Drawer
				anchor="right"
				variant="persistent"
				open={open}
				PaperProps={{
					'data-testid': 'help-drawer',
					role: 'complementary',
					'aria-label': t('help.title'),
					sx: {
						width: { xs: '100%', sm: HELP_DRAWER_WIDTH }, borderLeft: `1px solid ${tokens.line.main}`,
						boxShadow: '-8px 0 24px rgba(15,23,42,0.08)', display: 'flex', flexDirection: 'column',
					},
				}}
			>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1.5, borderBottom: `1px solid ${tokens.line.main}` }}>
					<Typography component="h2" sx={{ flex: 1, fontSize: tokens.fontSize.body, fontWeight: 700, color: tokens.ink.heading }}>
						{t('help.title')}
					</Typography>
					<Tooltip title={t('help.newConversation')}>
						<span>
							<IconButton size="small" aria-label={t('help.newConversation')} onClick={reset} disabled={pending || messages.length === 0}>
								<AddCommentOutlinedIcon sx={{ fontSize: tokens.iconSize.lg }} />
							</IconButton>
						</span>
					</Tooltip>
					<IconButton size="small" aria-label={t('help.close')} onClick={closeHelp} data-testid="help-close">
						<CloseIcon sx={{ fontSize: tokens.iconSize.lg }} />
					</IconButton>
				</Box>

				<Box sx={{ flex: 1, overflowY: 'auto' }} aria-live="polite">
					{messages.length === 0 ? (
						<HelpEmptyState starters={startersFor(page, { rulesEnabled: !!availability?.rulesEnabled })} onAsk={askHere} />
					) : (
						<Box sx={{ px: 2.5, py: 2 }}>
							{messages.map((m, i) => (m.role === 'user' ? (
								<Box key={i} sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1.5 }}>
									<Typography sx={{
										maxWidth: '85%', px: 1.5, py: 1, borderRadius: 2, backgroundColor: tokens.brand.tint,
										fontSize: tokens.fontSize.small, color: tokens.ink.strong, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
									}}>
										{m.text}
									</Typography>
								</Box>
							) : (
								<HelpAnswer
									key={i}
									message={m}
									disabled={pending}
									onAsk={askHere}
									onNavigate={(path) => navigate(path)}
									onContactSupport={() => setTicketOpen(true)}
								/>
							)))}
							{pending && (
								<Typography data-testid="help-pending" sx={{ fontSize: tokens.fontSize.small, color: tokens.ink.faintest, mb: 1 }}>
									{t('help.thinking')}
								</Typography>
							)}
							{error && (
								<Alert severity={error.rateLimited ? 'warning' : 'error'} sx={{ mb: 1 }}
									action={<Button size="small" onClick={() => setTicketOpen(true)}>{t('help.contactSupport')}</Button>}>
									{error.message}
								</Alert>
							)}
							<div ref={endRef} />
						</Box>
					)}
				</Box>

				<HelpComposer onSend={askHere} disabled={pending} />
				<Box sx={{ display: 'flex', justifyContent: 'center', pb: 1 }}>
					<Button
						size="small"
						data-testid="help-contact-support"
						startIcon={<SupportAgentOutlinedIcon sx={{ fontSize: tokens.iconSize.sm }} />}
						onClick={() => setTicketOpen(true)}
						sx={{ textTransform: 'none', fontSize: tokens.fontSize.caption, color: tokens.ink.soft }}
					>
						{t('help.contactSupport')}
					</Button>
				</Box>
			</Drawer>
			<SupportTicketDialog
				open={ticketOpen}
				onClose={() => setTicketOpen(false)}
				conversationId={conversationId}
				defaultSubject={firstQuestion}
				page={page}
			/>
		</>
	);
};

export default HelpDrawer;
