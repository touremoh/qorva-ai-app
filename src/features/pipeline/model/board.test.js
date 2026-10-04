import { describe, expect, it } from 'vitest';
import { appendPage, cardFromReport, findCard, fromBoard, moveCard, restoreCard, updateCard } from './board.js';

const card = (id, status, score) => ({ id, status, score, candidateName: id });
const board = () => fromBoard({ columns: [
	{ status: 'NEW', count: 30, items: [card('a', 'NEW', 90), card('b', 'NEW', 70), card('c', 'NEW', 50)], nextCursor: 'x' },
	{ status: 'SHORTLISTED', count: 1, items: [card('s', 'SHORTLISTED', 60)], nextCursor: null },
] });

describe('board model', () => {
	it('has every status, empty when the API sent none', () => {
		const columns = fromBoard(null);
		expect(Object.keys(columns)).toEqual(['NEW', 'CONTACTED', 'SHORTLISTED', 'INTERVIEWING', 'OFFERED', 'HIRED', 'REJECTED', 'WITHDRAWN']);
		expect(columns.HIRED).toEqual({ count: 0, items: [], nextCursor: null });
	});

	it('moves a card to the top of a column and both counts follow', () => {
		const moved = moveCard(board(), 'b', 'SHORTLISTED', '2026-10-04T10:00:00Z');
		expect(moved.NEW.count).toBe(29);
		expect(moved.NEW.items.map((c) => c.id)).toEqual(['a', 'c']);
		expect(moved.SHORTLISTED.count).toBe(2);
		expect(moved.SHORTLISTED.items[0]).toMatchObject({ id: 'b', status: 'SHORTLISTED', statusChangedAt: '2026-10-04T10:00:00Z' });
	});

	it('puts a card moved back to New at its score position, and ignores a move to the same column', () => {
		const back = moveCard(board(), 's', 'NEW');
		expect(back.NEW.items.map((c) => c.id)).toEqual(['a', 'b', 's', 'c']);
		expect(moveCard(board(), 'a', 'NEW')).toEqual(board());
	});

	it('restores a refused move exactly', () => {
		const before = board();
		const original = findCard(before, 'b');
		const restored = restoreCard(moveCard(before, 'b', 'HIRED'), original, 'HIRED');
		expect(restored.NEW.items.map((c) => c.id)).toEqual(['a', 'b', 'c']);
		expect(restored.NEW.count).toBe(30);
		expect(restored.HIRED.count).toBe(0);
	});

	it('appends a page without repeating a card and takes the server count', () => {
		const next = appendPage(board(), 'NEW', { count: 31, items: [card('c', 'NEW', 50), card('d', 'NEW', 40)], nextCursor: null });
		expect(next.NEW.items.map((c) => c.id)).toEqual(['a', 'b', 'c', 'd']);
		expect(next.NEW).toMatchObject({ count: 31, nextCursor: null });
	});

	it('takes who moved a card from the server answer', () => {
		const update = cardFromReport({ id: 's', status: 'SHORTLISTED', statusChangedAt: 't', statusHistory: [{ byName: 'Ana' }] });
		expect(updateCard(board(), update).SHORTLISTED.items[0]).toMatchObject({ id: 's', lastMove: { byName: 'Ana' }, score: 60 });
	});
});
