import { expect, test } from '@playwright/test';
import { openApp, NOW } from './support/app.js';
import { loginResponse, mockApi } from './support/api.js';

// Each authenticated tab: renders its own title, and needs no API call the fixture lacks.
const TABS = [
	['dashboard', 'Dashboard'],
	['cvs', 'Resume Library'],
	['library-quality', 'Library Quality'],
	['email-templates', 'Email Templates'],
	['jobs', 'Jobs'],
	['intelligence', 'Talent Intelligence'],
	['reports', 'Match Reports'],
	['chat', 'AI Resume Chat'],
	['usage', 'Usage Monitoring'],
	['settings', 'Account Settings'],
];

test.describe('app shell', () => {
	for (const [tab, title] of TABS) {
		test(`${tab} renders with the recorded API`, async ({ page }) => {
			const unknown = await openApp(page, `/app/${tab}`);
			await expect(page.getByText(title, { exact: true }).first()).toBeVisible();
			expect(unknown, 'API calls missing from e2e/fixtures/api.json').toEqual([]);
		});
	}

	test('dashboard shows the seeded tenant', async ({ page }) => {
		await openApp(page, '/app/dashboard');
		await expect(page.getByText('Senior Backend Engineer (Java/Spring)').first()).toBeVisible();
		await expect(page.getByText('Oliver Whitfield').first()).toBeVisible();
	});

	test('opening a resume shows its details', async ({ page }) => {
		await openApp(page, '/app/cvs');
		await page.getByText('Oliver Whitfield').first().click();
		await expect(page.getByText('oliver.whitfield@example.com').first()).toBeVisible();
	});
});

test.describe('sign-in', () => {
	test('valid credentials land on the dashboard', async ({ page }) => {
		await page.clock.setFixedTime(NOW);
		const unknown = await mockApi(page);
		await page.goto('/login');
		const { user } = loginResponse().data;
		await page.getByLabel(/email/i).first().fill(user.email);
		await page.getByLabel(/password/i).first().fill('Correct-Horse-9');
		await page.getByRole('button', { name: /sign in|log in|login/i }).first().click();
		await expect(page.getByText('Resumes', { exact: true }).first()).toBeVisible({ timeout: 15_000 });
		expect(unknown).toEqual([]);
	});

	test('wrong credentials stay on the login page with an error', async ({ page }) => {
		await page.clock.setFixedTime(NOW);
		await mockApi(page, {
			'POST /auth/login': () => ({ status: 401, body: { code: 401, errorCode: 'error.auth.authentication_failed', message: 'Authentication failed' } }),
		});
		await page.goto('/login');
		await page.getByLabel(/email/i).first().fill('owner@a.qorva.test');
		await page.getByLabel(/password/i).first().fill('wrong');
		await page.getByRole('button', { name: /sign in|log in|login/i }).first().click();
		await expect(page).toHaveURL(/\/login/);
	});
});

test.describe('settings', () => {
	test('the integrations tab lists the ATS providers from the recorded API', async ({ page }) => {
		const unknown = await openApp(page, '/app/settings');
		await page.getByText('Integrations', { exact: true }).first().click();
		await expect(page.getByText('Connect your ATS to import candidates and jobs automatically', { exact: false })).toBeVisible();
		for (const provider of ['Greenhouse', 'Recruitee', 'Workable', 'Manatal']) {
			await expect(page.getByText(provider, { exact: true })).toBeVisible();
		}
		expect(unknown, 'API calls missing from e2e/fixtures/api.json').toEqual([]);
	});
});
