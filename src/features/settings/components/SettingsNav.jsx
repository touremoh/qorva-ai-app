import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import CableOutlinedIcon from '@mui/icons-material/CableOutlined';
import * as tokens from '../../../theme/tokens.js';
import { alpha } from '@mui/material/styles';

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
			backgroundColor: tokens.surface.paper,
			borderRight: `1px solid ${tokens.line.main}`,
			display: 'flex', flexDirection: 'column',
			pt: 2.5, gap: 0.25,
		}}>
			<Typography sx={{ px: 2, mb: 1, fontSize: tokens.fontSize.micro, fontWeight: 700, color: tokens.ink.subtle, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
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
							borderLeft: isActive ? `3px solid ${tokens.brand.main}` : '3px solid transparent',
							backgroundColor: isActive ? alpha(tokens.brand.main, 0.06) : 'transparent',
							color: isActive ? `${tokens.brand.main}` : `${tokens.ink.muted}`,
							transition: 'all 0.1s ease',
							'&:hover': {
								backgroundColor: isActive ? alpha(tokens.brand.main, 0.08) : `${tokens.surface.subtle}`,
								color: isActive ? `${tokens.brand.main}` : `${tokens.ink.body}`,
							},
						}}
					>
						<Icon sx={{ fontSize: tokens.iconSize.md }} />
						<Typography sx={{ fontSize: tokens.fontSize.body2, fontWeight: isActive ? 600 : 400 }}>
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
