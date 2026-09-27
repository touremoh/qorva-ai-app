import { expect, test } from '@playwright/test';
import { NOW } from './support/app.js';
import { mockApi, signIn } from './support/api.js';

// Usage monitoring: the plan is named, each allowance says what it counts, and the AI summary
// explains the consumption (no "Show" links — the whole page is already in view).

test.describe('usage monitoring', () => {
	test('shows the plan, what each allowance counts, and the AI summary', async ({ page }) => {
		await page.clock.setFixedTime(NOW);
		await mockApi(page);
		await signIn(page);
		await page.goto('/app/usage');

		await expect(page.getByTestId('usage-plan').getByText('Pro', { exact: true })).toBeVisible();
		await expect(page.getByText('Billed monthly')).toBeVisible();
		await expect(page.getByText('One per resume analysed, and one per candidate scored against a job.')).toBeVisible();
		await expect(page.getByTestId('usage-pace-screeningActions')).toHaveText('On track');

		const summary = page.getByTestId('usage-insight');
		await expect(summary.getByText('You are comfortably within your Pro plan.')).toBeVisible();
		await expect(summary.getByText('Upload resumes in batches, then run matching once.')).toBeVisible();
		await expect(summary.getByRole('button', { name: 'Show' })).toHaveCount(0);
	});

	test('without a summary the meters still show and no error pops up', async ({ page }) => {
		await page.clock.setFixedTime(NOW);
		await mockApi(page, {
			'GET /usage-monitoring/insight': () => ({ status: 503, body: { errorCode: 'error.usage.insight_unavailable', message: 'unavailable', status: 503 } }),
		});
		await signIn(page);
		await page.goto('/app/usage');

		await expect(page.getByTestId('usage-meter-aiResumeChats')).toBeVisible();
		await page.waitForLoadState('networkidle');
		await expect(page.getByTestId('usage-insight')).toHaveCount(0);
		await expect(page.locator('[data-sonner-toast]')).toHaveCount(0);
	});
});
