import { expect, test } from '@playwright/test';
import { NOW } from './support/app.js';
import { mockApi, signIn } from './support/api.js';

// Match reports: starting a matching run calls the API and swaps the pending banner for the progress bar.

test.describe('match reports', () => {
	test('running matching starts the screening and shows its progress', async ({ page }) => {
		const started = [];
		await page.clock.setFixedTime(NOW);
		await mockApi(page, {
			'POST /ai/start-screening': () => { started.push(true); return { status: 200, body: { code: 200, data: true, timestamp: '2026-09-16T10:00:00Z' } }; },
		});
		await signIn(page);
		await page.goto('/app/reports');
		await page.waitForLoadState('networkidle');

		await expect(page.getByText(/job post\(s\) ready for matching/)).toBeVisible();
		await page.getByRole('button', { name: 'Run Matching' }).click();

		await expect.poll(() => started.length).toBe(1);
		await expect(page.getByText('Matching in progress…')).toBeVisible();
		await expect(page.getByRole('button', { name: 'Run Matching' })).toBeHidden();
	});
});
