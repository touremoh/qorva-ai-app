import { expect, test } from '@playwright/test';
import { NOW } from './support/app.js';
import { loginResponse, mockApi, signIn } from './support/api.js';

// Copilot standing rules: the Rules tab (shown only when the backend enables rules), creating a rule,
// pausing it, its tasks in Activity, a rule proposed from the chat, and a digest email's link through login.

const RULE_ID = '6ab7190e28a8f342d03d9f11';
const RUN_ID = '6ab7190e28a8f342d03d9f12';
const JOB_ID = '6ab7190e28a8f342d03d97a1';
const JOB_TITLE = 'Senior Backend Engineer (Java/Spring)';

const json = (status, body) => ({ status, body });

const availability = (rulesEnabled) => ({
	'GET /agent/availability': () => json(200, { enabled: true, rulesEnabled, runsRemaining: 499, canViewTeam: true }),
	'GET /agent/runs/pending-approval/count': () => json(200, { count: 0 }),
});

const rule = (extra = {}) => ({
	id: RULE_ID,
	name: 'Invite strong matches',
	ownerEmail: 'owner@a.qorva.test',
	trigger: { type: 'CV_SCORED', jobPostId: JOB_ID, jobTitle: JOB_TITLE, minScore: 70, recommendedOnly: true },
	goalTemplate: 'Draft an interview invitation for {{candidates}} for {{job}}.',
	dailyRunCap: 20,
	status: 'ACTIVE',
	pausedReason: null,
	runsToday: 2,
	skippedToday: 0,
	lastRunId: null,
	lastFiredAt: '2026-09-16T09:00:00Z',
	nextRunAt: null,
	createdAt: '2026-09-15T09:00:00Z',
	canEdit: true,
	canPause: true,
	...extra,
});

test.describe('copilot rules', () => {
	test.skip(({ isMobile }) => isMobile, 'desktop layout');

	test.beforeEach(async ({ page }) => {
		await page.clock.setFixedTime(NOW);
	});

	test('the Rules tab appears only when the backend enables rules', async ({ page }) => {
		await mockApi(page, availability(false));
		await signIn(page);
		await page.goto('/app/copilot?tab=rules');
		await expect(page.getByTestId('copilot-tab-activity')).toBeVisible({ timeout: 15_000 });
		await expect(page.getByTestId('copilot-tab-rules')).toHaveCount(0);
		await expect(page.getByTestId('copilot-empty')).toBeVisible();
	});

	test('a rule is created from the dialog, with only the fields of its trigger', async ({ page }) => {
		let created = null;
		const unknown = await mockApi(page, {
			...availability(true),
			'GET /agent/rules': () => json(200, created ? [rule()] : []),
			'POST /agent/rules': (request) => {
				created = request.postDataJSON();
				return json(201, rule());
			},
		});
		await signIn(page);
		await page.goto('/app/copilot?tab=rules');
		await expect(page.getByTestId('copilot-rules-empty')).toBeVisible({ timeout: 15_000 });

		await page.getByTestId('copilot-rule-new').click();
		const dialog = page.getByTestId('copilot-rule-dialog');
		// Nothing is sent while the form is incomplete.
		await page.getByTestId('copilot-rule-save').click();
		await expect(dialog.getByText('Give the rule a name (up to 100 characters).')).toBeVisible();
		expect(created).toBeNull();

		await page.getByTestId('copilot-rule-name').fill('Invite strong matches');
		await dialog.getByLabel('Job', { exact: true }).click();
		await page.getByRole('option', { name: JOB_TITLE }).click();
		await page.getByTestId('copilot-rule-goal').fill('Draft an interview invitation for ');
		await dialog.getByRole('button', { name: 'Candidates' }).click();
		await page.getByTestId('copilot-rule-save').click();

		await expect(page.getByTestId('copilot-rule')).toContainText('When a candidate is scored on Senior Backend Engineer (Java/Spring) · score 70+ · recommended for interview');
		expect(created).toEqual({
			name: 'Invite strong matches',
			goalTemplate: 'Draft an interview invitation for {{candidates}}',
			dailyRunCap: 20,
			trigger: { type: 'CV_SCORED', jobPostId: JOB_ID, minScore: 70, recommendedOnly: true },
		});
		expect(unknown).toEqual([]);
	});

	test('a rule can be paused, and its tasks open in Activity', async ({ page }) => {
		let listed = null;
		await mockApi(page, {
			...availability(true),
			'GET /agent/rules': () => json(200, [rule()]),
			[`POST /agent/rules/${RULE_ID}/pause`]: () => json(200, rule({ status: 'PAUSED', pausedReason: 'MANUAL' })),
			'GET /agent/runs': (request) => {
				listed = new URL(request.url()).searchParams;
				return json(200, { items: [{ id: RUN_ID, conversationId: 'c', title: 'Invite strong matches', origin: 'RULE', ruleId: RULE_ID,
					ruleName: 'Invite strong matches', userEmail: 'owner@a.qorva.test', status: 'AWAITING_APPROVAL',
					goal: 'Draft an interview invitation for Ana Ruiz for Senior Backend Engineer (Java/Spring).', stepCount: 2,
					failureReason: null, canCancel: true, createdAt: '2026-09-16T09:00:00Z', finishedAt: null }], page: 0, size: 20, total: 1 });
			},
		});
		await signIn(page);
		await page.goto('/app/copilot?tab=rules');

		await page.getByTestId('copilot-rule-toggle').click();
		await expect(page.getByTestId('copilot-rule-status')).toHaveText('Paused');
		await expect(page.getByTestId('copilot-rule-toggle')).toHaveText('Resume');

		await page.getByRole('button', { name: 'See its tasks' }).click();
		await expect(page).toHaveURL(new RegExp(`tab=activity.*ruleId=${RULE_ID}|ruleId=${RULE_ID}.*tab=activity`));
		await expect(page.getByTestId('copilot-activity-row')).toContainText('Started by the rule “Invite strong matches”');
		expect(listed.get('ruleId')).toBe(RULE_ID);
		await expect(page.getByTestId('copilot-activity-rule-filter')).toBeVisible();
	});

	test('a rule proposed in the chat waits on a card', async ({ page }) => {
		const proposed = {
			id: RUN_ID, conversationId: 'c', title: 'Whenever someone scores 80+', origin: 'CHAT', userEmail: 'owner@a.qorva.test',
			status: 'AWAITING_APPROVAL', goal: 'Whenever someone scores 80+ on the Java job, draft an invitation', mentions: [],
			steps: [{ seq: 1, kind: 'TOOL_CALL', tool: 'propose_rule', state: 'PENDING', summaryKey: 'agent.step.propose_rule',
				summaryParams: { name: 'Invite strong matches' }, links: [] }],
			pendingActions: [{ actionId: 'act-1', stepSeq: 1, tool: 'propose_rule', status: 'PENDING', argsHash: 'h1', reason: null,
				preview: { name: 'Invite strong matches', goalTemplate: 'Draft an interview invitation for {{candidates}}.', dailyRunCap: 20,
					trigger: { type: 'CV_SCORED', jobPostId: JOB_ID, jobTitle: JOB_TITLE, minScore: 80, recommendedOnly: null } } }],
			approvalExpiresAt: '2026-09-17T10:00:00Z', finalAnswer: null, failureReason: null, stoppedEarly: false,
			canCancel: true, canApprove: true, createdAt: '2026-09-16T09:59:00Z', finishedAt: null,
		};
		let started = null;
		await mockApi(page, {
			...availability(true),
			'POST /agent/runs': (request) => {
				started = request.postDataJSON();
				return json(202, proposed);
			},
			[`GET /agent/runs/${RUN_ID}`]: () => json(200, proposed),
		});
		await signIn(page);
		await page.goto('/app/copilot');
		await page.getByPlaceholder(/Describe a task/).fill(proposed.goal);
		await page.getByPlaceholder(/Describe a task/).press('Enter');

		const card = page.getByTestId('copilot-action-card');
		await expect(card).toContainText('Create this rule?', { timeout: 10000 });
		await expect(card).toContainText('When a candidate is scored on Senior Backend Engineer (Java/Spring) · score 80+');
		await expect(card).toContainText('Up to 20 tasks a day');
		// The browser's time zone goes with the message, for a scheduled rule.
		expect(started.timeZone).toBeTruthy();
	});

	test("a digest email's link survives the login page", async ({ page }) => {
		const target = '/app/copilot?tab=activity&status=AWAITING_APPROVAL';
		let listed = null;
		await mockApi(page, {
			...availability(true),
			'GET /agent/runs': (request) => {
				listed = new URL(request.url()).searchParams;
				return json(200, { items: [], page: 0, size: 20, total: 0 });
			},
		});
		await page.goto(target);
		await expect(page).toHaveURL(/\/login\?next=%2Fapp%2Fcopilot/, { timeout: 15_000 });

		const { user } = loginResponse().data;
		await page.getByLabel(/email/i).first().fill(user.email);
		await page.getByLabel(/password/i).first().fill('Correct-Horse-9');
		await page.getByRole('button', { name: /sign in|log in|login/i }).first().click();

		await expect(page).toHaveURL(new RegExp(`${target.replace('?', '\\?')}$`), { timeout: 15_000 });
		await expect(page.getByTestId('copilot-activity-empty')).toBeVisible();
		expect(listed.get('status')).toBe('AWAITING_APPROVAL');
	});

	test('the login page never sends users outside the app', async ({ page }) => {
		await mockApi(page);
		await page.goto('/login?next=%2F%2Fevil.test');
		const { user } = loginResponse().data;
		await page.getByLabel(/email/i).first().fill(user.email);
		await page.getByLabel(/password/i).first().fill('Correct-Horse-9');
		await page.getByRole('button', { name: /sign in|log in|login/i }).first().click();
		await expect(page.getByText('Resumes', { exact: true }).first()).toBeVisible({ timeout: 15_000 });
		expect(new URL(page.url()).host).not.toContain('evil');
	});
});
