import { useCallback, useEffect, useRef, useState } from 'react';
import { getBoard, getColumn } from '../api/pipelineService.js';
import { setReportStatus } from '../../reports/api/reportService.js';
import { appendPage, cardFromReport, findCard, fromBoard, moveCard, restoreCard, updateCard } from '../model/board.js';

const JOB_KEY = 'qorva:pipeline:job';

const readJob = () => {
	try { return localStorage.getItem(JOB_KEY) ?? ''; } catch { return ''; }
};

/**
 * The board's data: loads it for the filters (the job is remembered), pages a column, and moves a card at once —
 * then saves it, telling the server where the card was. A refused move puts the card back; if someone else moved
 * the candidate first (409), the board reloads to show where they are. `notify({ kind, ... })` reports the outcome.
 */
export default function usePipelineBoard({ notify }) {
	const [filters, setFilters] = useState(() => ({ jobPostId: readJob(), q: '', hideOutdated: false }));
	const [columns, setColumns] = useState(() => fromBoard(null));
	const [loading, setLoading] = useState(true);
	const [failed, setFailed] = useState(false);
	const [loadingMore, setLoadingMore] = useState({});
	const columnsRef = useRef(columns);
	useEffect(() => { columnsRef.current = columns; }, [columns]);
	const requestRef = useRef(0);

	const reload = useCallback(async (next = filters) => {
		const request = ++requestRef.current;
		setLoading(true);
		try {
			const res = await getBoard(next);
			if (request !== requestRef.current) return;
			setColumns(fromBoard(res?.data));
			setFailed(false);
		} catch {
			if (request === requestRef.current) setFailed(true);
		} finally {
			if (request === requestRef.current) setLoading(false);
		}
	}, [filters]);

	useEffect(() => { reload(filters); }, [filters, reload]);

	useEffect(() => {
		const onFocus = () => reload();
		window.addEventListener('focus', onFocus);
		return () => window.removeEventListener('focus', onFocus);
	}, [reload]);

	const updateFilters = useCallback((patch) => {
		setFilters((prev) => {
			const next = { ...prev, ...patch };
			if ('jobPostId' in patch) {
				try { localStorage.setItem(JOB_KEY, next.jobPostId ?? ''); } catch { /* per-browser convenience only */ }
			}
			return next;
		});
	}, []);

	const loadMore = useCallback(async (status) => {
		const cursor = columnsRef.current[status]?.nextCursor;
		if (!cursor || loadingMore[status]) return;
		setLoadingMore((prev) => ({ ...prev, [status]: true }));
		try {
			const res = await getColumn(status, filters, cursor);
			setColumns((prev) => appendPage(prev, status, res?.data ?? {}));
		} catch {
			notify?.({ kind: 'error', key: 'pipeline.errors.load' });
		} finally {
			setLoadingMore((prev) => ({ ...prev, [status]: false }));
		}
	}, [filters, loadingMore, notify]);

	/** Moves a card; resolves to the updated report, or null when the move didn't happen. */
	const move = useCallback(async (cardId, to, { undo = false } = {}) => {
		const card = findCard(columnsRef.current, cardId);
		if (!card || card.status === to) return null;
		setColumns((prev) => moveCard(prev, cardId, to));
		try {
			const res = await setReportStatus(cardId, to, card.status);
			setColumns((prev) => updateCard(prev, cardFromReport(res.data)));
			if (!undo) notify?.({ kind: 'moved', cardId, from: card.status, to, name: card.candidateName });
			return res.data;
		} catch (error) {
			if (error?.response?.status === 409) {
				notify?.({ kind: 'error', key: 'pipeline.errors.conflict' });
				reload();
			} else {
				setColumns((prev) => restoreCard(prev, card, to));
				notify?.({ kind: 'error', key: 'pipeline.errors.move' });
			}
			return null;
		}
	}, [notify, reload]);

	/** From the side panel: the report's card may not be loaded (another page); then the board just reloads. */
	const moveReport = useCallback(async (report, to) => {
		if (findCard(columnsRef.current, report.id)) return move(report.id, to);
		try {
			const res = await setReportStatus(report.id, to, report.status);
			reload();
			return res.data;
		} catch (error) {
			notify?.({ kind: 'error', key: error?.response?.status === 409 ? 'pipeline.errors.conflict' : 'pipeline.errors.move' });
			reload();
			return null;
		}
	}, [move, notify, reload]);

	return { filters, updateFilters, columns, loading, failed, loadingMore, loadMore, move, moveReport, reload };
}
