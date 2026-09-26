import { expect, test } from '@playwright/test';
import { NOW } from './support/app.js';
import { mockApi, signIn } from './support/api.js';

// Outreach composer: closing an edited message asks first; "Keep editing" keeps it, "Discard" closes it.

test.describe('candidate outreach', () => {
	test('closing an edited message asks before discarding it', async ({ page }) => {
		await page.clock.setFixedTime(NOW);
		await mockApi(page, {
			'POST /candidate-outreach/draft': () => ({ status: 200, body: { code: 200, data: { subject: 'Hello', body: 'Draft body' }, timestamp: '2026-09-16T10:00:00Z' } }),
		});
		await signIn(page);
		await page.goto('/app/cvs');
		await page.waitForLoadState('networkidle');
		await page.getByText('Oliver Whitfield').first().click();
		await expect(page.getByText('oliver.whitfield@example.com').first()).toBeVisible();

		await page.getByRole('button', { name: 'Email candidate' }).first().click();
		const message = page.getByRole('textbox', { name: 'Message' });
		await expect(message).toBeVisible();
		await message.fill('Hi Oliver, are you open to a chat?');

		await page.getByRole('button', { name: 'Close' }).last().click();
		const confirm = page.getByRole('dialog', { name: 'Discard this message?' });
		await expect(confirm).toBeVisible();
		await confirm.getByRole('button', { name: 'Keep editing' }).click();
		await expect(message).toHaveValue('Hi Oliver, are you open to a chat?');

		await page.getByRole('button', { name: 'Close' }).last().click();
		await page.getByRole('dialog', { name: 'Discard this message?' }).getByRole('button', { name: 'Discard' }).click();
		await expect(message).toBeHidden();
	});
});
