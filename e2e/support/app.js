import { mockApi, signIn } from './api.js';

// Fixture timestamps are 2026-09-15; "now" is pinned the day after so relative dates never drift.
export const NOW = new Date('2026-09-16T10:00:00Z');

/** A signed-in tenant-A session on the mocked API, with the clock pinned. Returns unknown API calls. */
export async function openApp(page, path) {
	await page.clock.setFixedTime(NOW);
	const unknown = await mockApi(page);
	await signIn(page);
	await page.goto(path);
	await page.waitForLoadState('networkidle');
	return unknown;
}
