import { expect, test } from '@playwright/test';
import { NOW } from './support/app.js';
import { mockApi, signIn } from './support/api.js';

// Qorva Help: the "?" opens the panel, a question is answered with "Open …" buttons to known pages only,
// links in the answer are plain text, and a support request ends with its reference.

const enabled = { 'GET /help/availability': () => ({ status: 200, body: { enabled: true } }) };

test.describe('qorva help', () => {
	test('answers a question and opens the page it points to', async ({ page }) => {
		await page.clock.setFixedTime(NOW);
		const asked = [];
		await mockApi(page, {
			...enabled,
			'POST /help/messages': (request) => {
				asked.push(request.postDataJSON());
				return { status: 200, body: {
					conversationId: '64b0c1a2e4b0f2a1b2c3d4e5',
					answer: '1. Open **Account Settings → Integrations**.\n2. Click **Connect** on Recruitee. See [docs](https://evil.test).',
					links: [{ key: 'settings.integrations' }],
					followUps: ['How do I set up real-time updates?'],
					offerSupport: false,
				} };
			},
		});
		await signIn(page);
		await page.goto('/app/dashboard');

		await page.getByTestId('help-launcher').click();
		await expect(page.getByTestId('help-drawer')).toBeVisible();
		await page.getByTestId('help-input').fill('How do I connect Recruitee?');
		await page.getByTestId('help-send').click();

		const answer = page.getByTestId('help-answer');
		await expect(answer.getByText('Click')).toBeVisible();
		await expect(answer.locator('a')).toHaveCount(0);
		expect(asked[0]).toMatchObject({ message: 'How do I connect Recruitee?', page: 'dashboard' });

		await answer.getByRole('button', { name: /^Open Integrations/ }).click();
		await expect(page).toHaveURL(/\/app\/settings\?tab=integrations/);
		// The panel stays open across pages, with the conversation.
		await expect(page.getByTestId('help-answer')).toBeVisible();
	});

	test('sends a support request and shows its reference', async ({ page }) => {
		await page.clock.setFixedTime(NOW);
		const tickets = [];
		await mockApi(page, {
			...enabled,
			'POST /help/tickets': (request) => {
				tickets.push(request.postDataJSON());
				return { status: 201, body: { reference: 'QH-ABC234' } };
			},
		});
		await signIn(page);
		await page.goto('/app/settings?tab=integrations');

		await page.getByTestId('help-launcher').click();
		await page.getByTestId('help-contact-support').click();
		await page.getByTestId('support-ticket-subject').fill('Sync fails');
		await page.getByTestId('support-ticket-description').fill('Recruitee shows Auth error since Monday.');
		await page.getByTestId('support-ticket-submit').click();

		await expect(page.getByTestId('support-ticket-sent')).toContainText('QH-ABC234');
		expect(tickets[0]).toMatchObject({ subject: 'Sync fails', page: 'settings.integrations', includeConversation: false });
	});

	test('a rate-limited question shows the API message inline, without a toast', async ({ page }) => {
		await page.clock.setFixedTime(NOW);
		await mockApi(page, {
			...enabled,
			'POST /help/messages': () => ({ status: 429, body: {
				errorCode: 'error.help.rate_limited', message: 'You have asked many questions in a short time. Try again in 12 minute(s), or contact support.', status: 429 } }),
		});
		await signIn(page);
		await page.goto('/app/dashboard');

		await page.getByTestId('help-launcher').click();
		await page.getByTestId('help-input').fill('Hello');
		await page.getByTestId('help-send').click();
		await expect(page.getByText('Try again in 12 minute(s)', { exact: false })).toBeVisible();
		await expect(page.locator('[data-sonner-toast]')).toHaveCount(0);
	});

	test('no button when Qorva Help is off', async ({ page }) => {
		await page.clock.setFixedTime(NOW);
		await mockApi(page);
		await signIn(page);
		await page.goto('/app/dashboard');
		await expect(page.getByText('Dashboard').first()).toBeVisible();
		await expect(page.getByTestId('help-launcher')).toHaveCount(0);
	});
});
