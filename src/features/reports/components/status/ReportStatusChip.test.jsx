import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { describe, expect, it, vi } from 'vitest';
import '../../../../i18n.js';
import { theme } from '../../../../theme';
import ReportStatusChip from './ReportStatusChip.jsx';

const renderChip = (props) => render(<ThemeProvider theme={theme}><ReportStatusChip {...props} /></ThemeProvider>);
const report = { id: 'r1', status: 'CONTACTED' };

describe('ReportStatusChip', () => {
	it('moves the candidate to the status picked from the pipeline', async () => {
		const onChange = vi.fn();
		renderChip({ report, onChange });

		await userEvent.click(screen.getByRole('button', { name: /Status: Contacted/ }));
		await userEvent.click(screen.getByRole('menuitem', { name: 'Shortlisted' }));

		expect(onChange).toHaveBeenCalledWith(report, 'SHORTLISTED');
	});

	it('does nothing when the current status is picked again', async () => {
		const onChange = vi.fn();
		renderChip({ report, onChange });

		await userEvent.click(screen.getByRole('button', { name: /Status: Contacted/ }));
		await userEvent.click(screen.getByRole('menuitem', { name: 'Contacted' }));

		expect(onChange).not.toHaveBeenCalled();
	});

	it('is read-only without a change handler', () => {
		renderChip({ report: { id: 'r2' } });

		expect(screen.getByText('New')).toBeInTheDocument();
		expect(screen.queryByRole('button', { name: /Status:/ })).not.toBeInTheDocument();
	});
});
