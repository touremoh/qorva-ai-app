// Browser end-to-end tests: the real app (Vite dev server) against a mocked API that replays
// responses exported from the backend's integration suite (e2e/fixtures/api.json).
import { defineConfig, devices } from '@playwright/test';
import { API_BASE } from './e2e/support/constants.js';

const PORT = 4174;

export default defineConfig({
	testDir: './e2e',
	fullyParallel: true,
	// Locally the suite shares the machine with IDEs and indexers; more than 4 browsers at once made
	// timing-sensitive flows (dialog transitions, debounced search) flaky. CI keeps Playwright's default.
	workers: process.env.CI ? undefined : 4,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
	expect: {
		// Screenshots are the design baseline: any pixel drift beyond anti-aliasing noise is a diff to review.
		toHaveScreenshot: { maxDiffPixelRatio: 0.002, animations: 'disabled', caret: 'hide', timeout: 15_000 },
	},
	use: {
		baseURL: `http://localhost:${PORT}`,
		trace: 'retain-on-failure',
		locale: 'en-GB',
		timezoneId: 'Europe/London',
	},
	projects: [
		{ name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 }, colorScheme: 'light' } },
		{ name: 'desktop-dark-os', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 }, colorScheme: 'dark' } },
		{ name: 'mobile', use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 }, colorScheme: 'light' } },
	],
	webServer: {
		command: `npx vite --port ${PORT} --strictPort`,
		url: `http://localhost:${PORT}`,
		reuseExistingServer: !process.env.CI,
		// A GA id is required at startup (the app crashes without one); its traffic is blocked by mockApi.
		env: { VITE_APP_API_BASE_URL: API_BASE, VITE_APP_GOOGLE_ANALYTICS_PIXEL: 'G-E2ETEST' },
		timeout: 120_000,
	},
});
