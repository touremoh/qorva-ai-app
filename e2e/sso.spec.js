import { expect, test } from '@playwright/test';
import { API_BASE } from './support/constants.js';
import { loginResponse, mockApi, signIn } from './support/api.js';

// "Sign in with Microsoft": the login page offers it when the environment does, sends the browser to the API's
// start route, and on the way back trades the one-time code for the session (or explains why not). Admins can
// require it for the whole company.

const available = { 'GET /auth/sso/availability': () => ({ status: 200, body: { microsoft: true } }) };

test.describe('Microsoft sign-in', () => {
	test('the button only appears when the environment offers it', async ({ page }) => {
		await mockApi(page);
		await page.goto('/login');
		await expect(page.getByLabel(/password/i).first()).toBeVisible();
		await expect(page.getByTestId('sso-microsoft')).toHaveCount(0);
	});

	test('the button sends the browser to Microsoft through the API with the typed email', async ({ page }) => {
		await mockApi(page, available);
		let started = null;
		await page.route(`${API_BASE}/auth/sso/microsoft/start**`, (route) => {
			started = route.request().url();
			return route.fulfill({ status: 200, contentType: 'text/html', body: '<p>Microsoft</p>' });
		});
		await page.goto('/login');
		await page.getByLabel(/email/i).first().fill('ana@acme.test');

		await page.getByTestId('sso-microsoft').click();

		await expect.poll(() => started).toContain('/auth/sso/microsoft/start?email=ana%40acme.test');
	});

	test('back from Microsoft, the one-time code signs the user in', async ({ page }) => {
		const exchanged = [];
		await mockApi(page, {
			...available,
			'POST /auth/sso/exchange': (request) => { exchanged.push(request.postDataJSON()); return { status: 200, body: loginResponse() }; },
		});
		await page.goto('/login?sso=one-time-code');

		await expect.poll(() => exchanged).toEqual([{ code: 'one-time-code' }]);
		await expect(page).toHaveURL(/\/$|\/app/, { timeout: 15_000 });
	});

	test('a refusal is explained on the login page', async ({ page }) => {
		await mockApi(page, available);
		await page.goto('/login?ssoError=no_account');

		await expect(page.getByText(/No active Qorva account uses this Microsoft identity/)).toBeVisible();
		await expect(page).toHaveURL(/\/login$/);
	});

	test('a password sign-in refused because the company requires Microsoft says so', async ({ page }) => {
		await mockApi(page, {
			...available,
			'POST /auth/login': () => ({ status: 403, body: { errorCode: 'error.auth.sso_required', message: 'Your company requires signing in with Microsoft.' } }),
		});
		await page.goto('/login');
		await page.getByLabel(/email/i).first().fill(loginResponse().data.user.email);
		await page.getByLabel(/password/i).first().fill('Correct-Horse-9');
		await page.getByRole('button', { name: /^sign in$/i }).click();

		await expect(page.getByText('Your company requires signing in with Microsoft.').first()).toBeVisible();
	});

	test('an admin requires Microsoft sign-in for the company, after confirming', async ({ page }) => {
		const saved = [];
		await mockApi(page, {
			...available,
			'PATCH /tenants/sso': (request) => { saved.push(request.postDataJSON()); return { status: 200, body: { ssoRequired: true } }; },
		});
		await signIn(page);
		await page.goto('/app/settings?tab=company');
		const card = page.getByTestId('company-sso-card');
		await card.getByRole('checkbox', { name: 'Require Microsoft sign-in' }).click();
		await page.getByRole('button', { name: 'Require it' }).click();

		await expect.poll(() => saved).toEqual([{ ssoRequired: true }]);
		await expect(card.getByRole('checkbox', { name: 'Require Microsoft sign-in' })).toBeChecked();
	});
});
