import PropTypes from 'prop-types';
import { Avatar, Box, Paper, Typography } from '@mui/material';
import TranslateOutlinedIcon from '@mui/icons-material/TranslateOutlined';
import LanguageSwitcher from '../../../../components/languages/LanguageSwitcher.jsx';

/** Name, initials and role of the signed-in user. */
const ProfileBanner = ({ fullName, initials, userInfo }) => {
	return (
		<>
		<Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2.5, overflow: 'hidden' }}>
			<Box sx={{ height: 6, background: 'linear-gradient(90deg, #629C44 0%, #8dc96b 100%)' }} />
			<Box sx={{ px: { xs: 2, md: 3 }, py: 2.5, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
				<Avatar sx={{
					width: 60, height: 60, fontSize: '1.15rem', fontWeight: 700,
					backgroundColor: '#629C44', color: '#fff', flexShrink: 0,
					boxShadow: '0 0 0 3px #ffffff, 0 0 0 5px rgba(98,156,68,0.25)',
				}}>
					{initials}
				</Avatar>
				<Box sx={{ flex: 1, minWidth: 0 }}>
					<Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#0f172a', lineHeight: 1.3 }}>
						{fullName}
					</Typography>
					<Typography sx={{ fontSize: '0.8rem', color: '#64748b', mt: 0.25 }}>
						{userInfo.email || '—'}
					</Typography>
				</Box>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
					<TranslateOutlinedIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
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
