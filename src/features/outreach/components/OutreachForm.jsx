import PropTypes from 'prop-types';
import dayjs from '../../../shared/lib/dayjs.js';
import { Alert, Box, Button, ButtonGroup, Chip, CircularProgress, Collapse, Link, Menu, MenuItem, Select, TextField, Tooltip, Typography } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SendIcon from '@mui/icons-material/Send';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import { HANDOFF } from '../../../utils/mailLinks.js';
import { THEME_GREEN, LANGUAGES, INTENTS, TONES, SUBJECT_MAX, BODY_MAX, primaryButtonSx, neutralButtonSx, inputSx } from '../model/outreach.js';
import { useTranslation } from 'react-i18next';
import * as tokens from '../../../theme/tokens.js';

/** The message form: intent, language, tone, draft, subject and body, and the send options. */
const OutreachForm = ({ composer }) => {
	const {
		body, canSendFromQorva, context, contextError, contextLoading, copyBody, drafting, goToSettings, handleHandoff, handleSend, handleShorter, handoffAnchor, handoffChoice, hasRecipient, historyOpen, instructions, intent, language, locale, mailbox, mailtoWarning, noEmail, readyToSend, runDraft, sending, setBody, setHandoffAnchor, setHistoryOpen, setInstructions, setIntent, setLanguage, setSubject, setTo, setTone, subject, suppressed, to, tone,
	} = composer;
	const { t } = useTranslation();
	return (
		<>
		<Box sx={{ px: 2, pt: 1.5, pb: 2, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
			{contextLoading && (
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: tokens.ink.subtle }}>
					<CircularProgress size={14} sx={{ color: THEME_GREEN }} />
					<Typography sx={{ fontSize: tokens.fontSize.small }}>{t('candidateOutreach.loading')}</Typography>
				</Box>
			)}
			{contextError && (
				<Alert severity="error" sx={{ fontSize: tokens.fontSize.small, borderRadius: 1.5 }}>{t('candidateOutreach.contextError')}</Alert>
			)}
			{suppressed && (
				<Alert severity="error" sx={{ fontSize: tokens.fontSize.small, borderRadius: 1.5 }}>{t('candidateOutreach.suppressed')}</Alert>
			)}
			{!suppressed && noEmail && (
				<Alert severity="warning" sx={{ fontSize: tokens.fontSize.small, borderRadius: 1.5 }}>{t('candidateOutreach.noEmail')}</Alert>
			)}
			{mailbox === 'REAUTH_REQUIRED' && (
				<Alert
					severity="warning"
					sx={{ fontSize: tokens.fontSize.small, borderRadius: 1.5 }}
					action={<Button size="small" onClick={goToSettings} sx={{ textTransform: 'none', fontSize: tokens.fontSize.small, fontWeight: 600 }}>{t('candidateOutreach.reconnect')}</Button>}
				>
					{t('candidateOutreach.reauthRequired')}
				</Alert>
			)}

			{/* AI draft bar */}
			<Box sx={{ border: `1px dashed ${tokens.line.strong}`, borderRadius: 2, p: 1.25, backgroundColor: tokens.surface.greenTint }}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
					<AutoAwesomeIcon sx={{ fontSize: tokens.iconSize.sm, color: THEME_GREEN }} />
					<Typography sx={{ fontSize: tokens.fontSize.small, fontWeight: 600, color: tokens.ink.body }}>{t('candidateOutreach.ai.title')}</Typography>
				</Box>
				<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
					{INTENTS.map(key => (
						<Chip
							key={key}
							size="small"
							label={t(`candidateOutreach.ai.intent.${key}`)}
							onClick={() => setIntent(key)}
							disabled={suppressed}
							sx={{
								fontSize: tokens.fontSize.caption, height: 26, borderRadius: 1.5, cursor: 'pointer',
								backgroundColor: intent === key ? THEME_GREEN : `${tokens.surface.paper}`,
								color: intent === key ? `${tokens.surface.paper}` : `${tokens.ink.body}`,
								border: `1px solid ${intent === key ? THEME_GREEN : `${tokens.line.main}`}`,
								'&:hover': { backgroundColor: intent === key ? `${tokens.brand.hover}` : `${tokens.surface.muted}` },
							}}
						/>
					))}
				</Box>
				<Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
					<Select
						size="small" value={tone} onChange={(e) => setTone(e.target.value)} displayEmpty disabled={suppressed}
						sx={{ ...inputSx, minWidth: 120, height: 32, '& .MuiSelect-select': { py: 0.5 } }}
					>
						{TONES.map(key => (
							<MenuItem key={key || 'default'} value={key} sx={{ fontSize: tokens.fontSize.small }}>{t(`candidateOutreach.ai.tone.${key || 'default'}`)}</MenuItem>
						))}
					</Select>
					<Select
						size="small" value={language} onChange={(e) => setLanguage(e.target.value)} disabled={suppressed}
						sx={{ ...inputSx, minWidth: 90, height: 32, '& .MuiSelect-select': { py: 0.5 } }}
					>
						{LANGUAGES.map(code => (
							<MenuItem key={code} value={code} sx={{ fontSize: tokens.fontSize.small }}>{t(`candidateOutreach.ai.language.${code}`)}</MenuItem>
						))}
					</Select>
					<Box sx={{ flexGrow: 1 }} />
					{body.trim() && (
						<Button size="small" variant="outlined" onClick={handleShorter} disabled={drafting || suppressed} sx={neutralButtonSx}>
							{t('candidateOutreach.ai.shorter')}
						</Button>
					)}
					<Button
						size="small" variant="contained" onClick={() => runDraft()} disabled={drafting || suppressed || !context}
						startIcon={drafting ? <CircularProgress size={12} sx={{ color: tokens.ink.inverse }} /> : <AutoAwesomeIcon sx={{ fontSize: tokens.iconSize.sm }} />}
						sx={primaryButtonSx}
					>
						{body.trim() ? t('candidateOutreach.ai.regenerate') : t('candidateOutreach.ai.generate')}
					</Button>
				</Box>
				<TextField
					size="small" fullWidth multiline minRows={1} maxRows={3}
					placeholder={t('candidateOutreach.ai.instructionsPlaceholder')}
					value={instructions} onChange={(e) => setInstructions(e.target.value.slice(0, 1000))}
					disabled={suppressed}
					InputProps={{ sx: { ...inputSx, mt: 1 } }}
				/>
			</Box>

			{/* Fields */}
			<TextField
				size="small" fullWidth label={t('candidateOutreach.to')} value={to}
				onChange={(e) => setTo(e.target.value)} disabled={suppressed}
				error={Boolean(to) && !hasRecipient}
				InputProps={{ sx: inputSx }} InputLabelProps={{ sx: { fontSize: tokens.fontSize.body2 } }}
			/>
			<TextField
				size="small" fullWidth label={t('candidateOutreach.subject')} value={subject}
				onChange={(e) => setSubject(e.target.value.slice(0, SUBJECT_MAX))} disabled={suppressed}
				InputProps={{ sx: inputSx }} InputLabelProps={{ sx: { fontSize: tokens.fontSize.body2 } }}
			/>
			<TextField
				size="small" fullWidth multiline minRows={8} maxRows={16} label={t('candidateOutreach.body')} value={body}
				onChange={(e) => setBody(e.target.value.slice(0, BODY_MAX))} disabled={suppressed}
				InputProps={{ sx: inputSx }} InputLabelProps={{ sx: { fontSize: tokens.fontSize.body2 } }}
			/>
			{mailtoWarning && (
				<Alert
					severity="info" sx={{ fontSize: tokens.fontSize.small, borderRadius: 1.5 }}
					action={<Button size="small" startIcon={<ContentCopyOutlinedIcon sx={{ fontSize: tokens.iconSize.sm }} />} onClick={copyBody} sx={{ textTransform: 'none', fontSize: tokens.fontSize.small, fontWeight: 600 }}>{t('candidateOutreach.copy')}</Button>}
				>
					{t('candidateOutreach.mailtoTooLong')}
				</Alert>
			)}

			{/* Footer */}
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
				{canSendFromQorva && (
					<Tooltip title={context?.mailboxAddress ? t('candidateOutreach.sendAs', { address: context.mailboxAddress }) : ''}>
						<span>
							<Button
								variant="contained" onClick={handleSend} disabled={!readyToSend || sending}
								startIcon={sending ? <CircularProgress size={12} sx={{ color: tokens.ink.inverse }} /> : <SendIcon sx={{ fontSize: tokens.iconSize.sm }} />}
								sx={primaryButtonSx}
							>
								{t('candidateOutreach.send')}
							</Button>
						</span>
					</Tooltip>
				)}
				<ButtonGroup variant={canSendFromQorva ? 'outlined' : 'contained'} disableElevation>
					<Button
						onClick={() => handleHandoff(handoffChoice)} disabled={suppressed || !hasRecipient}
						startIcon={<OpenInNewIcon sx={{ fontSize: tokens.iconSize.sm }} />}
						sx={canSendFromQorva ? neutralButtonSx : primaryButtonSx}
					>
						{t(`candidateOutreach.handoff.${handoffChoice}`)}
					</Button>
					<Button
						size="small" onClick={(e) => setHandoffAnchor(e.currentTarget)} disabled={suppressed || !hasRecipient}
						aria-label={t('candidateOutreach.handoff.choose')}
						sx={{ ...(canSendFromQorva ? neutralButtonSx : primaryButtonSx), px: 0.5, minWidth: 32 }}
					>
						<ArrowDropDownIcon />
					</Button>
				</ButtonGroup>
				<Menu anchorEl={handoffAnchor} open={Boolean(handoffAnchor)} onClose={() => setHandoffAnchor(null)}>
					{Object.values(HANDOFF).map(via => (
						<MenuItem key={via} onClick={() => handleHandoff(via)} sx={{ fontSize: tokens.fontSize.body2 }}>
							{t(`candidateOutreach.handoff.${via}`)}
						</MenuItem>
					))}
				</Menu>
				<Box sx={{ flexGrow: 1 }} />
				{context?.history?.length > 0 && (
					<Button
						size="small" onClick={() => setHistoryOpen(o => !o)}
						startIcon={<HistoryOutlinedIcon sx={{ fontSize: tokens.iconSize.sm }} />}
						endIcon={historyOpen ? <ExpandLessIcon sx={{ fontSize: tokens.iconSize.sm }} /> : <ExpandMoreIcon sx={{ fontSize: tokens.iconSize.sm }} />}
						sx={{ textTransform: 'none', fontSize: tokens.fontSize.small, color: tokens.ink.muted }}
					>
						{t('candidateOutreach.history.title', { count: context.history.length })}
					</Button>
				)}
			</Box>
			{!canSendFromQorva && mailbox === 'NONE' && (
				<Typography sx={{ fontSize: tokens.fontSize.caption, color: tokens.ink.subtle }}>
					{t('candidateOutreach.connectHint')}{' '}
					<Link component="button" type="button" onClick={goToSettings} sx={{ fontSize: tokens.fontSize.caption, fontWeight: 600, color: THEME_GREEN }}>
						{t('candidateOutreach.connectLink')}
					</Link>
				</Typography>
			)}

			{/* History */}
			<Collapse in={historyOpen}>
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, pt: 0.5 }}>
					{(context?.history ?? []).map(row => (
						<Box key={row.id} sx={{ border: `1px solid ${tokens.line.main}`, borderRadius: 1.5, px: 1.25, py: 0.75, backgroundColor: tokens.surface.subtle }}>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
								<Chip
									size="small"
									label={t(`candidateOutreach.history.status.${row.status}`, { via: t(`candidateOutreach.history.via.${row.via}`) })}
									sx={{
										height: 20, fontSize: tokens.fontSize.caption, fontWeight: 600, borderRadius: 1,
										backgroundColor: row.status === 'SENT' ? `${tokens.status.success.paleAlt}` : row.status === 'FAILED' ? `${tokens.status.error.pale}` : `${tokens.surface.muted}`,
										color: row.status === 'SENT' ? `${tokens.status.success.strong}` : row.status === 'FAILED' ? `${tokens.status.error.dark}` : `${tokens.ink.soft}`,
									}}
								/>
								<Typography sx={{ fontSize: tokens.fontSize.caption, color: tokens.ink.muted, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
									{row.senderName || row.senderEmail} · {dayjs(row.createdAt).locale(locale).fromNow()}
								</Typography>
								{row.providerWebLink && (
									<Link href={row.providerWebLink} target="_blank" rel="noopener" sx={{ fontSize: tokens.fontSize.caption, fontWeight: 600, color: THEME_GREEN, whiteSpace: 'nowrap' }}>
										{t('candidateOutreach.history.openInOutlook')}
									</Link>
								)}
							</Box>
							{row.subject && (
								<Typography sx={{ fontSize: tokens.fontSize.small, color: tokens.ink.strong, mt: 0.25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
									{row.subject}
								</Typography>
							)}
						</Box>
					))}
				</Box>
			</Collapse>
		</Box>
		</>
	);
};

OutreachForm.propTypes = {
	composer: PropTypes.object.isRequired,
};

export default OutreachForm;
