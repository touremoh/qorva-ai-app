import { expect, test } from '@playwright/test';
import { NOW } from './support/app.js';
import { mockApi, signIn } from './support/api.js';

// Resume upload (synchronous path, ≤ 20 files): the chosen files are posted, and the dialog then
// lists the per-file results; non-resume files are refused before anything is sent.

const pdf = (name) => ({ name, mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4\n%fake\n') });

test.describe('resume upload', () => {
	test('uploads the chosen resumes and shows each file\'s result', async ({ page }) => {
		const uploads = [];
		await page.clock.setFixedTime(NOW);
		await mockApi(page, {
			'POST /cvs/upload': (request) => {
				uploads.push(request.postDataBuffer()?.toString('latin1') ?? '');
				return { status: 200, body: [
					{ fileName: 'ada.pdf', status: 'CREATED', cv: { id: 'a'.repeat(24) } },
					{ fileName: 'alan.pdf', status: 'FAILED' },
				] };
			},
		});
		await signIn(page);
		await page.goto('/app/cvs');
		await page.waitForLoadState('networkidle');

		await page.getByRole('button', { name: /Bulk Upload Resumes/ }).click();
		await page.locator('input[type="file"]').setInputFiles([pdf('ada.pdf'), pdf('alan.pdf'), { name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('x') }]);
		await expect(page.getByText('2 files ready to upload')).toBeVisible();
		await page.getByRole('button', { name: 'Upload Files' }).click();

		await expect.poll(() => uploads.length).toBe(1);
		expect(uploads[0]).toContain('filename="ada.pdf"');
		expect(uploads[0]).toContain('filename="alan.pdf"');
		expect(uploads[0]).not.toContain('notes.txt');
		await expect(page.getByText('ada.pdf')).toBeVisible();
		await expect(page.getByText('alan.pdf')).toBeVisible();
	});
});
