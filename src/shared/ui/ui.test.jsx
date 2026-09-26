import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import InboxIcon from '@mui/icons-material/Inbox';
import { describe, expect, it, vi } from 'vitest';
import { theme } from '../../theme';
import ConfirmDialog from './ConfirmDialog.jsx';
import SectionHeader from './SectionHeader.jsx';

const renderThemed = (ui) => render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

describe('SectionHeader', () => {
	it('shows the label, icon and action', () => {
		renderThemed(<SectionHeader icon={InboxIcon} label="Mailbox" action={<button type="button">Edit</button>} />);
		expect(screen.getByText('Mailbox')).toBeInTheDocument();
		expect(screen.getByTestId('InboxIcon')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
	});
});

describe('ConfirmDialog', () => {
	const setup = (props = {}) => {
		const handlers = { onConfirm: vi.fn(), onCancel: vi.fn() };
		renderThemed(
			<ConfirmDialog open title="Delete job?" confirmLabel="Delete" cancelLabel="Cancel" {...handlers} {...props}>
				This cannot be undone.
			</ConfirmDialog>,
		);
		return handlers;
	};

	it('confirms and cancels through its buttons', async () => {
		const { onConfirm, onCancel } = setup();
		expect(screen.getByText('This cannot be undone.')).toBeInTheDocument();
		await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
		await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
		expect(onConfirm).toHaveBeenCalledTimes(1);
		expect(onCancel).toHaveBeenCalledTimes(1);
	});

	it('cannot be dismissed or re-confirmed while busy', async () => {
		const { onConfirm, onCancel } = setup({ busy: true });
		expect(screen.getByLabelText('busy')).toBeInTheDocument();
		await userEvent.keyboard('{Escape}');
		expect(onCancel).not.toHaveBeenCalled();
		expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
		expect(onConfirm).not.toHaveBeenCalled();
	});

	it('shows the subject it applies to, and a delete icon when dangerous', () => {
		setup({ tone: 'danger', subject: <span>Quarterly hiring chat</span> });
		expect(screen.getByText('Quarterly hiring chat')).toBeInTheDocument();
		expect(screen.getByTestId('DeleteOutlineIcon')).toBeInTheDocument();
	});

	it('closes on Escape when idle', async () => {
		const { onCancel } = setup();
		await userEvent.keyboard('{Escape}');
		expect(onCancel).toHaveBeenCalledTimes(1);
	});
});
