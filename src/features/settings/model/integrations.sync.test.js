import { describe, expect, it } from 'vitest';
import { syncLines } from './integrations.js';

describe('syncLines', () => {
	it('names each active connection, with when it last synced and whether that failed', () => {
		expect(syncLines([
			{ provider: 'greenhouse', displayName: 'Greenhouse EU', status: 'CONNECTED', lastSyncAt: '2026-10-04T08:00:00Z' },
			{ provider: 'lever', status: 'AUTH_ERROR', lastSyncAt: null },
			{ provider: 'recruitee', status: 'CONNECTED', lastSyncError: 'timeout' },
			{ provider: 'bamboohr', status: 'DISABLED' },
		])).toEqual([
			{ name: 'Greenhouse EU', at: '2026-10-04T08:00:00Z', failed: false },
			{ name: 'lever', at: null, failed: true },
			{ name: 'recruitee', at: null, failed: true },
		]);
	});

	it('is empty without an ATS', () => {
		expect(syncLines(undefined)).toEqual([]);
		expect(syncLines([])).toEqual([]);
	});
});
