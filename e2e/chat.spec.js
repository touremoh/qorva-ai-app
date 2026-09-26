import { expect, test } from '@playwright/test';
import { NOW } from './support/app.js';
import { mockApi, signIn } from './support/api.js';

// AI resume chat: opening a chat shows its history; a sent message is posted and the reply appended.

const CHAT_ID = '6ab7190e28a8f342d03d97ac';

test.describe('resume chat', () => {
	test('sending a message posts it and shows the assistant reply', async ({ page }) => {
		const sent = [];
		await page.clock.setFixedTime(NOW);
		await mockApi(page, {
			[`POST /chats/${CHAT_ID}/messages`]: (request) => {
				sent.push(request.postDataJSON());
				// This endpoint answers with the assistant message itself, not the usual envelope.
				return { status: 200, body: {
					id: 'reply-1', chatId: CHAT_ID, role: 'ASSISTANT', content: 'Oliver has five years of Spring Boot.',
					createdAt: '2026-09-16T10:00:05Z',
				} };
			},
		});
		await signIn(page);
		await page.goto('/app/chat');
		await page.waitForLoadState('networkidle');

		await page.getByText('Screening follow-up').first().click();
		const box = page.getByPlaceholder('Ask about resume vs job…');
		await box.fill('How much Spring Boot experience?');
		await box.press('Enter');

		await expect.poll(() => sent).toEqual([{ content: 'How much Spring Boot experience?' }]);
		await expect(page.getByText('Oliver has five years of Spring Boot.')).toBeVisible();
	});
});
