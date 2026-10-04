import { expect, test } from '@playwright/test';
import { NOW } from './support/app.js';
import { mockApi, signIn } from './support/api.js';

// Match reports: a matching run is started from the run dialog — chosen jobs, chosen Top N, cost shown first —
// and the page follows its real progress until the summary.

const run = (status, processed) => ({
	id: 'run-1', status, jobIds: ['j1', 'j2', 'j3', 'j4', 'j5'], topN: 15, total: 50, processed,
	generated: processed, reused: 0, failed: 0, skippedJobs: 0, failureReason: null,
});

test.describe('match reports', () => {
	test('running matching picks the out-of-date jobs and a Top N, shows the cost, then follows the run', async ({ page }) => {
		const started = [];
		let polls = 0;
		await page.clock.setFixedTime(NOW);
		await mockApi(page, {
			'POST /ai/matching-runs/estimate': () => ({ status: 200, body: {
				topN: 15, allowedTopN: [5, 10, 15, 20], defaultTopN: 10, candidates: 50, newReports: 42, reusedReports: 8,
				estimatedActions: 42, remainingActions: 9000, jobs: [],
			} }),
			'POST /ai/matching-runs': (request) => {
				started.push(request.postDataJSON());
				return { status: 202, body: { estimate: null, run: run('PENDING', 0) } };
			},
			'GET /ai/matching-runs/run-1': () => {
				polls += 1;
				return { status: 200, body: polls < 2 ? run('RUNNING', 20) : run('COMPLETED', 50) };
			},
		});
		await signIn(page);
		await page.goto('/app/reports');
		await page.waitForLoadState('networkidle');

		await expect(page.getByText(/job\(s\) have out-of-date matching results/)).toBeVisible();
		await page.getByRole('button', { name: 'Run Matching', exact: true }).click();

		const dialog = page.getByRole('dialog');
		await dialog.getByRole('button', { name: 'Select all out-of-date jobs' }).click();
		await dialog.getByRole('button', { name: 'Top 15', exact: true }).click();
		await expect(dialog.getByText(/42 new or changed report\(s\), 8 unchanged and reused for free/)).toBeVisible();
		await dialog.getByRole('button', { name: 'Run matching', exact: true }).click();

		await expect.poll(() => started.length).toBe(1);
		expect(started[0].topN).toBe(15);
		expect(started[0].jobIds.length).toBeGreaterThan(0);
		await expect(page.getByText(/You can leave this page/)).toBeVisible();
		await expect(page.getByText(/Matching finished: 50 new or updated report\(s\)/)).toBeVisible({ timeout: 15000 });
	});
});
