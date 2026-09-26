import PropTypes from 'prop-types';
import { Avatar, Box, Paper, Typography } from '@mui/material';
import TranslateOutlinedIcon from '@mui/icons-material/TranslateOutlined';
import LanguageSwitcher from '../../../../components/languages/LanguageSwitcher.jsx';
import * as tokens from '../../../../theme/tokens.js';
import { alpha } from '@mui/material/styles';

/** Name, initials and role of the signed-in user. */
const ProfileBanner = ({ fullName, initials, userInfo }) => {
	return (
		<>
		<Paper elevation={0} sx={{ border: `1px solid ${tokens.line.main}`, borderRadius: 2.5, overflow: 'hidden' }}>
			<Box sx={{ height: 6, background: `linear-gradient(90deg, ${tokens.brand.main} 0%, ${tokens.brand.leaf} 100%)` }} />
			<Box sx={{ px: { xs: 2, md: 3 }, py: 2.5, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
				<Avatar sx={{
					width: 60, height: 60, fontSize: '1.15rem', fontWeight: 700,
					backgroundColor: tokens.brand.main, color: tokens.ink.inverse, flexShrink: 0,
					boxShadow: `0 0 0 3px ${tokens.surface.paper}, 0 0 0 5px ${alpha(tokens.brand.main, 0.25)}`,
				}}>
					{initials}
				</Avatar>
				<Box sx={{ flex: 1, minWidth: 0 }}>
					<Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: tokens.ink.strong, lineHeight: 1.3 }}>
						{fullName}
					</Typography>
					<Typography sx={{ fontSize: '0.8rem', color: tokens.ink.muted, mt: 0.25 }}>
						{userInfo.email || '—'}
					</Typography>
				</Box>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
					<TranslateOutlinedIcon sx={{ fontSize: 16, color: tokens.ink.subtle }} />
					<LanguageSwitcher />
				</Box>
			</Box>
		</Paper>
		</>
	);
};

ProfileBanner.propTypes = {
	fullName: PropTypes.any,
	initials: PropTypes.any,
	userInfo: PropTypes.any,
};

export default ProfileBanner;
