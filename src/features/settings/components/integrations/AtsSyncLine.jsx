import { useEffect, useState } from 'react';
import { Box, Tooltip, Typography } from '@mui/material';
import SyncIcon from '@mui/icons-material/Sync';
import SyncProblemIcon from '@mui/icons-material/SyncProblem';
import { useTranslation } from 'react-i18next';
import dayjs from '../../../../shared/lib/dayjs.js';
import { getAtsSyncStatus } from '../../api/atsService.js';
import { syncLines } from '../../model/integrations.js';
import * as tokens from '../../../../theme/tokens.js';

/**
 * "Synced with Greenhouse · 12 min ago" where recruiters work, so they know how fresh the jobs and resumes are.
 * Renders nothing when the company has no ATS (or the status can't be read).
 */
const AtsSyncLine = () => {
	const { t, i18n } = useTranslation();
	const [lines, setLines] = useState([]);

	useEffect(() => {
		let cancelled = false;
		getAtsSyncStatus()
			.then((res) => { if (!cancelled) setLines(syncLines(res?.data?.connections)); })
			.catch(() => { /* best-effort: no line */ });
		return () => { cancelled = true; };
	}, []);

	if (lines.length === 0) return null;
	const locale = i18n.language?.slice(0, 2) || 'en';
	return (
		<Box data-testid="ats-sync-line" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, ml: 'auto', flexWrap: 'wrap' }}>
			{lines.map((line) => {
				const when = line.at ? dayjs(line.at).locale(locale).fromNow() : null;
				const text = line.failed
					? t('atsSync.failed', { name: line.name })
					: when ? t('atsSync.synced', { name: line.name, when }) : t('atsSync.never', { name: line.name });
				const Icon = line.failed ? SyncProblemIcon : SyncIcon;
				return (
					<Tooltip key={line.name} title={line.failed ? t('atsSync.failedHint') : ''}>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
							<Icon sx={{ fontSize: tokens.iconSize.sm, color: line.failed ? tokens.status.error.main : tokens.ink.subtle }} />
							<Typography sx={{ fontSize: tokens.fontSize.caption, color: line.failed ? tokens.status.error.text : tokens.ink.muted }}>
								{text}{line.failed && when ? ` · ${when}` : ''}
							</Typography>
						</Box>
					</Tooltip>
				);
			})}
		</Box>
	);
};

export default AtsSyncLine;
