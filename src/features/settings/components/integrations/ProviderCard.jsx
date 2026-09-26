import PropTypes from 'prop-types';
import { Box, Button, CircularProgress, Divider, IconButton, Paper, Tooltip, Typography } from '@mui/material';
import SyncOutlinedIcon from '@mui/icons-material/SyncOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { useTranslation } from 'react-i18next';
import CopyRow from './CopyRow.jsx';
import GuideSteps from './GuideSteps.jsx';
import ManagedWebhooks from './ManagedWebhooks.jsx';
import RunLine from './RunLine.jsx';
import SettingRow from './SettingRow.jsx';
import StatusChip from './StatusChip.jsx';
import { BTN_GREEN_SX, GREEN, isPubliclyReachable, stepList } from '../../model/integrations.js';
import * as tokens from '../../../../theme/tokens.js';

/** One ATS provider: connect button, or the connection's actions, settings, webhook setup and recent runs. */
const ProviderCard = ({
	provider, meta, connection, runs, busy, planFull, signsWebhooks, needsConfirmation,
	onConnect, onSync, onTest, onDelete, onToggle, onConfirmInitialSync, onCopy, onRetryWebhooks,
}) => {
	const { t } = useTranslation();
	return (
		<Paper elevation={0} sx={{ border: `1px solid ${tokens.line.main}`, borderRadius: 2.5, p: 2 }}>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
				<Typography sx={{ fontWeight: 700, fontSize: '0.92rem', color: tokens.ink.strong, flex: 1 }}>
					{meta.label}
				</Typography>
				{connection && <StatusChip status={connection.status} />}
				{connection ? (
					<>
						<Tooltip title={t('atsIntegrations.syncNow')}>
							<span>
								<IconButton size="small" disabled={busy || connection.status !== 'CONNECTED'}
									onClick={onSync}
									sx={{ color: GREEN }}>
									<SyncOutlinedIcon sx={{ fontSize: 17 }} />
								</IconButton>
							</span>
						</Tooltip>
						<Button size="small" disabled={busy}
							onClick={onTest}
							sx={{ textTransform: 'none', fontSize: '0.72rem', color: tokens.ink.muted }}>
							{t('atsIntegrations.testConnection')}
						</Button>
						<Tooltip title={t('atsIntegrations.disconnect')}>
							<span>
								<IconButton size="small" disabled={busy} onClick={onDelete}
									sx={{ color: tokens.status.error.main }}>
									<DeleteOutlineOutlinedIcon sx={{ fontSize: 17 }} />
								</IconButton>
							</span>
						</Tooltip>
					</>
				) : (
					<Button size="small" variant="contained" disabled={busy || planFull}
						startIcon={busy ? <CircularProgress size={12} color="inherit" /> : null}
						onClick={onConnect} sx={BTN_GREEN_SX}>
						{t('atsIntegrations.connect')}
					</Button>
				)}
			</Box>

			{connection && (
				<Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
					<Divider sx={{ borderColor: tokens.surface.muted }} />
					<SettingRow
						label={t('atsIntegrations.settings.autoImport')}
						hint={t('atsIntegrations.settings.autoImportHint')}
						checked={connection.autoImport}
						onChange={onToggle('autoImport')} />
					<SettingRow
						label={t('atsIntegrations.settings.importJobs')}
						hint={t('atsIntegrations.settings.importJobsHint')}
						checked={connection.importJobs}
						onChange={onToggle('importJobs')} />
					<SettingRow
						label={t('atsIntegrations.settings.writeBackScores')}
						hint={t('atsIntegrations.settings.writeBackScoresHint')}
						checked={connection.writeBackScores}
						onChange={onToggle('writeBackScores')} />

					{needsConfirmation && (
						<Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: 'rgba(217,119,6,0.06)', border: '1px solid rgba(217,119,6,0.25)' }}>
							<Typography sx={{ fontSize: '0.78rem', color: tokens.status.warning.text, mb: 1 }}>
								{t('atsIntegrations.initialSyncGuardHint')}
							</Typography>
							<Button size="small" variant="contained" disabled={busy}
								onClick={onConfirmInitialSync} sx={BTN_GREEN_SX}>
								{t('atsIntegrations.confirmFullImport')}
							</Button>
						</Box>
					)}

					{/*
					  * Real-time updates. Providers that sign their payloads need Qorva's
					  * secret pasted into the ATS; the rest authenticate with the token
					  * already inside the URL, so showing them a secret would only confuse.
					  * Where the ATS offers no webhook screen at all, say so plainly instead
					  * of listing steps that lead nowhere.
					  */}
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
						{/* Only worth showing when someone has to paste them somewhere. */}
						{!connection.webhooksManaged && (
							<CopyRow
								label={t('atsIntegrations.webhookUrl')}
								value={connection.webhookUrl}
								onCopy={() => onCopy(connection.webhookUrl, t('atsIntegrations.webhookCopied'))} />
						)}
						{!connection.webhooksManaged && !isPubliclyReachable(connection.webhookUrl) && (
							<Typography sx={{ fontSize: '0.72rem', color: tokens.status.warning.main }}>
								{t('atsIntegrations.guides.webhookUrlNotPublic')}
							</Typography>
						)}
						{!connection.webhooksManaged && signsWebhooks && connection.webhookSecret && (
							<CopyRow
								mask
								label={t('atsIntegrations.guides.webhookSecret')}
								value={connection.webhookSecret}
								onCopy={() => onCopy(connection.webhookSecret, t('atsIntegrations.guides.webhookSecretCopied'))} />
						)}
						{connection.webhooksManaged ? (
							<>
								<ManagedWebhooks
									registered={connection.webhooksRegistered}
									error={connection.webhookError}
									busy={busy}
									onRetry={onRetryWebhooks} />
								{/* A provider with its own webhook screen keeps the manual route as a
								  * fallback, but only once the automatic attempt has actually failed. */}
								{!connection.webhooksRegistered && meta.webhookGuide && (
									<GuideSteps
										title={t('atsIntegrations.guides.webhookManualFallback')}
										steps={stepList(t, `atsIntegrations.guides.${provider}.webhookSteps`)}
										note={t('atsIntegrations.guides.urlCarriesToken')} />
								)}
							</>
						) : meta.webhookGuide ? (
							<GuideSteps
								title={t('atsIntegrations.guides.webhookTitle')}
								intro={t('atsIntegrations.guides.webhookIntro', { provider: meta.label })}
								steps={stepList(t, `atsIntegrations.guides.${provider}.webhookSteps`)}
								note={signsWebhooks
									? t('atsIntegrations.guides.pasteSecret')
									: t('atsIntegrations.guides.urlCarriesToken')} />
						) : (
							<GuideSteps
								title={t('atsIntegrations.guides.webhookTitle')}
								steps={[]}
								note={t(`atsIntegrations.guides.${provider}.webhookUnavailable`, '')} />
						)}
					</Box>

					{runs.length > 0 && (
						<Box>
							<Typography sx={{ fontSize: '0.7rem', color: tokens.ink.subtle, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5 }}>
								{t('atsIntegrations.runs.title')}
							</Typography>
							{runs.slice(0, 5).map((run) => <RunLine key={run.id} run={run} />)}
						</Box>
					)}
				</Box>
			)}
		</Paper>
	);
};

ProviderCard.propTypes = {
	provider: PropTypes.string.isRequired,
	meta: PropTypes.shape({ label: PropTypes.string.isRequired, webhookGuide: PropTypes.bool }).isRequired,
	connection: PropTypes.object,
	runs: PropTypes.array.isRequired,
	busy: PropTypes.bool,
	planFull: PropTypes.bool,
	signsWebhooks: PropTypes.bool,
	needsConfirmation: PropTypes.bool,
	onConnect: PropTypes.func.isRequired,
	onSync: PropTypes.func,
	onTest: PropTypes.func,
	onDelete: PropTypes.func,
	onToggle: PropTypes.func,
	onConfirmInitialSync: PropTypes.func,
	onCopy: PropTypes.func,
	onRetryWebhooks: PropTypes.func,
};

export default ProviderCard;
