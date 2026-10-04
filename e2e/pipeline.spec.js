import { expect, test } from '@playwright/test';
import { NOW } from './support/app.js';
import { mockApi, seededReport, signIn } from './support/api.js';

// The candidate pipeline: its own page, a column per status, cards dragged (or moved from their menu) between
// columns, a move refused when someone else moved the candidate first, and the full report beside the board.

const OLIVER = '6ab7190e28a8f342d03d97a6';

const moved = (status) => ({ status: 200, body: { ...seededReport(OLIVER), status,
	statusHistory: [{ from: 'NEW', status, by: 'u1', byName: 'Ada Owner', via: 'APP', at: '2026-09-15T08:00:00Z' }] } });

const openBoard = async (page, overrides = {}) => {
	await page.clock.setFixedTime(NOW);
	const unknown = await mockApi(page, overrides);
	await signIn(page);
	await page.goto('/app/pipeline');
	await page.waitForLoadState('networkidle');
	return unknown;
};

const card = (page, name) => page.getByTestId('pipeline-card').filter({ hasText: name });

test.describe('candidate pipeline', () => {
	test('the menu opens the board with every status and New ordered by best score', async ({ page }) => {
		const unknown = await openBoard(page);

		await expect(page.getByTestId('pipeline-count-NEW')).toHaveText('3');
		await expect(page.getByTestId('pipeline-column-NEW').getByTestId('pipeline-card').first()).toContainText('Oliver Whitfield');
		await expect(page.getByTestId('pipeline-count-SHORTLISTED')).toHaveText('0');
		expect(unknown).toEqual([]);
	});

	test('dragging a card to another column moves the candidate', async ({ page }, testInfo) => {
		test.skip(testInfo.project.name === 'mobile', 'the drop column is off screen on a phone; the menu covers it');
		const patched = [];
		await openBoard(page, {
			[`PATCH /matching-reports/${OLIVER}/status`]: (request) => { patched.push(request.postDataJSON()); return moved('SHORTLISTED'); },
		});

		const from = await card(page, 'Oliver Whitfield').boundingBox();
		const to = await page.getByTestId('pipeline-column-SHORTLISTED').boundingBox();
		await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
		await page.mouse.down();
		await page.mouse.move(from.x + from.width / 2 + 20, from.y + from.height / 2, { steps: 5 });
		await page.mouse.move(to.x + to.width / 2, to.y + 80, { steps: 15 });
		await page.mouse.up();

		await expect.poll(() => patched).toEqual([{ status: 'SHORTLISTED', expectedStatus: 'NEW' }]);
		await expect(page.getByTestId('pipeline-count-SHORTLISTED')).toHaveText('1');
		await expect(page.getByTestId('pipeline-count-NEW')).toHaveText('2');
		await expect(page.getByTestId('pipeline-column-SHORTLISTED')).toContainText('Moved by Ada Owner');
		await expect(page.getByText('Oliver Whitfield moved to Shortlisted')).toBeVisible();
	});

	test('the "Move to" menu moves a candidate without dragging', async ({ page }) => {
		const patched = [];
		await openBoard(page, {
			[`PATCH /matching-reports/${OLIVER}/status`]: (request) => { patched.push(request.postDataJSON()); return moved('INTERVIEWING'); },
		});

		await card(page, 'Oliver Whitfield').getByRole('button', { name: 'Move to…' }).click();
		await page.getByRole('menuitem', { name: 'Interviewing' }).click();

		await expect.poll(() => patched).toEqual([{ status: 'INTERVIEWING', expectedStatus: 'NEW' }]);
		await expect(page.getByTestId('pipeline-count-INTERVIEWING')).toHaveText('1');
	});

	test('a move refused because someone else moved the candidate first reloads the board', async ({ page }) => {
		let boards = 0;
		await openBoard(page, {
			'GET /matching-reports/pipeline': () => { boards += 1; },
			[`PATCH /matching-reports/${OLIVER}/status`]: () => ({ status: 409, body: { errorCode: 'error.report.status_conflict' } }),
		});
		const before = boards;

		await card(page, 'Oliver Whitfield').getByRole('button', { name: 'Move to…' }).click();
		await page.getByRole('menuitem', { name: 'Hired' }).click();

		await expect(page.getByText(/Someone else moved this candidate in the meantime/)).toBeVisible();
		await expect.poll(() => boards).toBeGreaterThan(before);
		await expect(page.getByTestId('pipeline-count-NEW')).toHaveText('3');
	});

	test('a card opens its full report beside the board', async ({ page }) => {
		await openBoard(page);

		await card(page, 'Oliver Whitfield').click();

		const drawer = page.getByTestId('pipeline-report-drawer');
		await expect(drawer).toBeVisible();
		await expect(drawer.getByRole('button', { name: 'Status: New. Change it', exact: true })).toBeVisible();

		// The report lays out for the panel, not the window: two columns only when the panel has room for them,
		// and nothing spills out of the sidebar.
		const body = await drawer.getByTestId('report-body').boundingBox();
		const sidebar = await drawer.getByTestId('report-sidebar').boundingBox();
		if (body.width >= 900) {
			expect(sidebar.x).toBeGreaterThan(body.x + body.width / 2);
		} else {
			expect(sidebar.width).toBeGreaterThan(body.width - 80);
		}
		const overflowing = await drawer.getByTestId('report-sidebar').evaluate((side) => {
			const edge = side.getBoundingClientRect().right;
			return [...side.querySelectorAll('.MuiChip-root')].filter((chip) => chip.getBoundingClientRect().right > edge + 1).length;
		});
		expect(overflowing).toBe(0);
	});

	test('in a narrower panel the report switches to one column', async ({ page }, testInfo) => {
		test.skip(testInfo.project.name === 'mobile', 'already one column on a phone');
		await page.setViewportSize({ width: 960, height: 900 });
		await openBoard(page);

		await card(page, 'Oliver Whitfield').click();

		const drawer = page.getByTestId('pipeline-report-drawer');
		const body = await drawer.getByTestId('report-body').boundingBox();
		const sidebar = await drawer.getByTestId('report-sidebar').boundingBox();
		expect(body.width).toBeLessThan(900);
		expect(sidebar.width).toBeGreaterThan(body.width - 80);
	});
});
