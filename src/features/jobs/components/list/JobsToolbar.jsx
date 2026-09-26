import PropTypes from 'prop-types';
import { Box, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import UpgradeButton from '../../../../components/demo/UpgradeButton.jsx';
import { THEME_GREEN, THEME_GREEN_DARK } from '../../model/jobForm.js';
import { useTranslation } from 'react-i18next';
import * as tokens from '../../../../theme/tokens.js';

/** Create-job button (or the upgrade prompt for demo accounts). */
const JobsToolbar = ({ demo, handleStartCreate }) => {
	const { t } = useTranslation();
	return (
		<>
		<Box sx={{
			display: 'flex', alignItems: 'center', gap: 1.5, px: 2.5, py: 1.5,
			backgroundColor: tokens.surface.paper, borderBottom: `1px solid ${tokens.line.main}`, flexShrink: 0,
		}}>
			{demo ? (
				<UpgradeButton reason="job-create" variant="contained" size="medium" />
			) : (
				<Button startIcon={<AddIcon />} variant="contained" onClick={handleStartCreate}
					sx={{
						backgroundColor: THEME_GREEN, '&:hover': { backgroundColor: THEME_GREEN_DARK },
						borderRadius: 1.5, textTransform: 'none', fontWeight: 600, fontSize: tokens.fontSize.body2, boxShadow: 'none', px: 2,
					}}>
					{t('jobContent.createJobPost')}
				</Button>
			)}
		</Box>
		</>
	);
};

JobsToolbar.propTypes = {
	demo: PropTypes.bool,
	handleStartCreate: PropTypes.func,
};

export default JobsToolbar;
