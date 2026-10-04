import { REPORT_STATUSES } from '../../reports/model/reportStatus.js';

/** Columns in pipeline order; the closed ones start collapsed. */
export const COLUMN_ORDER = REPORT_STATUSES;
export const COLLAPSED_BY_DEFAULT = ['REJECTED', 'WITHDRAWN'];

/** The API's board → `{ STATUS: { count, items, nextCursor } }` for every status. */
export const fromBoard = (board) => {
	const columns = Object.fromEntries(COLUMN_ORDER.map((s) => [s, { count: 0, items: [], nextCursor: null }]));
	(board?.columns ?? []).forEach((c) => {
		if (columns[c.status]) columns[c.status] = { count: c.count ?? 0, items: c.items ?? [], nextCursor: c.nextCursor ?? null };
	});
	return columns;
};

export const findCard = (columns, id) => {
	for (const status of COLUMN_ORDER) {
		const card = columns[status]?.items.find((c) => c.id === id);
		if (card) return card;
	}
	return null;
};

/** New is ordered by best score; the other columns show the latest move first. */
const insert = (items, card, status) => {
	if (status !== 'NEW') return [card, ...items];
	const at = items.findIndex((c) => (c.score ?? -1) < (card.score ?? -1));
	return at < 0 ? [...items, card] : [...items.slice(0, at), card, ...items.slice(at)];
};

/**
 * The board right after a card is dropped on another column (before the server answers): the card leaves its
 * column, enters the target one in the target's order, and both counts follow. Unchanged when it doesn't move.
 */
export const moveCard = (columns, cardId, to, now = new Date().toISOString()) => {
	const card = findCard(columns, cardId);
	if (!card || card.status === to || !columns[to]) return columns;
	const from = card.status;
	const moved = { ...card, status: to, statusChangedAt: now };
	return {
		...columns,
		[from]: { ...columns[from], count: Math.max(0, columns[from].count - 1), items: columns[from].items.filter((c) => c.id !== cardId) },
		[to]: { ...columns[to], count: columns[to].count + 1, items: insert(columns[to].items, moved, to) },
	};
};

/** Puts a card back exactly as it was (server refused the move). */
export const restoreCard = (columns, card, movedTo) => {
	const without = columns[movedTo]
		? { ...columns, [movedTo]: { ...columns[movedTo], count: Math.max(0, columns[movedTo].count - 1),
			items: columns[movedTo].items.filter((c) => c.id !== card.id) } }
		: columns;
	const home = without[card.status];
	return { ...without, [card.status]: { ...home, count: home.count + 1, items: insert(home.items, card, card.status) } };
};

/** Replaces a card by the server's version (who moved it, when) without touching its place. */
export const updateCard = (columns, card) => {
	const column = columns[card.status];
	if (!column) return columns;
	return { ...columns, [card.status]: { ...column, items: column.items.map((c) => (c.id === card.id ? { ...c, ...card } : c)) } };
};

/** One more page of a column: appended without repeating a card already shown. */
export const appendPage = (columns, status, page) => {
	const column = columns[status];
	const seen = new Set(column.items.map((c) => c.id));
	return {
		...columns,
		[status]: { count: page.count ?? column.count, items: [...column.items, ...(page.items ?? []).filter((c) => !seen.has(c.id))], nextCursor: page.nextCursor ?? null },
	};
};

/** A report from the API (status change answer) → the fields a card shows. */
export const cardFromReport = (report) => ({
	id: report.id,
	status: report.status,
	statusChangedAt: report.statusChangedAt ?? null,
	lastMove: report.statusHistory?.length ? report.statusHistory[report.statusHistory.length - 1] : null,
});
