import { useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Chip, IconButton, Menu, MenuItem, Paper, Tooltip, Typography } from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { useDraggable } from '@dnd-kit/core';
import { useTranslation } from 'react-i18next';
import dayjs from '../../../shared/lib/dayjs.js';
import { scoreChipSx } from '../../reports/model/reportList.js';
import { COLUMN_ORDER } from '../model/board.js';
import * as tokens from '../../../theme/tokens.js';

/** What a card shows; also the drag preview (no drag handle, no menu). */
export const CardBody = ({ card, showJob }) => {
	const { t, i18n } = useTranslation();
	const locale = i18n.language?.slice(0, 2) || 'en';
	const score = Math.ceil(card.score ?? 0);
	const since = card.statusChangedAt ?? card.createdAt;
	return (
		<>
			<Typography sx={{ fontSize: tokens.fontSize.body2, fontWeight: 600, color: tokens.ink.strong, pr: 3,
				overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
				{card.candidateName || '—'}
			</Typography>
			{showJob && card.jobPostTitle && (
				<Typography sx={{ fontSize: tokens.fontSize.caption, color: tokens.ink.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
					{card.jobPostTitle}
				</Typography>
			)}
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.75, flexWrap: 'wrap' }}>
				<Chip size="small" label={`${score}%`} sx={{ height: 18, fontSize: tokens.fontSize.micro, fontWeight: 700, ...scoreChipSx(score) }} />
				{card.outdated && (
					<Chip size="small" label={t('matchingRun.outdated')}
						sx={{ height: 18, fontSize: tokens.fontSize.micro, backgroundColor: tokens.surface.muted, color: tokens.ink.muted }} />
				)}
				{since && (
					<Typography component="span" sx={{ fontSize: tokens.fontSize.micro, color: tokens.ink.subtle, ml: 'auto' }}>
						{dayjs(since).locale(locale).fromNow(true)}
					</Typography>
				)}
			</Box>
			{card.lastMove?.byName && (
				<Typography sx={{ fontSize: tokens.fontSize.micro, color: tokens.ink.faint, mt: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
					{t('pipeline.card.movedBy', { name: card.lastMove.byName })}
				</Typography>
			)}
		</>
	);
};

CardBody.propTypes = { card: PropTypes.object.isRequired, showJob: PropTypes.bool };

const cardSx = {
	position: 'relative', p: 1.25, borderRadius: 2, border: `1px solid ${tokens.line.main}`,
	backgroundColor: tokens.surface.paper, cursor: 'pointer', touchAction: 'manipulation',
	'&:hover': { borderColor: tokens.brand.main },
	'&:focus-visible': { outline: `2px solid ${tokens.brand.main}`, outlineOffset: 1 },
};

/**
 * One candidate on one job. Dragged to another column to move them; the "Move to…" menu does the same without
 * dragging (keyboard, touch, screen readers). Click or Enter opens the report. Static when the user can't move.
 */
const PipelineCard = ({ card, showJob, canMove, onOpen, onMove }) => {
	const { t } = useTranslation();
	const [anchor, setAnchor] = useState(null);
	// The card stays in place (dimmed) while a copy follows the pointer (DragOverlay on the board).
	const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: card.id, disabled: !canMove });

	const onKeyDown = (event) => {
		if (event.key === 'Enter') { onOpen(card); return; }
		listeners?.onKeyDown?.(event);
	};

	return (
		<Paper
			ref={setNodeRef}
			elevation={0}
			data-testid="pipeline-card"
			data-card-id={card.id}
			{...attributes}
			{...listeners}
			onKeyDown={onKeyDown}
			aria-label={t('pipeline.card.label', { name: card.candidateName || '—', status: t(`reportStatus.values.${card.status}`) })}
			onClick={() => onOpen(card)}
			sx={{ ...cardSx, opacity: isDragging ? 0.4 : 1, cursor: canMove ? 'grab' : 'pointer' }}
		>
			<CardBody card={card} showJob={showJob} />
			{canMove && (
				<>
					<Tooltip title={t('pipeline.card.moveTo')}>
						<IconButton size="small" aria-label={t('pipeline.card.moveTo')} aria-haspopup="menu"
							onPointerDown={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}
							onClick={(e) => { e.stopPropagation(); setAnchor(e.currentTarget); }}
							sx={{ position: 'absolute', top: 4, right: 4, color: tokens.ink.subtle }}>
							<MoreHorizIcon sx={{ fontSize: tokens.iconSize.md }} />
						</IconButton>
					</Tooltip>
					<Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)} onClick={(e) => e.stopPropagation()}>
						{COLUMN_ORDER.filter((s) => s !== card.status).map((s) => (
							<MenuItem key={s} onClick={() => { setAnchor(null); onMove(card.id, s); }} sx={{ fontSize: tokens.fontSize.body2 }}>
								{t(`reportStatus.values.${s}`)}
							</MenuItem>
						))}
					</Menu>
				</>
			)}
		</Paper>
	);
};

PipelineCard.propTypes = {
	card: PropTypes.object.isRequired,
	showJob: PropTypes.bool,
	canMove: PropTypes.bool,
	onOpen: PropTypes.func.isRequired,
	onMove: PropTypes.func.isRequired,
};

export default PipelineCard;
