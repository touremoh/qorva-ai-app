import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
	Alert, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, TextField, Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { createSupportTicket } from '../api/helpService.js';
import { helpErrorMessage } from '../hooks/useHelpConversation.js';
import { brandButtonSx, textButtonSx } from '../../../shared/ui/buttonSx.js';
import * as tokens from '../../../theme/tokens.js';

export const MAX_SUBJECT = 150;
export const MAX_DESCRIPTION = 4000;

/**
 * Support request, pre-filled from the conversation. Nothing is sent until the user confirms; the reference is
 * shown afterwards and support replies by email.
 */
const SupportTicketDialog = ({ open, onClose, conversationId, defaultSubject, page }) => {
	const { t } = useTranslation();
	const [subject, setSubject] = useState('');
	const [description, setDescription] = useState('');
	const [includeConversation, setIncludeConversation] = useState(true);
	const [sending, setSending] = useState(false);
	const [error, setError] = useState(null);
	const [reference, setReference] = useState(null);

	useEffect(() => {
		if (!open) return;
		setSubject((defaultSubject ?? '').slice(0, MAX_SUBJECT));
		setDescription('');
		setIncludeConversation(!!conversationId);
		setError(null);
		setReference(null);
	}, [open, defaultSubject, conversationId]);

	const valid = subject.trim().length > 0 && subject.length <= MAX_SUBJECT
		&& description.trim().length > 0 && description.length <= MAX_DESCRIPTION;

	const submit = async () => {
		if (!valid || sending) return;
		setSending(true);
		setError(null);
		try {
			const res = await createSupportTicket({
				conversationId: conversationId ?? undefined,
				subject: subject.trim(),
				description: description.trim(),
				includeConversation: includeConversation && !!conversationId,
				page: page ?? undefined,
			});
			setReference(res.data?.reference ?? '');
		} catch (err) {
			setError(helpErrorMessage(err, t));
		} finally {
			setSending(false);
		}
	};

	return (
		<Dialog open={open} onClose={sending ? undefined : onClose} maxWidth="sm" fullWidth data-testid="support-ticket-dialog">
			<DialogTitle sx={{ fontSize: tokens.fontSize.lg, fontWeight: 700 }}>{t('help.ticket.title')}</DialogTitle>
			<DialogContent>
				{reference !== null ? (
					<Alert severity="success" data-testid="support-ticket-sent">
						{t('help.ticket.sent', { reference })}
					</Alert>
				) : (
					<>
						<Typography sx={{ fontSize: tokens.fontSize.small, color: tokens.ink.soft, mb: 2 }}>
							{t('help.ticket.intro')}
						</Typography>
						<TextField
							label={t('help.ticket.subject')}
							value={subject}
							onChange={(e) => setSubject(e.target.value)}
							fullWidth
							size="small"
							error={subject.length > MAX_SUBJECT}
							helperText={subject.length > MAX_SUBJECT ? `${subject.length}/${MAX_SUBJECT}` : ' '}
							inputProps={{ 'data-testid': 'support-ticket-subject' }}
						/>
						<TextField
							label={t('help.ticket.description')}
							placeholder={t('help.ticket.descriptionPlaceholder')}
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							fullWidth
							multiline
							minRows={5}
							maxRows={12}
							error={description.length > MAX_DESCRIPTION}
							helperText={description.length > MAX_DESCRIPTION * 0.9 ? `${description.length}/${MAX_DESCRIPTION}` : t('help.ticket.noSecrets')}
							inputProps={{ 'data-testid': 'support-ticket-description' }}
						/>
						{conversationId && (
							<FormControlLabel
								sx={{ mt: 1, '& .MuiFormControlLabel-label': { fontSize: tokens.fontSize.small } }}
								control={<Checkbox size="small" checked={includeConversation} onChange={(e) => setIncludeConversation(e.target.checked)} />}
								label={t('help.ticket.includeConversation')}
							/>
						)}
						{error && <Alert severity="error" sx={{ mt: 1.5 }}>{error}</Alert>}
					</>
				)}
			</DialogContent>
			<DialogActions sx={{ px: 3, pb: 2 }}>
				{reference !== null ? (
					<Button variant="contained" onClick={onClose} sx={brandButtonSx(tokens.fontSize.small)}>{t('help.ticket.done')}</Button>
				) : (
					<>
						<Button onClick={onClose} disabled={sending} sx={textButtonSx(tokens.fontSize.small)}>{t('help.ticket.cancel')}</Button>
						<Button
							variant="contained"
							onClick={submit}
							disabled={!valid || sending}
							data-testid="support-ticket-submit"
							sx={brandButtonSx(tokens.fontSize.small)}
						>
							{sending ? t('help.ticket.sending') : t('help.ticket.send')}
						</Button>
					</>
				)}
			</DialogActions>
		</Dialog>
	);
};

SupportTicketDialog.propTypes = {
	open: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	conversationId: PropTypes.string,
	defaultSubject: PropTypes.string,
	page: PropTypes.string,
};

export default SupportTicketDialog;
