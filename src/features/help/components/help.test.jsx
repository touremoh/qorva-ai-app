import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import '../../../i18n.js';
import { theme } from '../../../theme';
import HelpAnswer from './HelpAnswer.jsx';
import SupportTicketDialog from './SupportTicketDialog.jsx';
import { helpErrorMessage } from '../hooks/useHelpConversation.js';

// A plain function, not a spy: Vitest's spy re-wraps a rejected promise and reports it as unhandled.
const ticketCalls = [];
let ticketReply = () => Promise.resolve({ data: {} });
vi.mock('../api/helpService.js', () => ({
	getHelpAvailability: () => Promise.resolve({ data: { enabled: true } }),
	sendHelpMessage: () => Promise.resolve({ data: {} }),
	createSupportTicket: (body) => { ticketCalls.push(body); return ticketReply(body); },
}));

const renderThemed = (ui) => render(<ThemeProvider theme={theme}><MemoryRouter>{ui}</MemoryRouter></ThemeProvider>);
const noop = () => {};

describe('HelpAnswer', () => {
	it('renders links as text and offers only known pages as buttons', () => {
		const onNavigate = vi.fn();
		const { container } = renderThemed(
			<HelpAnswer
				message={{
					text: 'Open **Integrations**. See [the guide](https://evil.test/x) ![x](https://evil.test/p.png)',
					links: ['settings.integrations', 'https://evil.test', 'constructor'],
					followUps: ['How do I test it?'],
					offerSupport: true,
				}}
				onNavigate={onNavigate} onAsk={noop} onContactSupport={noop}
			/>,
		);
		expect(container.querySelector('a')).toBeNull();
		expect(container.querySelector('img')).toBeNull();
		expect(screen.getByText(/the guide/)).toBeInTheDocument();
		const buttons = screen.getAllByRole('button', { name: /^Open / });
		expect(buttons).toHaveLength(1);
		fireEvent.click(buttons[0]);
		expect(onNavigate).toHaveBeenCalledWith('/app/settings?tab=integrations');
		expect(screen.getByTestId('help-answer-support')).toBeInTheDocument();
		expect(screen.getByText('How do I test it?')).toBeInTheDocument();
	});

	it('asks a follow-up when its chip is clicked', () => {
		const onAsk = vi.fn();
		renderThemed(<HelpAnswer message={{ text: 'Ok', followUps: ['And Lever?'] }} onNavigate={noop} onAsk={onAsk} onContactSupport={noop} />);
		fireEvent.click(screen.getByText('And Lever?'));
		expect(onAsk).toHaveBeenCalledWith('And Lever?');
		expect(screen.queryByTestId('help-answer-support')).toBeNull();
	});
});

describe('SupportTicketDialog', () => {
	beforeEach(() => { ticketCalls.length = 0; });

	it('is pre-filled, needs a description, and shows the reference once sent', async () => {
		ticketReply = () => Promise.resolve({ data: { reference: 'QH-ABC234' } });
		renderThemed(<SupportTicketDialog open onClose={noop} conversationId="64b0c1a2e4b0f2a1b2c3d4e5"
			defaultSubject="Sync fails" page="settings.integrations" />);
		expect(screen.getByTestId('support-ticket-subject')).toHaveValue('Sync fails');
		expect(screen.getByTestId('support-ticket-submit')).toBeDisabled();
		fireEvent.change(screen.getByTestId('support-ticket-description'), { target: { value: 'Auth error since Monday' } });
		fireEvent.click(screen.getByTestId('support-ticket-submit'));
		await waitFor(() => expect(screen.getByTestId('support-ticket-sent')).toHaveTextContent('QH-ABC234'));
		expect(ticketCalls).toEqual([{
			conversationId: '64b0c1a2e4b0f2a1b2c3d4e5', subject: 'Sync fails', description: 'Auth error since Monday',
			includeConversation: true, page: 'settings.integrations',
		}]);
	});

	it('shows the API message when the request is refused', async () => {
		const refused = Object.assign(new Error('429'), { response: { status: 429, data: {
			errorCode: 'error.help.ticket_rate_limited', message: 'You have sent several support requests today.' } } });
		ticketReply = () => Promise.reject(refused);
		renderThemed(<SupportTicketDialog open onClose={noop} defaultSubject="Hi" />);
		fireEvent.change(screen.getByTestId('support-ticket-description'), { target: { value: 'Help' } });
		fireEvent.click(screen.getByTestId('support-ticket-submit'));
		await waitFor(() => expect(screen.getByText('You have sent several support requests today.')).toBeInTheDocument());
		expect(ticketCalls[0]).toMatchObject({ includeConversation: false });
	});
});

describe('helpErrorMessage', () => {
	const t = (key) => key;
	it('uses the translated API message for help errors only', () => {
		expect(helpErrorMessage({ response: { data: { errorCode: 'error.help.rate_limited', message: 'Wait 5 minutes' } } }, t))
			.toBe('Wait 5 minutes');
		expect(helpErrorMessage({ response: { data: { errorCode: 'error.http.unexpected', message: 'Stack…' } } }, t))
			.toBe('help.errors.generic');
		expect(helpErrorMessage(new Error('network'), t)).toBe('help.errors.generic');
	});
});
