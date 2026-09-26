import PropTypes from 'prop-types';
import { Box, Switch, Typography } from '@mui/material';
import { AUTHORITY_GROUPS, SWITCH_SX } from '../../model/users.js';

const PermissionsEditor = ({ perms, onChange, t }) => (
	<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
		{AUTHORITY_GROUPS.map(({ key, actions }) => (
			<Box key={key} sx={{ p: 1.5, borderRadius: 2, border: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
				<Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: '#629C44', textTransform: 'uppercase', letterSpacing: '0.07em', mb: 1 }}>
					{t(`accountSettings.authorityGroups.${key}`)}
				</Typography>
				{actions.map(action => (
					<Box key={action} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 0.25 }}>
						<Typography sx={{ fontSize: '0.78rem', color: '#334155' }}>
							{t(`accountSettings.authorities.${action}`)}
						</Typography>
						<Switch
							size="small"
							checked={perms[action] || false}
							onChange={(e) => onChange(action, e.target.checked)}
							sx={SWITCH_SX}
						/>
					</Box>
				))}
			</Box>
		))}
	</Box>
);
PermissionsEditor.propTypes = {
	perms: PropTypes.objectOf(PropTypes.bool).isRequired,
	onChange: PropTypes.func.isRequired,
	t: PropTypes.func.isRequired,
};

export default PermissionsEditor;
