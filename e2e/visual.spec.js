import { expect, test } from '@playwright/test';
import { openApp, NOW } from './support/app.js';
import { mockApi } from './support/api.js';

// Design baselines. Font rendering differs per OS, so these run locally (macOS baselines are
// committed) and CI skips them with --grep-invert @visual. Any diff must be an intended design change.

const TABS = ['dashboard', 'cvs', 'library-quality', 'email-templates', 'jobs', 'intelligence', 'reports', 'chat', 'usage', 'settings'];

test.describe('screens @visual', () => {
	for (const tab of TABS) {
		test(`tab ${tab}`, async ({ page }) => {
			await openApp(page, `/app/${tab}`);
			await expect(page).toHaveScreenshot(`tab-${tab}.png`, { fullPage: true });
		});
	}

	test('resume details', async ({ page }) => {
		await openApp(page, '/app/cvs');
		await page.getByText('Oliver Whitfield').first().click();
		await expect(page.getByText('oliver.whitfield@example.com').first()).toBeVisible();
		await page.waitForLoadState('networkidle');
		await expect(page).toHaveScreenshot('cv-details.png', { fullPage: true });
		await page.emulateMedia({ media: 'print' });
		await expect(page).toHaveScreenshot('cv-details-print.png', { fullPage: true });
	});

	test('match report details', async ({ page }) => {
		await openApp(page, '/app/reports');
		await page.getByText('Oliver Whitfield').first().click();
		await page.waitForLoadState('networkidle');
		await expect(page).toHaveScreenshot('report-details.png', { fullPage: true });
		await page.emulateMedia({ media: 'print' });
		await expect(page).toHaveScreenshot('report-details-print.png', { fullPage: true });
	});

	for (const path of ['/login', '/register', '/forgot-password']) {
		test(`public page ${path}`, async ({ page }) => {
			await page.clock.setFixedTime(NOW);
			await mockApi(page);
			await page.goto(path);
			await page.waitForLoadState('networkidle');
			await expect(page).toHaveScreenshot(`public${path.replace(/\//g, '-')}.png`, { fullPage: true });
		});
	}
});
