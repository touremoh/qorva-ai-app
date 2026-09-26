import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import CableOutlinedIcon from '@mui/icons-material/CableOutlined';

const NAV_TABS = [
	{ id: 'profile', Icon: PersonOutlineOutlinedIcon, labelKey: 'accountSettings.tabs.profile' },
	{ id: 'company', Icon: ApartmentOutlinedIcon, labelKey: 'accountSettings.tabs.company' },
	{ id: 'users', Icon: GroupOutlinedIcon, labelKey: 'accountSettings.tabs.users' },
	{ id: 'integrations', Icon: CableOutlinedIcon, labelKey: 'accountSettings.tabs.integrations' },
	{ id: 'billing', Icon: CreditCardOutlinedIcon, labelKey: 'accountSettings.tabs.billing' },
];

/** The settings sections (profile, company, users, integrations, billing). */
const SettingsNav = ({ activeTab, setActiveTab }) => {
	const { t } = useTranslation();
	return (
		<>
		<Box sx={{
			width: 210, flexShrink: 0,
			backgroundColor: '#ffffff',
			borderRight: '1px solid #e2e8f0',
			display: 'flex', flexDirection: 'column',
			pt: 2.5, gap: 0.25,
		}}>
			<Typography sx={{ px: 2, mb: 1, fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
				{t('accountSettings.title')}
			</Typography>
			{NAV_TABS.map(({ id, Icon, labelKey }) => {
				const isActive = activeTab === id;
				return (
					<Box
						key={id}
						onClick={() => setActiveTab(id)}
						sx={{
							mx: 1, display: 'flex', alignItems: 'center', gap: 1.25,
							px: 1.5, py: 1.1, borderRadius: '0 8px 8px 0',
							cursor: 'pointer',
							borderLeft: isActive ? '3px solid #629C44' : '3px solid transparent',
							backgroundColor: isActive ? 'rgba(98,156,68,0.06)' : 'transparent',
							color: isActive ? '#629C44' : '#64748b',
							transition: 'all 0.1s ease',
							'&:hover': {
								backgroundColor: isActive ? 'rgba(98,156,68,0.08)' : '#f8fafc',
								color: isActive ? '#629C44' : '#334155',
							},
						}}
					>
						<Icon sx={{ fontSize: 17 }} />
						<Typography sx={{ fontSize: '0.82rem', fontWeight: isActive ? 600 : 400 }}>
							{t(labelKey)}
						</Typography>
					</Box>
				);
			})}
		</Box>
		</>
	);
};

SettingsNav.propTypes = {
	activeTab: PropTypes.any,
	setActiveTab: PropTypes.func,
};

export default SettingsNav;
