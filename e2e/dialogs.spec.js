import { expect, test } from '@playwright/test';
import { NOW } from './support/app.js';
import { mockApi, signIn } from './support/api.js';

// Confirm dialogs: confirming sends exactly one delete for the chosen record; cancelling sends none.

const ok = () => ({ status: 200, body: { code: 200, data: true, timestamp: '2026-09-16T10:00:00Z' } });

async function openWithDeletes(page, path, deletePattern) {
	const deletes = [];
	await page.clock.setFixedTime(NOW);
	await mockApi(page);
	// Registered after mockApi, so it is consulted first for DELETEs.
	await page.route(deletePattern, (route) => {
		if (route.request().method() !== 'DELETE') return route.fallback();
		deletes.push(new URL(route.request().url()).pathname);
		return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(ok().body) });
	});
	await signIn(page);
	await page.goto(path);
	await page.waitForLoadState('networkidle');
	return deletes;
}

test.describe('confirm dialogs', () => {
	test('deleting a match report asks first, then deletes that report', async ({ page }) => {
		const deletes = await openWithDeletes(page, '/app/reports', '**/matching-reports/*');
		await page.getByTestId('MoreVertIcon').first().click();
		await page.getByRole('menuitem', { name: 'Delete Report' }).click();

		const dialog = page.getByRole('dialog', { name: 'Confirm Deletion' });
		await expect(dialog).toBeVisible();
		await dialog.getByRole('button', { name: 'Cancel' }).click();
		await expect(dialog).toBeHidden();
		expect(deletes).toEqual([]);

		await page.getByTestId('MoreVertIcon').first().click();
		await page.getByRole('menuitem', { name: 'Delete Report' }).click();
		await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();
		await expect.poll(() => deletes.length).toBe(1);
		expect(deletes[0]).toMatch(/^\/matching-reports\/[0-9a-f]{24}$/);
	});

	test('deleting a job asks first, then deletes that job', async ({ page }) => {
		const deletes = await openWithDeletes(page, '/app/jobs', '**/jobs/*');
		await page.getByText('Senior Backend Engineer (Java/Spring)').first().click();
		await page.getByRole('button', { name: 'Remove Job Post' }).click();

		const dialog = page.getByRole('dialog', { name: 'Remove Job Post' });
		await expect(dialog).toBeVisible();
		await dialog.getByRole('button', { name: 'Confirm' }).click();
		await expect.poll(() => deletes.length).toBe(1);
		expect(deletes[0]).toMatch(/^\/jobs\/[0-9a-f]{24}$/);
	});

	test('deleting a resume asks first, then deletes that resume', async ({ page }) => {
		const deletes = await openWithDeletes(page, '/app/cvs', '**/cvs/*');
		await page.getByTestId('MoreVertIcon').first().click();
		await page.getByRole('menuitem', { name: /delete/i }).click();

		const dialog = page.getByRole('dialog', { name: 'Delete Resume' });
		await expect(dialog).toBeVisible();
		await dialog.getByRole('button', { name: 'Confirm' }).click();
		await expect.poll(() => deletes.length).toBe(1);
		expect(deletes[0]).toMatch(/^\/cvs\/[0-9a-f]{24}$/);
	});
});
