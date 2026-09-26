// eslint-disable-next-line no-unused-vars
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ConfirmDialog from '../../../shared/ui/ConfirmDialog.jsx';
import {
	Box,
	Paper,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { DOCK_WIDTH } from '../model/outreach.js';
import OutreachForm from './OutreachForm.jsx';
import OutreachContextStrip from './OutreachContextStrip.jsx';
import DockTitleBar from './DockTitleBar.jsx';
import useOutreachComposer from '../hooks/useOutreachComposer.js';
import * as tokens from '../../../theme/tokens.js';

/**
 * Gmail-style composer docked bottom-right. Mounted once in AppHome; opened by the entry points on
 * the CV list, CV details and matching report through useCandidateOutreach().openComposer(). The
 * primary action depends on the recruiter's mailbox: connected Microsoft 365 → Send from Qorva
 * (as them, into their Sent folder); otherwise a hand-off to their own client. Hidden from print.
 */
const CandidateOutreachDock = () => {
	const { t } = useTranslation();
	const composer = useOutreachComposer();
	if (!composer.isOpen) return null;

	const title = composer.context?.candidateName || composer.target?.candidateName || t('candidateOutreach.title');
	const lastContact = composer.context?.history?.[0];

	return (
		<>
			<Paper
				elevation={0}
				role="dialog"
				aria-label={t('candidateOutreach.title')}
				sx={{
					position: 'fixed', right: 24, bottom: 0,
					width: { xs: 'calc(100vw - 32px)', sm: DOCK_WIDTH },
					maxHeight: composer.minimized ? 48 : 'calc(100vh - 88px)',
					display: 'flex', flexDirection: 'column',
					borderRadius: '12px 12px 0 0',
					border: `1px solid ${tokens.line.main}`, borderBottom: 'none',
					boxShadow: '0 -4px 24px rgba(15, 23, 42, 0.12)',
					backgroundColor: tokens.surface.paper, overflow: 'hidden',
					zIndex: (theme) => theme.zIndex.modal - 1,
					transition: 'max-height 0.2s ease',
					'@media print': { display: 'none' },
				}}
			>
				{/* Title bar */}
				<DockTitleBar
					handleClose={composer.handleClose}
					minimize={composer.minimize}
					minimized={composer.minimized}
					restore={composer.restore}
					title={title}
				/>

				{!composer.minimized && (
					<Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, overflowY: 'auto' }}>
						{/* Context strip */}
						<OutreachContextStrip lastContact={lastContact} locale={composer.locale} target={composer.target} />

						<OutreachForm composer={composer} />
					</Box>
				)}
			</Paper>

			<ConfirmDialog
				open={composer.discardOpen}
				title={t('candidateOutreach.discardTitle')}
				cancelLabel={t('candidateOutreach.keepEditing')}
				confirmLabel={t('candidateOutreach.discard')}
				onCancel={() => composer.setDiscardOpen(false)}
				onConfirm={() => { composer.setDiscardOpen(false); composer.close(); }}
				tone="danger"
			>
				{t('candidateOutreach.discardBody')}
			</ConfirmDialog>
		</>
	);
};

export default CandidateOutreachDock;
