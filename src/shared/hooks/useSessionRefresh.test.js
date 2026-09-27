import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TOKEN_EXPIRY } from '../../constants.js';
import useSessionRefresh, { REFRESH_LEAD_MS } from './useSessionRefresh.js';

const TEN_MIN = 10 * 60 * 1000;

const setExpiry = (msFromNow) => localStorage.setItem(TOKEN_EXPIRY, String(Date.now() + msFromNow));
const userActs = () => act(() => { window.dispatchEvent(new Event('pointerdown')); });

describe('useSessionRefresh', () => {
	let refresh;
	let onRefreshed;

	beforeEach(() => {
		vi.useFakeTimers();
		refresh = vi.fn(async () => {
			setExpiry(TEN_MIN);
			return { data: { data: 'renewed' } };
		});
		onRefreshed = vi.fn();
		setExpiry(TEN_MIN);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	const mount = (active = true) => renderHook(() => useSessionRefresh({ active, refresh, onRefreshed }));

	it('refreshes shortly before expiry when the user was active', async () => {
		mount();
		userActs();

		await act(async () => { await vi.advanceTimersByTimeAsync(TEN_MIN - REFRESH_LEAD_MS - 1000); });
		expect(refresh).not.toHaveBeenCalled();

		await act(async () => { await vi.advanceTimersByTimeAsync(2000); });
		expect(refresh).toHaveBeenCalledTimes(1);
		expect(onRefreshed).toHaveBeenCalledWith({ data: { data: 'renewed' } });
	});

	it('lets an idle session expire', async () => {
		mount();

		await act(async () => { await vi.advanceTimersByTimeAsync(TEN_MIN + 1000); });

		expect(refresh).not.toHaveBeenCalled();
	});

	it('refreshes at once when the user comes back inside the lead window', async () => {
		mount();
		await act(async () => { await vi.advanceTimersByTimeAsync(TEN_MIN - REFRESH_LEAD_MS + 1000); });
		expect(refresh).not.toHaveBeenCalled();

		userActs();
		await act(async () => { await vi.advanceTimersByTimeAsync(0); });

		expect(refresh).toHaveBeenCalledTimes(1);
	});

	it('does not refresh a token that has already expired', async () => {
		mount();
		await act(async () => { await vi.advanceTimersByTimeAsync(TEN_MIN + 1000); });

		userActs();
		await act(async () => { await vi.advanceTimersByTimeAsync(0); });

		expect(refresh).not.toHaveBeenCalled();
	});

	it('runs one refresh at a time and keeps the session going', async () => {
		let resolve;
		refresh.mockImplementationOnce(() => new Promise((r) => { resolve = r; }));
		mount();
		userActs();
		await act(async () => { await vi.advanceTimersByTimeAsync(TEN_MIN - REFRESH_LEAD_MS + 1000); });
		userActs();
		userActs();
		expect(refresh).toHaveBeenCalledTimes(1);

		await act(async () => {
			setExpiry(TEN_MIN);
			resolve({ data: { data: 'renewed' } });
		});
		userActs();
		await act(async () => { await vi.advanceTimersByTimeAsync(TEN_MIN - REFRESH_LEAD_MS + 1000); });

		expect(refresh).toHaveBeenCalledTimes(2);
	});

	it('does nothing until the session is authorised', async () => {
		mount(false);
		userActs();

		await act(async () => { await vi.advanceTimersByTimeAsync(TEN_MIN); });

		expect(refresh).not.toHaveBeenCalled();
	});
});
