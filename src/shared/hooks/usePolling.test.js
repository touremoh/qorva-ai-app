import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import usePolling from './usePolling.js';

describe('usePolling', () => {
	beforeEach(() => { vi.useFakeTimers(); });
	afterEach(() => { vi.useRealTimers(); });

	it('ticks on the interval while active, and stops when inactive', () => {
		const tick = vi.fn();
		const { rerender } = renderHook(({ active }) => usePolling(tick, { active, intervalMs: 1000 }), { initialProps: { active: true } });
		vi.advanceTimersByTime(3000);
		expect(tick).toHaveBeenCalledTimes(3);
		rerender({ active: false });
		vi.advanceTimersByTime(3000);
		expect(tick).toHaveBeenCalledTimes(3);
	});

	it('gives up after the timeout', () => {
		const tick = vi.fn();
		renderHook(() => usePolling(tick, { intervalMs: 1000, timeoutMs: 2500 }));
		vi.advanceTimersByTime(10_000);
		expect(tick).toHaveBeenCalledTimes(2);
	});

	it('uses the latest tick without restarting the timer', () => {
		const first = vi.fn(); const second = vi.fn();
		const { rerender } = renderHook(({ fn }) => usePolling(fn, { intervalMs: 1000 }), { initialProps: { fn: first } });
		vi.advanceTimersByTime(600);
		rerender({ fn: second });
		vi.advanceTimersByTime(400);
		expect(first).not.toHaveBeenCalled();
		expect(second).toHaveBeenCalledTimes(1);
	});
});
