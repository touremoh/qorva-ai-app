import PropTypes from 'prop-types';
import { Box, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import UpgradeButton from '../../../../components/demo/UpgradeButton.jsx';
import { THEME_GREEN, THEME_GREEN_DARK } from '../../model/jobForm.js';
import { useTranslation } from 'react-i18next';

/** Create-job button (or the upgrade prompt for demo accounts). */
const JobsToolbar = ({ demo, handleStartCreate }) => {
	const { t } = useTranslation();
	return (
		<>
		<Box sx={{
			display: 'flex', alignItems: 'center', gap: 1.5, px: 2.5, py: 1.5,
			backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', flexShrink: 0,
		}}>
			{demo ? (
				<UpgradeButton reason="job-create" variant="contained" size="medium" />
			) : (
				<Button startIcon={<AddIcon />} variant="contained" onClick={handleStartCreate}
					sx={{
						backgroundColor: THEME_GREEN, '&:hover': { backgroundColor: THEME_GREEN_DARK },
						borderRadius: 1.5, textTransform: 'none', fontWeight: 600, fontSize: '0.84rem', boxShadow: 'none', px: 2,
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
