import PropTypes from 'prop-types';
import { Box, Typography, Switch, FormControlLabel, Checkbox, FormGroup } from '@mui/material';
import SectionTitle from './SectionTitle.jsx';
import { AVAILABILITY_STATUSES, THEME_GREEN } from '../../model/jobForm.js';
import { useTranslation } from 'react-i18next';

/** Candidate availability filters: exclude unavailable candidates, allowed statuses. */
const AvailabilityFilterSection = ({ sc, set }) => {
	const { t } = useTranslation();
	return (
		<>
		<SectionTitle label={t('jobContent.candidateFilters')} />
		<FormControlLabel
			control={
				<Switch size="small" checked={sc.filterOpenToWork}
					onChange={(e) => set({ filterOpenToWork: e.target.checked })}
					sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: THEME_GREEN }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: THEME_GREEN } }} />
			}
			label={
				<Box>
					<Typography sx={{ fontSize: '0.84rem', color: '#334155' }}>{t('jobContent.filterOpenToWork')}</Typography>
					<Typography sx={{ fontSize: '0.73rem', color: '#94a3b8', lineHeight: 1.4 }}>{t('jobContent.filterOpenToWorkDesc')}</Typography>
				</Box>
			}
			sx={{ mb: 2, ml: 0, alignItems: 'flex-start', gap: 0.5 }}
		/>
		<Typography sx={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600, mb: 0.75 }}>
			{t('jobContent.availabilityStatuses')}
		</Typography>
		<FormGroup sx={{ gap: 0.25, mb: 1 }}>
			{AVAILABILITY_STATUSES.map(status => (
				<FormControlLabel key={status}
					control={
						<Checkbox size="small"
							checked={sc.availabilityStatuses.includes(status)}
							onChange={(e) => {
								const next = e.target.checked
									? [...sc.availabilityStatuses, status]
									: sc.availabilityStatuses.filter(s => s !== status);
								set({ availabilityStatuses: next });
							}}
							sx={{ color: '#94a3b8', '&.Mui-checked': { color: THEME_GREEN }, py: 0.5 }}
						/>
					}
					label={<Typography sx={{ fontSize: '0.82rem', color: '#334155' }}>{t(`jobContent.availabilityStatus.${status}`)}</Typography>}
					sx={{ ml: 0 }}
				/>
			))}
		</FormGroup>
		</>
	);
};

AvailabilityFilterSection.propTypes = {
	sc: PropTypes.any,
	set: PropTypes.any,
};

export default AvailabilityFilterSection;
