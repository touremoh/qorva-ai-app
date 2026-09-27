import { lazy, Suspense } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';
import ConfigurationNav from './ConfigurationNav.jsx';
import * as tokens from '../../../theme/tokens.js';

const AppEmailTemplates = lazy(() => import('../../email-templates/components/AppEmailTemplates.jsx'));

/**
 * Everything that configures how Qorva behaves for the tenant. A new section (e.g. the AI agent)
 * is one entry here — no shell wiring needed. `?section=` deep-links a section.
 */
const CONFIG_SECTIONS = [
	{ id: 'email-templates', Icon: MarkEmailReadOutlinedIcon, labelKey: 'configuration.sections.emailTemplates', fallback: 'Email templates', Component: AppEmailTemplates },
];

const AppConfiguration = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const requested = searchParams.get('section');
	const active = CONFIG_SECTIONS.find((section) => section.id === requested) ?? CONFIG_SECTIONS[0];
	const { Component } = active;

	return (
		<Box sx={{ display: 'flex', width: '100%', height: '100%', overflow: 'hidden', backgroundColor: tokens.surface.subtle }}>
			<ConfigurationNav
				sections={CONFIG_SECTIONS}
				activeSection={active.id}
				onSelect={(id) => setSearchParams({ section: id }, { replace: true })}
			/>
			<Box sx={{ flex: 1, minWidth: 0, height: '100%' }}>
				<Suspense fallback={
					<Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
						<CircularProgress size={28} sx={{ color: tokens.brand.main }} />
					</Box>
				}>
					<Component />
				</Suspense>
			</Box>
		</Box>
	);
};

export default AppConfiguration;
