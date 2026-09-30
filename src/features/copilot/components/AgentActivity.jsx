import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import MenuItem from '@mui/material/MenuItem';
import TablePagination from '@mui/material/TablePagination';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import { useAgentRun } from '../../../contexts/AgentRunContext.jsx';
import * as tokens from '../../../theme/tokens.js';
import useAgentActivity from '../hooks/useAgentActivity.js';
import { RUN_STATUS } from '../model/agentRun.js';
import AgentRunDrawer from './AgentRunDrawer.jsx';
import AgentRunTable from './AgentRunTable.jsx';

/** Activity tab: every Copilot task, the user's own or — for users who manage users — the team's. */
const AgentActivity = () => {
	const { t } = useTranslation();
	const { availability } = useAgentRun();
	const activity = useAgentActivity();
	const canViewTeam = !!availability?.canViewTeam;

	return (
		<Box sx={{ height: '100%', overflowY: 'auto', px: { xs: 2, md: 3 }, py: 2, backgroundColor: tokens.surface.subtle }}>
			<Box sx={{ maxWidth: 1100, mx: 'auto' }}>
				<Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5, mb: 2 }}>
					{canViewTeam && (
						<ToggleButtonGroup size="small" exclusive value={activity.scope} onChange={(_, v) => activity.changeScope(v)}>
							<ToggleButton value="mine" data-testid="copilot-scope-mine" sx={{ textTransform: 'none', fontSize: tokens.fontSize.caption }}>
								{t('copilot.activity.scope.mine')}
							</ToggleButton>
							<ToggleButton value="team" data-testid="copilot-scope-team" sx={{ textTransform: 'none', fontSize: tokens.fontSize.caption }}>
								{t('copilot.activity.scope.team')}
							</ToggleButton>
						</ToggleButtonGroup>
					)}
					<TextField
						select
						size="small"
						label={t('copilot.activity.filter.status')}
						value={activity.status}
						onChange={(e) => activity.setStatus(e.target.value)}
						sx={{ minWidth: 200, '& .MuiInputBase-root': { fontSize: tokens.fontSize.caption } }}
					>
						<MenuItem value="">{t('copilot.activity.filter.all')}</MenuItem>
						{Object.values(RUN_STATUS).map((s) => (
							<MenuItem key={s} value={s}>{t(`copilot.status.${s}`)}</MenuItem>
						))}
					</TextField>
				</Box>

				<Box sx={{ backgroundColor: tokens.surface.paper, border: `1px solid ${tokens.line.main}`, borderRadius: 2, overflow: 'hidden' }}>
					{activity.loading ? (
						<Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
							<CircularProgress size={22} sx={{ color: tokens.brand.text }} />
						</Box>
					) : activity.data.items.length === 0 ? (
						<Typography data-testid="copilot-activity-empty" sx={{ fontSize: tokens.fontSize.body2, color: tokens.ink.subtle, textAlign: 'center', py: 5 }}>
							{t('copilot.activity.empty')}
						</Typography>
					) : (
						<>
							<AgentRunTable items={activity.data.items} showUser={activity.scope === 'team'} onOpen={activity.openRun} />
							<TablePagination
								component="div"
								count={activity.data.total}
								page={activity.page}
								rowsPerPage={activity.pageSize}
								rowsPerPageOptions={[activity.pageSize]}
								onPageChange={(_, p) => activity.setPage(p)}
							/>
						</>
					)}
				</Box>
			</Box>

			<AgentRunDrawer open={activity.drawerOpen} run={activity.selectedRun} onClose={activity.closeRun} onCancel={activity.cancelRun} onRunUpdate={activity.updateRun} />
		</Box>
	);
};

export default AgentActivity;
