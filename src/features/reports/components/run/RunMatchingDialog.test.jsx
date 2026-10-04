import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import '../../../../i18n.js';
import { theme } from '../../../../theme';
import RunMatchingDialog from './RunMatchingDialog.jsx';
import * as reportService from '../../api/reportService.js';
import * as jobService from '../../../jobs/api/jobService.js';

vi.mock('../../api/reportService.js', () => ({
	getMatchingRunOptions: vi.fn(),
	estimateMatchingRun: vi.fn(),
	startMatchingRun: vi.fn(),
}));
vi.mock('../../../jobs/api/jobService.js', () => ({ getJobs: vi.fn() }));

const page = (content) => ({ data: { data: { content, totalElements: content.length } } });
const backend = { id: 'job-1', title: 'Backend Lead', status: 'open', matchingReportsNeeded: true, matchingStaleReason: 'JOB_CHANGED',
	lastMatchedAt: '2026-10-01T10:00:00Z', matchingTopN: 10 };
const designer = { id: 'job-2', title: 'Product Designer', status: 'open', matchingReportsNeeded: false };

const renderDialog = (props = {}) => render(
	<ThemeProvider theme={theme}>
		<RunMatchingDialog open onClose={vi.fn()} {...props} />
	</ThemeProvider>,
);

describe('RunMatchingDialog', () => {
	beforeEach(() => {
		reportService.getMatchingRunOptions.mockResolvedValue({ data: { allowedTopN: [5, 10, 15, 20], defaultTopN: 10, maxTopN: 20 } });
		jobService.getJobs.mockImplementation((params) => Promise.resolve(page(params.matchingReportsNeeded ? [backend] : [backend, designer])));
		reportService.estimateMatchingRun.mockResolvedValue({ data: {
			topN: 10, candidates: 10, newReports: 3, reusedReports: 7, estimatedActions: 3, remainingActions: 50, jobs: [],
		} });
	});

	it('shows the jobs with why they are out of date, and locks the Top N above the plan', async () => {
		renderDialog();

		expect(await screen.findByText('Backend Lead')).toBeInTheDocument();
		expect(screen.getByText('Job changed since the last run')).toBeInTheDocument();
		await waitFor(() => expect(screen.getByRole('button', { name: /Top 25/ })).toBeDisabled());
		expect(screen.getByRole('button', { name: 'Top 20' })).toBeEnabled();
	});

	it('estimates the selection — only new reports are charged — and starts the run at the chosen Top N', async () => {
		reportService.startMatchingRun.mockResolvedValue({ data: { run: { id: 'run-1', status: 'PENDING' } } });
		const onStarted = vi.fn();
		renderDialog({ presetJobIds: ['job-1'], onStarted });

		await userEvent.click(await screen.findByRole('button', { name: 'Top 15' }));
		expect(await screen.findByText(/3 new or changed report\(s\), 7 unchanged and reused for free/)).toBeInTheDocument();
		expect(reportService.estimateMatchingRun).toHaveBeenLastCalledWith(['job-1'], 15);

		await userEvent.click(screen.getByRole('button', { name: 'Run matching' }));
		await waitFor(() => expect(reportService.startMatchingRun).toHaveBeenCalledWith(['job-1'], 15));
		expect(onStarted).toHaveBeenCalledWith({ id: 'run-1', status: 'PENDING' }, 1);
	});

	it('selects every out-of-date job in one click', async () => {
		renderDialog();
		await screen.findByText('Product Designer');

		await userEvent.click(screen.getByRole('button', { name: 'Select all out-of-date jobs' }));

		await waitFor(() => expect(screen.getByRole('checkbox', { name: 'Backend Lead' })).toBeChecked());
		expect(screen.getByRole('checkbox', { name: 'Product Designer' })).not.toBeChecked();
	});

	it('refuses to start when the period has fewer actions left than the run needs', async () => {
		reportService.estimateMatchingRun.mockResolvedValue({ data: {
			topN: 10, candidates: 10, newReports: 10, reusedReports: 0, estimatedActions: 10, remainingActions: 4, jobs: [],
		} });
		renderDialog({ presetJobIds: ['job-1'] });

		expect(await screen.findByText(/Not enough screening actions left/)).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Run matching' })).toBeDisabled();
	});
});
