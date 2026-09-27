import { expect, test } from '@playwright/test';
import { NOW } from './support/app.js';
import { loginResponse, mockApi, signIn } from './support/api.js';

/** Opens the app like openApp(), with per-test API overrides. */
async function open(page, path, overrides = {}) {
	await page.clock.setFixedTime(NOW);
	const unknown = await mockApi(page, overrides);
	await signIn(page);
	await page.goto(path);
	await page.waitForLoadState('networkidle');
	return unknown;
}

test.describe('account settings', () => {
	test('saving a user\'s permissions keeps and can grant Talent Intelligence', async ({ page }) => {
		let saved = null;
		await open(page, '/app/settings?tab=users', {
			'PUT /users/6ab7190d28a8f342d03d978a/authorities': (request) => {
				saved = request.postDataJSON();
				return { status: 200, body: null };
			},
		});

		const row = page.getByRole('row').filter({ hasText: 'viewer@a.qorva.test' });
		await row.getByRole('button', { name: 'Manage Permissions' }).click();
		const toggle = page.getByText('Ask Talent Intelligence', { exact: true }).locator('..').getByRole('checkbox');
		await expect(toggle).not.toBeChecked();
		await toggle.check();
		await page.getByRole('button', { name: 'Save Changes' }).click();

		await expect.poll(() => saved).not.toBeNull();
		const actions = saved.authorities.map((a) => a.action);
		expect(actions).toEqual(expect.arrayContaining(['VIEW_CV', 'VIEW_LIBRARY_INSIGHTS']));
	});

	test('the ATS OAuth callback lands on Integrations and shows its result', async ({ page }) => {
		await open(page, '/app/settings?tab=integrations&atsOauth=connected');

		await expect(page.getByText('ATS connected successfully.')).toBeVisible();
		await expect(page).not.toHaveURL(/atsOauth=/);
	});

	test('without UPDATE_SUBSCRIPTION the billing portal is not offered', async ({ page }) => {
		const login = structuredClone(loginResponse());
		login.data.user.authorities = login.data.user.authorities.filter((a) => a.action !== 'UPDATE_SUBSCRIPTION');
		await open(page, '/app/settings?tab=billing', {
			'POST /auth/token/refresh': () => ({ status: 200, body: login }),
		});

		await expect(page.getByText('Billing is managed by an account owner.', { exact: false })).toBeVisible();
		await expect(page.getByRole('button', { name: /Billing/ })).toHaveCount(0);
	});

	test('with UPDATE_SUBSCRIPTION the billing portal is offered', async ({ page }) => {
		await open(page, '/app/settings?tab=billing');

		await expect(page.getByText('Billing is managed by an account owner.', { exact: false })).toHaveCount(0);
		await expect(page.getByRole('button').filter({ hasText: 'Billing' }).first()).toBeVisible();
	});
});
