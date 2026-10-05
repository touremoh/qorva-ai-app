import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { describe, expect, it, vi } from 'vitest';
import '../../../../i18n.js';
import { theme } from '../../../../theme';
import UsersTable from './UsersTable.jsx';

const users = [
	{ id: 'u1', firstName: 'Nora', lastName: 'New', email: 'nora@acme.test', invitePending: true, authorities: [] },
	{ id: 'u2', firstName: 'Olga', lastName: 'Owner', email: 'olga@acme.test', authorities: [] },
];
const renderTable = (props) => render(
	<ThemeProvider theme={theme}>
		<UsersTable currentEmail="olga@acme.test" demo={false} loadingUsers={false} users={users}
			userDisplayName={(u) => `${u.firstName} ${u.lastName}`} openEditPermissions={vi.fn()} setUserToDelete={vi.fn()}
			onResendInvite={vi.fn()} resendingId={null} {...props} />
	</ThemeProvider>,
);

describe('UsersTable', () => {
	it('marks a pending invite and re-sends it from its row only', async () => {
		const onResendInvite = vi.fn();
		renderTable({ onResendInvite });

		expect(screen.getAllByText('Invite pending')).toHaveLength(1);
		const buttons = screen.getAllByRole('button', { name: 'Re-send invite' });
		expect(buttons).toHaveLength(1);
		await userEvent.click(buttons[0]);
		expect(onResendInvite).toHaveBeenCalledWith(users[0]);
	});

	it('offers no re-send to demo accounts, and none while one is being sent', () => {
		const { unmount } = renderTable({ demo: true });
		expect(screen.queryByRole('button', { name: 'Re-send invite' })).not.toBeInTheDocument();
		unmount();

		renderTable({ resendingId: 'u1' });
		expect(screen.getByRole('button', { name: 'Re-send invite' })).toBeDisabled();
	});
});
