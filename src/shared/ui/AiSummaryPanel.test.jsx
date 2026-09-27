import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { describe, expect, it, vi } from 'vitest';
import '../../i18n.js';
import { theme } from '../../theme';
import AiSummaryPanel from './AiSummaryPanel.jsx';

const renderThemed = (ui) => render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

const insight = {
	headline: 'Fair, held back by contact details.',
	explanation: '120 resumes have no email.',
	recommendations: [
		{ text: 'Re-analyze resumes without email.', issueKey: 'MISSING_EMAIL' },
		{ text: 'Review the library monthly.', issueKey: null },
	],
};

describe('AiSummaryPanel', () => {
	it('shows the summary and links only the recommendations tied to an issue', async () => {
		const onShowIssue = vi.fn();
		renderThemed(<AiSummaryPanel insight={insight} loading={false} onShowRef={onShowIssue} refOf={(r) => r.issueKey} />);

		expect(screen.getByText('Fair, held back by contact details.')).toBeInTheDocument();
		expect(screen.getByText('120 resumes have no email.')).toBeInTheDocument();
		const links = screen.getAllByRole('button');
		expect(links).toHaveLength(1);

		await userEvent.click(links[0]);
		expect(onShowIssue).toHaveBeenCalledWith('MISSING_EMAIL');
	});

	it('renders nothing when there is no summary', () => {
		const { container } = renderThemed(<AiSummaryPanel insight={null} loading={false} onShowRef={vi.fn()} refOf={(r) => r.issueKey} />);
		expect(container).toBeEmptyDOMElement();
	});

	it('shows a placeholder while the first summary loads', () => {
		renderThemed(<AiSummaryPanel insight={null} loading onShowRef={vi.fn()} refOf={(r) => r.issueKey} testId="quality-insight" />);
		expect(screen.getByTestId('quality-insight')).toBeInTheDocument();
		expect(screen.queryByRole('button')).not.toBeInTheDocument();
	});

	it('offers no link when the page has nothing to scroll to', () => {
		renderThemed(<AiSummaryPanel insight={insight} loading={false} />);
		expect(screen.getByText('Re-analyze resumes without email.')).toBeInTheDocument();
		expect(screen.queryByRole('button')).not.toBeInTheDocument();
	});
});
