import { useCallback, useMemo, useState } from 'react';
import { Alert, Box, Button, CircularProgress, Paper, Snackbar, Typography } from '@mui/material';
import { DndContext, DragOverlay, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useTranslation } from 'react-i18next';
import { isActionAllowed, isDemoUser } from '../../../utils/demoMode.js';
import usePipelineBoard from '../hooks/usePipelineBoard.js';
import { COLLAPSED_BY_DEFAULT, COLUMN_ORDER, findCard } from '../model/board.js';
import PipelineToolbar from './PipelineToolbar.jsx';
import PipelineColumn from './PipelineColumn.jsx';
import { CardBody } from './PipelineCard.jsx';
import ReportDrawer from './ReportDrawer.jsx';
import * as tokens from '../../../theme/tokens.js';

// Space picks a card up and drops it (Enter opens it); arrows move it between columns.
const KEYBOARD_CODES = { start: ['Space'], cancel: ['Escape'], end: ['Space'] };

/**
 * The candidate pipeline: one column per status across all jobs (or one), cards dragged between columns to move
 * candidates. Columns load their first page and more on scroll, so the board stays fast however big it grows.
 */
const AppPipelineBoard = () => {
	const { t } = useTranslation();
	const canMove = isActionAllowed('MODIFY_REPORT') && !isDemoUser();
	const [toast, setToast] = useState(null);
	const notify = useCallback((message) => setToast({ ...message, at: Date.now() }), []);
	const board = usePipelineBoard({ notify });
	const [collapsed, setCollapsed] = useState(() => new Set(COLLAPSED_BY_DEFAULT));
	const [openId, setOpenId] = useState(null);
	const [activeId, setActiveId] = useState(null);

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
		useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
		useSensor(KeyboardSensor, { keyboardCodes: KEYBOARD_CODES }),
	);

	const toggle = useCallback((status) => setCollapsed((prev) => {
		const next = new Set(prev);
		if (next.has(status)) next.delete(status); else next.add(status);
		return next;
	}), []);

	const total = useMemo(() => COLUMN_ORDER.reduce((sum, s) => sum + (board.columns[s]?.count ?? 0), 0), [board.columns]);
	const showJob = !board.filters.jobPostId;
	const activeCard = activeId ? findCard(board.columns, activeId) : null;
	const nameOf = (id) => findCard(board.columns, id)?.candidateName || '—';
	const statusName = (s) => t(`reportStatus.values.${s}`);

	const announcements = {
		onDragStart: ({ active }) => t('pipeline.a11y.picked', { name: nameOf(active.id) }),
		onDragOver: ({ active, over }) => (over ? t('pipeline.a11y.over', { name: nameOf(active.id), status: statusName(over.id) }) : ''),
		onDragEnd: ({ active, over }) => (over ? t('pipeline.a11y.dropped', { name: nameOf(active.id), status: statusName(over.id) })
			: t('pipeline.a11y.cancelled', { name: nameOf(active.id) })),
		onDragCancel: ({ active }) => t('pipeline.a11y.cancelled', { name: nameOf(active.id) }),
	};

	const onDragEnd = ({ active, over }) => {
		setActiveId(null);
		if (over && COLUMN_ORDER.includes(over.id)) board.move(active.id, over.id);
	};

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', overflow: 'hidden', backgroundColor: tokens.surface.subtle }}>
			<PipelineToolbar filters={board.filters} onChange={board.updateFilters} total={total} onRefresh={() => board.reload()} />

			{!canMove && (
				<Typography sx={{ px: 2, pt: 1, fontSize: tokens.fontSize.caption, color: tokens.ink.muted }}>{t('pipeline.readOnly')}</Typography>
			)}

			{board.failed ? (
				<Box sx={{ p: 4, textAlign: 'center' }}>
					<Typography sx={{ fontSize: tokens.fontSize.body2, color: tokens.ink.muted, mb: 1 }}>{t('pipeline.errors.load')}</Typography>
					<Button size="small" onClick={() => board.reload()}>{t('pipeline.retry')}</Button>
				</Box>
			) : (
				<DndContext sensors={sensors} accessibility={{ announcements }}
					onDragStart={({ active }) => setActiveId(active.id)} onDragEnd={onDragEnd} onDragCancel={() => setActiveId(null)}>
					<Box data-testid="pipeline-board" sx={{ position: 'relative', flex: 1, minHeight: 0, display: 'flex', gap: 1.5, p: 2,
						overflowX: 'auto', alignItems: 'stretch', opacity: board.loading ? 0.6 : 1, transition: 'opacity 0.15s' }}>
						{COLUMN_ORDER.map((status) => (
							<PipelineColumn key={status} status={status} column={board.columns[status]} collapsed={collapsed.has(status)}
								onToggle={toggle} showJob={showJob} canMove={canMove} loadingMore={!!board.loadingMore[status]}
								onLoadMore={board.loadMore} onOpen={(card) => setOpenId(card.id)} onMove={board.move} />
						))}
						{board.loading && total === 0 && (
							<Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress size={28} /></Box>
						)}
					</Box>
					<DragOverlay dropAnimation={null}>
						{activeCard && (
							<Paper elevation={6} sx={{ p: 1.25, borderRadius: 2, width: 256, cursor: 'grabbing', backgroundColor: tokens.surface.paper }}>
								<CardBody card={activeCard} showJob={showJob} />
							</Paper>
						)}
					</DragOverlay>
				</DndContext>
			)}

			{!board.loading && !board.failed && total === 0 && (
				<Typography sx={{ px: 2, pb: 2, fontSize: tokens.fontSize.body2, color: tokens.ink.subtle }}>{t('pipeline.empty')}</Typography>
			)}

			<ReportDrawer reportId={openId} onClose={() => setOpenId(null)} onStatusChange={canMove ? board.moveReport : undefined} />

			<Snackbar key={toast?.at} open={Boolean(toast)} autoHideDuration={toast?.kind === 'moved' ? 5000 : 6000} onClose={() => setToast(null)}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
				{toast?.kind === 'moved' ? (
					<Alert severity="success" variant="filled" onClose={() => setToast(null)}
						action={<Button color="inherit" size="small" onClick={() => { setToast(null); board.move(toast.cardId, toast.from, { undo: true }); }}>{t('pipeline.undo')}</Button>}>
						{t('pipeline.moved', { name: toast.name || '—', status: statusName(toast.to) })}
					</Alert>
				) : (
					<Alert severity="error" variant="filled" onClose={() => setToast(null)}>{toast ? t(toast.key) : ''}</Alert>
				)}
			</Snackbar>
		</Box>
	);
};

export default AppPipelineBoard;
