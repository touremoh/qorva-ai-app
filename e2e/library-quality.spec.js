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

	test('the AI summary explains the report and links to the issue it recommends fixing', async ({ page }) => {
		const calls = [];
		await page.clock.setFixedTime(NOW);
		await mockApi(page, {
			'GET /library-quality/issues': (request) => {
				calls.push(`issues ${new URL(request.url()).searchParams.get('issueKey')}`);
				return ok({ content: [], totalElements: 0, totalPages: 0, number: 0 });
			},
		});
		await signIn(page);
		await page.goto('/app/library-quality');

		const summary = page.getByTestId('quality-insight');
		await expect(summary.getByText('Your library is in fair shape, held back by missing contact details.')).toBeVisible();
		await summary.getByRole('button', { name: 'Show' }).click();
		await expect.poll(() => calls).toContain('issues MISSING_CONTACT');
	});

	test('without a summary the page keeps the plain verdict and shows no error', async ({ page }) => {
		await page.clock.setFixedTime(NOW);
		await mockApi(page, {
			'GET /library-quality/insight': () => ({ status: 503, body: { errorCode: 'error.library_quality.insight_unavailable', message: 'unavailable', status: 503 } }),
		});
		await signIn(page);
		await page.goto('/app/library-quality');

		await expect(page.getByText('Library Health')).toBeVisible();
		await page.waitForLoadState('networkidle');
		await expect(page.getByTestId('quality-insight')).toHaveCount(0);
		await expect(page.locator('[data-sonner-toast]')).toHaveCount(0);
	});
});
