import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Box, Button, CircularProgress, IconButton, Tooltip, Typography } from '@mui/material';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import { alpha } from '@mui/material/styles';
import { useDroppable } from '@dnd-kit/core';
import { useTranslation } from 'react-i18next';
import { statusChipSx } from '../../reports/model/reportStatus.js';
import PipelineCard from './PipelineCard.jsx';
import * as tokens from '../../../theme/tokens.js';

/**
 * One status: its exact count, its cards (more load as the list scrolls to the end), and a drop zone. A collapsed
 * column is a narrow strip that still accepts drops.
 */
const PipelineColumn = ({ status, column, collapsed, onToggle, showJob, canMove, loadingMore, onLoadMore, onOpen, onMove }) => {
	const { t } = useTranslation();
	const { setNodeRef, isOver } = useDroppable({ id: status, disabled: !canMove });
	const sentinel = useRef(null);
	const label = t(`reportStatus.values.${status}`);

	useEffect(() => {
		const node = sentinel.current;
		if (!node || !column.nextCursor || typeof IntersectionObserver === 'undefined') return undefined;
		const observer = new IntersectionObserver((entries) => { if (entries.some((e) => e.isIntersecting)) onLoadMore(status); });
		observer.observe(node);
		return () => observer.disconnect();
	}, [column.nextCursor, onLoadMore, status]);

	const frame = {
		display: 'flex', flexDirection: 'column', flexShrink: 0, minHeight: 0, borderRadius: 2.5,
		backgroundColor: isOver ? alpha(tokens.brand.main, 0.08) : tokens.surface.muted,
		outline: isOver ? `2px dashed ${tokens.brand.main}` : 'none', transition: 'background-color 0.15s',
	};

	if (collapsed) {
		return (
			<Box ref={setNodeRef} data-testid={`pipeline-column-${status}`} sx={{ ...frame, width: 52, alignItems: 'center', py: 1, gap: 1 }}>
				<Tooltip title={t('pipeline.column.expand')}>
					<IconButton size="small" onClick={() => onToggle(status)} aria-label={t('pipeline.column.expandNamed', { status: label })}>
						<UnfoldMoreIcon sx={{ fontSize: tokens.iconSize.md, transform: 'rotate(90deg)' }} />
					</IconButton>
				</Tooltip>
				<Typography sx={{ writingMode: 'vertical-rl', fontSize: tokens.fontSize.small, fontWeight: 600, color: tokens.ink.muted }}>
					{label} · {column.count}
				</Typography>
			</Box>
		);
	}

	return (
		<Box ref={setNodeRef} data-testid={`pipeline-column-${status}`} role="region" aria-label={`${label} (${column.count})`}
			sx={{ ...frame, width: 272 }}>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, pt: 1.25, pb: 1 }}>
				<Box sx={{ px: 1, py: 0.25, borderRadius: 1, fontSize: tokens.fontSize.caption, fontWeight: 700, ...statusChipSx(status) }}>{label}</Box>
				<Typography data-testid={`pipeline-count-${status}`} sx={{ fontSize: tokens.fontSize.caption, fontWeight: 600, color: tokens.ink.muted }}>
					{column.count}
				</Typography>
				<Box sx={{ flex: 1 }} />
				<Tooltip title={t('pipeline.column.collapse')}>
					<IconButton size="small" onClick={() => onToggle(status)} aria-label={t('pipeline.column.collapseNamed', { status: label })}>
						<UnfoldLessIcon sx={{ fontSize: tokens.iconSize.md, transform: 'rotate(90deg)' }} />
					</IconButton>
				</Tooltip>
			</Box>
			<Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', px: 1, pb: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
				{column.items.length === 0 && (
					<Typography sx={{ fontSize: tokens.fontSize.caption, color: tokens.ink.faint, textAlign: 'center', py: 3 }}>
						{canMove ? t('pipeline.column.emptyDrop') : t('pipeline.column.empty')}
					</Typography>
				)}
				{column.items.map((card) => (
					<PipelineCard key={card.id} card={card} showJob={showJob} canMove={canMove} onOpen={onOpen} onMove={onMove} />
				))}
				{column.nextCursor && (
					<Box ref={sentinel} sx={{ display: 'flex', justifyContent: 'center', py: 0.5 }}>
						{loadingMore ? <CircularProgress size={18} /> : (
							<Button size="small" onClick={() => onLoadMore(status)} sx={{ textTransform: 'none', fontSize: tokens.fontSize.caption }}>
								{t('pipeline.column.loadMore', { count: column.count - column.items.length })}
							</Button>
						)}
					</Box>
				)}
			</Box>
		</Box>
	);
};

PipelineColumn.propTypes = {
	status: PropTypes.string.isRequired,
	column: PropTypes.shape({ count: PropTypes.number, items: PropTypes.array, nextCursor: PropTypes.string }).isRequired,
	collapsed: PropTypes.bool,
	onToggle: PropTypes.func.isRequired,
	showJob: PropTypes.bool,
	canMove: PropTypes.bool,
	loadingMore: PropTypes.bool,
	onLoadMore: PropTypes.func.isRequired,
	onOpen: PropTypes.func.isRequired,
	onMove: PropTypes.func.isRequired,
};

export default PipelineColumn;
