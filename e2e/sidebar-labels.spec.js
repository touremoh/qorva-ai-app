import { expect, test } from '@playwright/test';
import { NOW } from './support/app.js';
import { mockApi, signIn } from './support/api.js';

// Every sidebar label fits on one line in every language. The ellipsis in AppMenuList is only a
// safety net: a translation that needs it should be shortened under `menu.*` instead.

const LANGUAGES = ['en', 'fr', 'es', 'it', 'pt', 'de', 'nl'];

test.describe('sidebar labels', () => {
	test.skip(({ isMobile }) => isMobile, 'the sidebar is a drawer on phones; the full-width sidebar is what is measured');

	for (const language of LANGUAGES) {
		test(`fit on one line in ${language}`, async ({ page }) => {
			await page.clock.setFixedTime(NOW);
			await mockApi(page);
			await signIn(page);
			await page.addInitScript((lang) => localStorage.setItem('QORVA_USER_LANGUAGE', lang), language);
			await page.goto('/app/dashboard');

			const labels = page.getByTestId('menu-label');
			await expect(labels.first()).toBeVisible();
			const truncated = await labels.evaluateAll((nodes) => nodes
				.filter((node) => node.scrollWidth > node.clientWidth)
				.map((node) => node.textContent));
			expect(truncated, `labels cut off in ${language}`).toEqual([]);
			expect(await labels.count()).toBeGreaterThanOrEqual(9);
		});
	}
});
