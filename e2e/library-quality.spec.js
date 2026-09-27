import { expect, test } from '@playwright/test';
import { NOW } from './support/app.js';
import { mockApi, signIn } from './support/api.js';

// Library quality: opening an issue loads its resumes; dismissing one tells the API and reloads the report.

const ok = (data) => ({ status: 200, body: { code: 200, data, timestamp: '2026-09-16T10:00:00Z' } });

test.describe('library quality', () => {
	test('viewing an issue loads its resumes, and dismissing it reloads the report', async ({ page }) => {
		const calls = [];
		await page.clock.setFixedTime(NOW);
		await mockApi(page, {
			'GET /library-quality/issues': (request) => {
				calls.push(`issues ${new URL(request.url()).searchParams.get('issueKey')}`);
				return ok({ content: [], totalElements: 0, totalPages: 0, number: 0 });
			},
			'POST /library-quality/issues/MISSING_CONTACT/dismiss': () => { calls.push('dismiss MISSING_CONTACT'); return ok(true); },
		});
		page.on('request', (request) => {
			if (request.method() === 'GET' && new URL(request.url()).pathname.endsWith('/library-quality')) calls.push('report');
		});
		await signIn(page);
		await page.goto('/app/library-quality');
		await page.waitForLoadState('networkidle');

		await page.getByRole('button', { name: 'View' }).first().click();
		await expect.poll(() => calls).toContain('issues MISSING_CONTACT');

		const reportsBefore = calls.filter((c) => c === 'report').length;
		await page.getByRole('button', { name: /Dismiss/ }).first().click();
		await expect.poll(() => calls).toContain('dismiss MISSING_CONTACT');
		await expect.poll(() => calls.filter((c) => c === 'report').length).toBeGreaterThan(reportsBefore);
	});
});
