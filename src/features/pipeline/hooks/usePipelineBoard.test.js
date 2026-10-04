import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import usePipelineBoard from './usePipelineBoard.js';
import * as pipelineService from '../api/pipelineService.js';
import * as reportService from '../../reports/api/reportService.js';

vi.mock('../api/pipelineService.js', () => ({ getBoard: vi.fn(), getColumn: vi.fn() }));
vi.mock('../../reports/api/reportService.js', () => ({ setReportStatus: vi.fn() }));

const boardBody = { columns: [
	{ status: 'NEW', count: 2, items: [{ id: 'a', status: 'NEW', score: 80, candidateName: 'Ada' }, { id: 'b', status: 'NEW', score: 60 }], nextCursor: 'n1' },
] };

describe('usePipelineBoard', () => {
	beforeEach(() => {
		localStorage.clear();
		pipelineService.getBoard.mockResolvedValue({ data: boardBody });
	});

	it('moves a card at once, saves it with where it was, and reports the move', async () => {
		reportService.setReportStatus.mockResolvedValue({ data: { id: 'a', status: 'SHORTLISTED', statusHistory: [{ byName: 'Me' }] } });
		const notify = vi.fn();
		const { result } = renderHook(() => usePipelineBoard({ notify }));
		await waitFor(() => expect(result.current.columns.NEW.count).toBe(2));

		await act(() => result.current.move('a', 'SHORTLISTED'));

		expect(reportService.setReportStatus).toHaveBeenCalledWith('a', 'SHORTLISTED', 'NEW');
		expect(result.current.columns.SHORTLISTED.items[0]).toMatchObject({ id: 'a', lastMove: { byName: 'Me' } });
		expect(result.current.columns.NEW.count).toBe(1);
		expect(notify).toHaveBeenCalledWith(expect.objectContaining({ kind: 'moved', from: 'NEW', to: 'SHORTLISTED', name: 'Ada' }));
	});

	it('puts the card back when the server refuses, and reloads when someone else moved it first', async () => {
		const notify = vi.fn();
		const { result } = renderHook(() => usePipelineBoard({ notify }));
		await waitFor(() => expect(result.current.columns.NEW.count).toBe(2));

		reportService.setReportStatus.mockRejectedValueOnce({ response: { status: 500 } });
		await act(() => result.current.move('a', 'HIRED'));
		expect(result.current.columns.NEW.items.map((c) => c.id)).toEqual(['a', 'b']);
		expect(result.current.columns.HIRED.count).toBe(0);
		expect(notify).toHaveBeenLastCalledWith({ kind: 'error', key: 'pipeline.errors.move' });

		pipelineService.getBoard.mockClear();
		reportService.setReportStatus.mockRejectedValueOnce({ response: { status: 409 } });
		await act(() => result.current.move('a', 'HIRED'));
		expect(notify).toHaveBeenLastCalledWith({ kind: 'error', key: 'pipeline.errors.conflict' });
		await waitFor(() => expect(pipelineService.getBoard).toHaveBeenCalled());
	});

	it('loads more of a column and remembers the chosen job', async () => {
		pipelineService.getColumn.mockResolvedValue({ data: { count: 3, items: [{ id: 'c', status: 'NEW' }], nextCursor: null } });
		const { result } = renderHook(() => usePipelineBoard({ notify: vi.fn() }));
		await waitFor(() => expect(result.current.columns.NEW.nextCursor).toBe('n1'));

		await act(() => result.current.loadMore('NEW'));
		expect(result.current.columns.NEW.items.map((c) => c.id)).toEqual(['a', 'b', 'c']);
		expect(pipelineService.getColumn).toHaveBeenCalledWith('NEW', expect.any(Object), 'n1');

		act(() => result.current.updateFilters({ jobPostId: 'job-9' }));
		await waitFor(() => expect(pipelineService.getBoard).toHaveBeenLastCalledWith(expect.objectContaining({ jobPostId: 'job-9' })));
		expect(localStorage.getItem('qorva:pipeline:job')).toBe('job-9');
	});
});
