import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { NOW } from './support/app.js';
import { mockApi, signIn } from './support/api.js';

// Copilot: shown only when the backend enables it, runs a task and shows what it did, reopens a saved
// conversation, and lists tasks in Activity. The agent itself is scripted: the API answers are fixed.

const RUN_ID = '6ab7190e28a8f342d03d9f01';
const CONVERSATION_ID = '6ab7190e28a8f342d03d9f02';
const GOAL = 'How many senior Java developers do we have?';

const json = (status, body) => ({ status, body });

// The task Activity opens, as recorded in the fixture.
const FIXTURE = JSON.parse(readFileSync(new URL('./fixtures/api.json', import.meta.url), 'utf8'));
const FIXTURE_RUN_ID = Object.keys(FIXTURE).find((k) => /^GET \/agent\/runs\/[0-9a-f]{24}$/.test(k)).split('/').pop();
const FIXTURE_RUN = FIXTURE[`GET /agent/runs/${FIXTURE_RUN_ID}`];

const run = (status, extra = {}) => ({
	id: RUN_ID,
	conversationId: CONVERSATION_ID,
	title: GOAL,
	origin: 'CHAT',
	userEmail: 'owner@a.qorva.test',
	status,
	goal: GOAL,
	mentions: [],
	steps: [],
	finalAnswer: null,
	failureReason: null,
	stoppedEarly: false,
	canCancel: status === 'QUEUED' || status === 'RUNNING',
	canApprove: false,
	createdAt: '2026-09-16T09:59:00Z',
	finishedAt: null,
	...extra,
});

const completed = run('COMPLETED', {
	steps: [{
		seq: 1, kind: 'TOOL_CALL', tool: 'search_cvs', state: 'OK', summaryKey: 'agent.step.search_cvs',
		summaryParams: { count: '7' }, links: [{ type: 'CV', id: 'cv-1', label: 'Ana Ruiz' }],
	}],
	finalAnswer: 'You have **7** senior Java developers.',
	finishedAt: '2026-09-16T10:00:00Z',
});

const enabled = {
	'GET /agent/availability': () => json(200, { enabled: true, rulesEnabled: false, runsRemaining: 499, canViewTeam: true }),
	'GET /agent/runs/pending-approval/count': () => json(200, { count: 0 }),
};

test.describe('copilot', () => {
	test.skip(({ isMobile }) => isMobile, 'the conversation list is desktop layout');

	test.beforeEach(async ({ page }) => {
		await page.clock.setFixedTime(NOW);
	});

	test('the menu shows Copilot only when the backend enables it', async ({ page }) => {
		await mockApi(page);
		await signIn(page);
		await page.goto('/app/dashboard');
		await expect(page.getByTestId('menu-label').filter({ hasText: 'Resume Library' })).toBeVisible();
		await expect(page.getByTestId('menu-label').filter({ hasText: /^Copilot$/ })).toHaveCount(0);

		await page.unrouteAll({ behavior: 'ignoreErrors' });
		await mockApi(page, enabled);
		await page.reload();
		await expect(page.getByTestId('menu-label').filter({ hasText: /^Copilot$/ })).toBeVisible();
	});

	test('a task runs, shows its steps and its answer', async ({ page }) => {
		let polls = 0;
		const unknown = await mockApi(page, {
			...enabled,
			'POST /agent/runs': (request) => {
				expect(request.postDataJSON().goal).toBe(GOAL);
				return json(202, run('QUEUED'));
			},
			[`GET /agent/runs/${RUN_ID}`]: () => json(200, ++polls < 2 ? run('RUNNING') : completed),
		});
		await signIn(page);
		await page.goto('/app/copilot');

		await expect(page.getByTestId('copilot-empty')).toBeVisible();
		await page.getByPlaceholder(/Describe a task/).fill(GOAL);
		await page.getByPlaceholder(/Describe a task/).press('Enter');

		await expect(page.getByText(GOAL, { exact: true }).first()).toBeVisible();
		await expect(page.getByText('Searched the resume library: 7 found')).toBeVisible({ timeout: 10000 });
		await expect(page.getByTestId('copilot-answer')).toContainText('You have 7 senior Java developers.');
		await expect(page.getByTestId('copilot-run-status').first()).toHaveText('Done');
		await expect(page.getByRole('button', { name: 'Ana Ruiz' })).toBeVisible();
		expect(unknown).toEqual([]);
	});

	test('changes Copilot made read as sentences, and a draft says it was not sent', async ({ page }) => {
		const unknown = await mockApi(page, {
			...enabled,
			'POST /agent/runs': () => json(202, run('COMPLETED', {
				steps: [
					{ seq: 1, kind: 'TOOL_CALL', tool: 'add_cv_tags', state: 'OK', summaryKey: 'agent.step.add_cv_tags',
						summaryParams: { count: '2', tags: 'shortlist' }, links: [] },
					{ seq: 2, kind: 'TOOL_CALL', tool: 'draft_outreach', state: 'OK', summaryKey: 'agent.step.draft_outreach',
						summaryParams: { name: 'Ana Ruiz' }, links: [] },
				],
				finalAnswer: 'Tagged 2 candidates and drafted an intro for Ana Ruiz.',
				finishedAt: '2026-09-16T10:00:00Z',
			})),
		});
		await signIn(page);
		await page.goto('/app/copilot');

		await page.getByPlaceholder(/Describe a task/).fill('Tag the top 2 and draft an intro');
		await page.getByPlaceholder(/Describe a task/).press('Enter');

		await expect(page.getByText('Tagged 2 candidate(s): shortlist')).toBeVisible();
		await expect(page.getByText('Drafted an email to Ana Ruiz (not sent)')).toBeVisible();
		expect(unknown).toEqual([]);
	});

	const awaiting = run('AWAITING_APPROVAL', {
		canApprove: true,
		approvalExpiresAt: '2026-09-17T10:00:00Z',
		steps: [{ seq: 1, kind: 'TOOL_CALL', tool: 'send_outreach_email', state: 'PENDING', summaryKey: 'agent.step.send_outreach_email',
			summaryParams: { name: 'Ana Ruiz' }, links: [], draft: null }],
		pendingActions: [{ actionId: 'act-1', stepSeq: 1, tool: 'send_outreach_email', status: 'PENDING', argsHash: 'h1', reason: null,
			preview: { cvId: 'cv-1', candidateName: 'Ana Ruiz', to: 'ana@x.test', from: 'owner@a.qorva.test', subject: 'Intro', body: 'Hello' } }],
	});

	test('an email waits on a card, and is sent only after the recruiter edits and approves it', async ({ page }) => {
		let decision = null;
		await mockApi(page, {
			...enabled,
			'POST /agent/runs': () => json(202, run('QUEUED')),
			[`GET /agent/runs/${RUN_ID}`]: () => json(200, decision ? run('COMPLETED', {
				steps: [{ seq: 1, kind: 'TOOL_CALL', tool: 'send_outreach_email', state: 'OK', summaryKey: 'agent.step.email_sent',
					summaryParams: { name: 'Ana Ruiz' }, links: [] }],
				finalAnswer: 'Sent the intro to Ana Ruiz.', finishedAt: '2026-09-16T10:01:00Z',
			}) : awaiting),
			[`POST /agent/runs/${RUN_ID}/actions/act-1/approve`]: (request) => {
				decision = request.postDataJSON();
				return json(200, run('QUEUED'));
			},
		});
		await signIn(page);
		await page.goto('/app/copilot');
		await page.getByPlaceholder(/Describe a task/).fill('Email Ana an intro');
		await page.getByPlaceholder(/Describe a task/).press('Enter');

		const card = page.getByTestId('copilot-action-card');
		await expect(card).toContainText('Ana Ruiz <ana@x.test>', { timeout: 10000 });
		await expect(page.getByText('Email to Ana Ruiz')).toBeVisible();
		await page.getByTestId('copilot-action-body').fill('Hello, edited');
		await page.getByTestId('copilot-action-approve').click();

		await expect(page.getByTestId('copilot-answer')).toContainText('Sent the intro to Ana Ruiz.', { timeout: 10000 });
		expect(decision).toEqual({ argsHash: 'h1', body: 'Hello, edited' });
		await expect(page.getByText('Sent an email to Ana Ruiz')).toBeVisible();
	});

	test('rejecting a card sends the reason to Copilot', async ({ page }) => {
		let decision = null;
		await mockApi(page, {
			...enabled,
			'POST /agent/runs': () => json(202, awaiting),
			[`GET /agent/runs/${RUN_ID}`]: () => json(200, awaiting),
			[`POST /agent/runs/${RUN_ID}/actions/act-1/reject`]: (request) => {
				decision = request.postDataJSON();
				return json(200, run('QUEUED'));
			},
		});
		await signIn(page);
		await page.goto('/app/copilot');
		await page.getByPlaceholder(/Describe a task/).fill('Email Ana an intro');
		await page.getByPlaceholder(/Describe a task/).press('Enter');

		await page.getByTestId('copilot-action-reject').click();
		await page.getByTestId('copilot-action-reason').fill('Not before Friday');
		await page.getByTestId('copilot-action-confirm-reject').click();

		await expect.poll(() => decision).toEqual({ argsHash: 'h1', reason: 'Not before Friday' });
	});

	test('a draft opens in the email composer, filled in', async ({ page }) => {
		await mockApi(page, {
			...enabled,
			'POST /agent/runs': () => json(202, run('COMPLETED', {
				steps: [{ seq: 1, kind: 'TOOL_CALL', tool: 'draft_outreach', state: 'OK', summaryKey: 'agent.step.draft_outreach',
					summaryParams: { name: 'Oliver Whitfield' }, links: [],
					draft: { cvId: 'cv-1', jobId: null, subject: 'Hello Oliver', body: 'Would you be open to a chat?' } }],
				finalAnswer: 'Here is a draft.', finishedAt: '2026-09-16T10:00:00Z',
			})),
		});
		await signIn(page);
		await page.goto('/app/copilot');
		await page.getByPlaceholder(/Describe a task/).fill('Draft an intro to Oliver');
		await page.getByPlaceholder(/Describe a task/).press('Enter');

		await page.getByTestId('copilot-open-draft').click();

		await expect(page.getByRole('textbox', { name: 'Subject' })).toHaveValue('Hello Oliver');
		await expect(page.getByRole('textbox', { name: 'Message' })).toHaveValue('Would you be open to a chat?');
	});

	test('a draft opened from a task in Activity can be edited in the composer', async ({ page }) => {
		// The task drawer is modal: it used to pull focus back from the composer, so nothing could be typed.
		const ruleRun = JSON.parse(JSON.stringify(FIXTURE_RUN));
		ruleRun.body.steps = [{ seq: 1, kind: 'TOOL_CALL', tool: 'draft_outreach', state: 'OK', summaryKey: 'agent.step.draft_outreach',
			summaryParams: { name: 'Oliver Whitfield' }, links: [],
			draft: { cvId: 'cv-1', jobId: null, subject: 'Interview invitation', body: 'Would you be open to an interview?' } }];
		await mockApi(page, { ...enabled, [`GET /agent/runs/${FIXTURE_RUN_ID}`]: () => ruleRun });
		await signIn(page);
		await page.goto('/app/copilot?tab=activity');

		await page.getByTestId('copilot-activity-row').first().click();
		await page.getByTestId('copilot-run-drawer').getByTestId('copilot-open-draft').click();

		const subject = page.getByRole('textbox', { name: 'Subject' });
		await expect(subject).toHaveValue('Interview invitation');
		await subject.fill('Interview invitation — Backend Lead');
		await expect(subject).toHaveValue('Interview invitation — Backend Lead');
		await page.getByRole('textbox', { name: 'Message' }).press('End');
		await page.keyboard.type(' Next week works.');
		await expect(page.getByRole('textbox', { name: 'Message' })).toHaveValue('Would you be open to an interview? Next week works.');
	});

	test('the limit is explained inline, without a toast', async ({ page }) => {
		await mockApi(page, {
			...enabled,
			'POST /agent/runs': () => json(403, { errorCode: 'error.usage.agent_limit_exceeded', message: 'limit', status: 403 }),
		});
		await signIn(page);
		await page.goto('/app/copilot');

		await page.getByTestId('copilot-example').first().click();
		await page.getByPlaceholder(/Describe a task/).press('Enter');

		await expect(page.getByTestId('copilot-error')).toContainText("Copilot task limit for this period has been reached");
		await expect(page.locator('[data-sonner-toast]')).toHaveCount(0);
	});

	test('a saved conversation reopens with its tasks', async ({ page }) => {
		await mockApi(page, enabled);
		await signIn(page);
		await page.goto('/app/copilot');

		await page.getByTestId('copilot-conversation').first().click();
		await expect(page.getByText('Who are our best Java candidates?', { exact: true })).toBeVisible();
		await expect(page.getByTestId('copilot-answer')).toContainText('One strong Java candidate.');
	});

	test('activity lists tasks, the team view adds the user, a row opens the task', async ({ page }) => {
		await mockApi(page, enabled);
		await signIn(page);
		await page.goto('/app/copilot?tab=activity');

		await expect(page.getByTestId('copilot-activity-row')).toHaveCount(1);
		await page.getByTestId('copilot-scope-team').click();
		await expect(page.getByRole('cell', { name: 'owner@a.qorva.test' })).toBeVisible();

		await page.getByTestId('copilot-activity-row').first().click();
		await expect(page.getByTestId('copilot-run-drawer')).toContainText('One strong Java candidate.');
	});
});
