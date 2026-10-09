import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import '../../../i18n.js';
import { theme } from '../../../theme';
import Register from './Register.jsx';

// Plain functions, not spies: Vitest's spy re-wraps a rejected promise and reports it as unhandled.
const SUCCESS = () => Promise.resolve({ status: 200, data: { data: { success: true } } });
let registerReply = SUCCESS;
let registerCalls = 0;
vi.mock('../api/registrationService.js', () => ({
	registerUser: (body) => { registerCalls += 1; return registerReply(body); },
}));

const tracked = [];
vi.mock('../../../utils/tracking.js', () => ({
	trackEvent: (name, params) => { tracked.push({ name, params }); },
}));

const pickOption = (field) => {
	fireEvent.mouseDown(within(field.closest('.MuiFormControl-root')).getByRole('combobox'));
	fireEvent.click(within(screen.getByRole('listbox')).getAllByRole('option')[0]);
};

const fillAndSubmit = () => {
	render(<ThemeProvider theme={theme}><MemoryRouter><Register /></MemoryRouter></ThemeProvider>);
	const inputs = document.querySelectorAll('input');
	const byName = (name) => [...inputs].find((input) => input.name === name);
	fireEvent.change(byName('firstName'), { target: { name: 'firstName', value: 'Ada' } });
	fireEvent.change(byName('lastName'), { target: { name: 'lastName', value: 'Lovelace' } });
	fireEvent.change(byName('email'), { target: { name: 'email', value: 'ada@agency.test' } });
	fireEvent.change(byName('organizationName'), { target: { name: 'organizationName', value: 'Agency' } });
	pickOption(byName('recruitmentType'));
	pickOption(byName('organizationSize'));
	fireEvent.submit(document.querySelector('form'));
};

beforeEach(() => {
	tracked.length = 0;
	registerCalls = 0;
	registerReply = SUCCESS;
});

describe('Register', () => {
	it('reports one sign_up, without personal data, when the account is created', async () => {
		fillAndSubmit();
		await waitFor(() => expect(tracked).toHaveLength(1));
		expect(registerCalls).toBe(1);
		expect(tracked[0]).toEqual({ name: 'sign_up', params: { method: 'email' } });
	});

	it('reports nothing when registration fails', async () => {
		registerReply = () => Promise.reject(Object.assign(new Error('conflict'), { response: { status: 409, data: {} } }));
		fillAndSubmit();
		await waitFor(() => expect(registerCalls).toBe(1));
		await waitFor(() => expect(document.querySelector('button[type="submit"]')).toBeEnabled());
		expect(tracked).toEqual([]);
	});
});
