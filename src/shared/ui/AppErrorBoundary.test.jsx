import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AppErrorBoundary from './AppErrorBoundary.jsx';

const Broken = () => { throw new Error('boom'); };

describe('AppErrorBoundary', () => {
	it('shows a recoverable error screen instead of a blank page', () => {
		vi.spyOn(console, 'error').mockImplementation(() => {});
		render(<AppErrorBoundary><Broken /></AppErrorBoundary>);
		expect(screen.getByRole('alert')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /reload/i })).toBeInTheDocument();
	});

	it('renders its children when nothing fails', () => {
		render(<AppErrorBoundary><p>fine</p></AppErrorBoundary>);
		expect(screen.getByText('fine')).toBeInTheDocument();
	});
});
