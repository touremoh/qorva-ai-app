import PropTypes from 'prop-types';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { describe, expect, it, vi } from 'vitest';
import '../../../i18n.js';
import { theme } from '../../../theme';
import PipelineCard from './PipelineCard.jsx';

const card = { id: 'r1', status: 'NEW', candidateName: 'Ada Lovelace', jobPostTitle: 'Backend Lead', score: 82, lastMove: null };
// As on the board: a drag starts only after the pointer travels, so a click stays a click.
const Board = ({ children }) => {
	const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
	return <DndContext sensors={sensors}>{children}</DndContext>;
};
Board.propTypes = { children: PropTypes.node };
const renderCard = (props) => render(
	<ThemeProvider theme={theme}><Board><PipelineCard card={card} onOpen={vi.fn()} onMove={vi.fn()} {...props} /></Board></ThemeProvider>,
);

describe('PipelineCard', () => {
	it('moves the candidate from the "Move to" menu without opening the report', async () => {
		const onMove = vi.fn();
		const onOpen = vi.fn();
		renderCard({ canMove: true, onMove, onOpen, showJob: true });

		expect(screen.getByText('Backend Lead')).toBeInTheDocument();
		await userEvent.click(screen.getByRole('button', { name: 'Move to…' }));
		await userEvent.click(screen.getByRole('menuitem', { name: 'Interviewing' }));

		expect(onMove).toHaveBeenCalledWith('r1', 'INTERVIEWING');
		expect(onOpen).not.toHaveBeenCalled();
		expect(screen.queryByRole('menuitem', { name: 'New' })).not.toBeInTheDocument();
	});

	it('opens the report on click, and offers no move without permission', async () => {
		const onOpen = vi.fn();
		renderCard({ canMove: false, onOpen });

		await userEvent.click(screen.getByText('Ada Lovelace'));

		expect(onOpen).toHaveBeenCalledWith(card);
		expect(screen.queryByRole('button', { name: 'Move to…' })).not.toBeInTheDocument();
	});
});
