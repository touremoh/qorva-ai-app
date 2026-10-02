import PropTypes from 'prop-types';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import * as tokens from '../../../theme/tokens.js';
import RunStatusChip from './RunStatusChip.jsx';

const cellText = { fontSize: tokens.fontSize.caption, color: tokens.ink.body };

const formatDate = (value, language) => {
	if (!value) return '—';
	try {
		return new Intl.DateTimeFormat(language, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
	} catch {
		return value;
	}
};

/** One row per run; the user column only when looking at the team. */
const AgentRunTable = ({ items, showUser, onOpen }) => {
	const { t, i18n } = useTranslation();
	return (
		<Table size="small" data-testid="copilot-activity-table">
			<TableHead>
				<TableRow>
					<TableCell sx={cellText}>{t('copilot.activity.columns.task')}</TableCell>
					{showUser && <TableCell sx={cellText}>{t('copilot.activity.columns.user')}</TableCell>}
					<TableCell sx={cellText}>{t('copilot.activity.columns.status')}</TableCell>
					<TableCell sx={{ ...cellText, display: { xs: 'none', md: 'table-cell' } }}>{t('copilot.activity.columns.started')}</TableCell>
				</TableRow>
			</TableHead>
			<TableBody>
				{items.map((run) => (
					<TableRow key={run.id} hover onClick={() => onOpen(run.id)} data-testid="copilot-activity-row" sx={{ cursor: 'pointer' }}>
						<TableCell sx={{ maxWidth: 360 }}>
							<Typography sx={{ ...cellText, color: tokens.ink.strong, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
								{run.goal}
							</Typography>
							{run.origin === 'RULE' && (
								<Typography sx={{ fontSize: tokens.fontSize.micro, color: tokens.ink.faintest }}>
									{run.ruleName ? t('copilot.activity.fromNamedRule', { name: run.ruleName }) : t('copilot.activity.fromRule')}
								</Typography>
							)}
						</TableCell>
						{showUser && <TableCell sx={cellText}>{run.userEmail}</TableCell>}
						<TableCell><RunStatusChip status={run.status} /></TableCell>
						<TableCell sx={{ ...cellText, display: { xs: 'none', md: 'table-cell' } }}>{formatDate(run.createdAt, i18n.language)}</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
};

AgentRunTable.propTypes = {
	items: PropTypes.arrayOf(PropTypes.shape({
		id: PropTypes.string,
		goal: PropTypes.string,
		origin: PropTypes.string,
		ruleName: PropTypes.string,
		userEmail: PropTypes.string,
		status: PropTypes.string,
		createdAt: PropTypes.string,
	})).isRequired,
	showUser: PropTypes.bool,
	onOpen: PropTypes.func.isRequired,
};

export default AgentRunTable;
