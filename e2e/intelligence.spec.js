import { expect, test } from '@playwright/test';
import { NOW } from './support/app.js';
import { mockApi, signIn } from './support/api.js';

// Talent Intelligence shows each question the recruiter asked above its answer — both for a new
// question and when a saved conversation is reopened (regression: questions vanished after F10).

const SAVED_QUESTION = 'How many senior backend engineers do we have?';

const answer = (question) => ({
	status: 200,
	body: {
		conversationId: '6ab7190e28a8f342d03d97af',
		question,
		intent: 'TALENT_POOL_INTELLIGENCE',
		answerText: 'You have 2 candidates in Belgium.',
		candidates: [],
		totalCandidateCount: 2,
		metrics: [],
		charts: [],
		followUpQuestions: [],
		disclaimer: null,
	},
});

test.describe('talent intelligence', () => {
	test.skip(({ isMobile }) => isMobile, 'the conversation list is desktop layout');

	test.beforeEach(async ({ page }) => {
		await page.clock.setFixedTime(NOW);
	});

	test('a reopened conversation shows its question above the answer', async ({ page }) => {
		await mockApi(page);
		await signIn(page);
		await page.goto('/app/intelligence');

		await page.getByText('Senior backend engineers').first().click();
		await expect(page.getByText(SAVED_QUESTION, { exact: true })).toBeVisible();
		await expect(page.getByText('You have 4 senior backend engineers.')).toBeVisible();
	});

	test('a new question stays on screen with its answer', async ({ page }) => {
		const question = 'Who knows Kotlin in Belgium?';
		await mockApi(page, { 'POST /library-insights/ask': () => answer(question) });
		await signIn(page);
		await page.goto('/app/intelligence');

		const input = page.getByRole('textbox').last();
		await input.click();
		await input.fill(question);
		await input.press('Enter');

		await expect(page.getByText('You have 2 candidates in Belgium.')).toBeVisible();
		await expect(page.getByText(question, { exact: true })).toBeVisible();
	});
});
