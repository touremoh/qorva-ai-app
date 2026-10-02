import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import * as tokens from '../../../theme/tokens.js';
import CopilotChat from './CopilotChat.jsx';
import AgentActivity from './AgentActivity.jsx';
import AgentRules from './AgentRules.jsx';
import { useAgentRun } from '../../../contexts/AgentRunContext.jsx';


/**
 * Copilot: give it a task (Chat), follow every task (Activity), or let rules start tasks by themselves (Rules,
 * when standing rules are switched on). The tab lives in the URL (?tab=).
 */
const AppCopilot = () => {
	const { t } = useTranslation();
	const { availability } = useAgentRun();
	const [params, setParams] = useSearchParams();
	const tabs = availability?.rulesEnabled ? ['chat', 'activity', 'rules'] : ['chat', 'activity'];
	const tab = tabs.includes(params.get('tab')) ? params.get('tab') : 'chat';

	const select = (_, next) => {
		const nextParams = new URLSearchParams(params);
		nextParams.set('tab', next);
		if (next !== 'activity') {
			nextParams.delete('status');
			nextParams.delete('ruleId');
			nextParams.delete('origin');
			nextParams.delete('scope');
		}
		setParams(nextParams, { replace: true });
	};

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
			<Box sx={{ px: { xs: 2, md: 3 }, backgroundColor: tokens.surface.paper, borderBottom: `1px solid ${tokens.line.main}`, flexShrink: 0 }}>
				<Tabs value={tab} onChange={select} sx={{ minHeight: 44, '& .MuiTab-root': { minHeight: 44, textTransform: 'none', fontSize: tokens.fontSize.caption, fontWeight: 600 } }}>
					<Tab value="chat" label={t('copilot.tabs.chat')} data-testid="copilot-tab-chat" />
					<Tab value="activity" label={t('copilot.tabs.activity')} data-testid="copilot-tab-activity" />
					{tabs.includes('rules') && <Tab value="rules" label={t('copilot.tabs.rules')} data-testid="copilot-tab-rules" />}
				</Tabs>
			</Box>
			<Box sx={{ flex: 1, minHeight: 0 }}>
				{tab === 'chat' && <CopilotChat />}
				{tab === 'activity' && <AgentActivity />}
				{tab === 'rules' && <AgentRules />}
			</Box>
		</Box>
	);
};

export default AppCopilot;
