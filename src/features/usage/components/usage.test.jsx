import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { MemoryRouter } from 'react-router-dom';
import ManageSearchOutlinedIcon from '@mui/icons-material/ManageSearchOutlined';
import { describe, expect, it } from 'vitest';
import '../../../i18n.js';
import { theme } from '../../../theme';
import { ACCOUNT_STATUS_DEMO, USER_ACCOUNT_STATUS, USER_AUTHORITIES } from '../../../constants.js';
import UsageMeterCard from './UsageMeterCard.jsx';
import UsagePlanHeader from './UsagePlanHeader.jsx';

const renderThemed = (ui) => render(
	<ThemeProvider theme={theme}><MemoryRouter>{ui}</MemoryRouter></ThemeProvider>,
);

const card = (props) => (
	<UsageMeterCard meterKey="screeningActions" label="Matching Actions" icon={ManageSearchOutlinedIcon}
		accent="#000" bg="#fff" consumed={500} limit={1000} {...props} />
);

describe('UsageMeterCard', () => {
	it('says what the meter counts and shows the pace', () => {
		renderThemed(card({ pace: { status: 'ON_TRACK' } }));
		expect(screen.getByText('One per resume analysed, and one per candidate scored against a job.')).toBeInTheDocument();
		expect(screen.getByTestId('usage-pace-screeningActions')).toHaveTextContent('On track');
	});

	it('dates the day the limit runs out at the current pace', () => {
		renderThemed(card({ pace: { status: 'WILL_EXCEED', limitReachedOn: '2026-10-18T00:00:00Z' } }));
		expect(screen.getByTestId('usage-pace-screeningActions')).toHaveTextContent(/runs out ~.*18/);
	});

	it('shows "Not metered" instead of crashing when the plan has no limit', () => {
		renderThemed(card({ limit: null, pace: { status: 'UNMETERED' } }));
		expect(screen.getAllByText('Not metered').length).toBeGreaterThan(0);
		expect(screen.queryByText(/% used/)).not.toBeInTheDocument();
	});
});

describe('UsagePlanHeader', () => {
	const data = {
		subscriptionTier: 'Pro',
		billingCycle: 'year',
		currentPeriodStart: '2026-09-01T00:00:00Z',
		currentPeriodEnd: '2099-09-01T00:00:00Z',
	};

	it('shows the tier, the billing cycle and the manage link for billing managers', () => {
		localStorage.setItem(USER_AUTHORITIES, JSON.stringify([{ action: 'UPDATE_SUBSCRIPTION', permission: 'ALLOWED' }]));
		renderThemed(<UsagePlanHeader data={data} />);
		expect(screen.getByText('Pro')).toBeInTheDocument();
		expect(screen.getByText('Billed yearly — limits cover the whole year')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Manage plan' })).toBeInTheDocument();
	});

	it('hides the manage link without the permission, and labels demo accounts', () => {
		localStorage.setItem(USER_ACCOUNT_STATUS, ACCOUNT_STATUS_DEMO);
		renderThemed(<UsagePlanHeader data={{ ...data, subscriptionTier: 'Starter' }} />);
		expect(screen.getByText('Demo account · Starter limits')).toBeInTheDocument();
		expect(screen.queryByRole('button', { name: 'Manage plan' })).not.toBeInTheDocument();
	});
});
