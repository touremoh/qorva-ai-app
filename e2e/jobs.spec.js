import { expect, test } from '@playwright/test';
import { NOW } from './support/app.js';
import { mockApi, signIn } from './support/api.js';

// Jobs: creating a job post in two steps (details, then scoring rules skipped) posts it to the API.

test.describe('jobs', () => {
	test('a job post is created from its title and description', async ({ page }) => {
		const created = [];
		await page.clock.setFixedTime(NOW);
		await mockApi(page, {
			'POST /jobs/scoring-rules/suggest': () => ({ status: 200, body: { code: 200, data: null, timestamp: '2026-09-16T10:00:00Z' } }),
			'POST /jobs': (request) => {
				const body = request.postDataJSON();
				created.push(body);
				return { status: 200, body: { code: 200, data: { ...body, id: '0123456789abcdef01234567' }, timestamp: '2026-09-16T10:00:00Z' } };
			},
		});
		await signIn(page);
		await page.goto('/app/jobs');
		await page.waitForLoadState('networkidle');

		await page.getByRole('button', { name: 'New Job Post' }).click();
		await page.getByLabel('Job Title').fill('Platform Engineer');
		await page.locator('.ql-editor').click();
		await page.keyboard.type('Own our Kubernetes platform.');
		await page.getByRole('button', { name: 'Next' }).click();
		await page.getByRole('button', { name: 'Skip' }).click();

		await expect.poll(() => created.length).toBe(1);
		expect(created[0]).toMatchObject({ title: 'Platform Engineer', status: 'open' });
		expect(created[0].description).toContain('Own our Kubernetes platform.');
		expect(created[0].scoringRules).toBeUndefined();
	});
});
