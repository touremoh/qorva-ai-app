import PropTypes from 'prop-types';
import { Box, Button, TextField, Typography, Chip, Switch, FormControlLabel, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import SectionTitle from './SectionTitle.jsx';
import { THEME_GREEN, inputSx, selectSx } from '../../model/jobForm.js';
import { useTranslation } from 'react-i18next';

/** Allowed locations, remote acceptance and strictness. */
const LocationSection = ({ addLocation, locationInput, removeLocation, sc, setLoc, setLocationInput }) => {
	const { t } = useTranslation();
	return (
		<>
		<SectionTitle label={t('jobContent.locationPreferences')} />
		<Box sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
			<TextField size="small" placeholder={t('jobContent.addLocation')} value={locationInput}
				onChange={(e) => setLocationInput(e.target.value)}
				onKeyDown={(e) => e.key === 'Enter' && addLocation()}
				sx={{ ...inputSx, flex: 1 }} />
			<Button size="small" onClick={addLocation} variant="outlined"
				sx={{ textTransform: 'none', fontSize: '0.82rem', borderRadius: 1.5, borderColor: '#e2e8f0', color: '#64748b', flexShrink: 0, '&:hover': { borderColor: THEME_GREEN, color: THEME_GREEN } }}>
				{t('jobContent.addLocation')}
			</Button>
		</Box>
		<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
			{sc.locationPreferences.allowedLocations.map((loc) => (
				<Chip key={loc} label={loc} size="small" onDelete={() => removeLocation(loc)}
					sx={{ fontSize: '0.76rem', height: 24, backgroundColor: '#f1f5f9' }} />
			))}
		</Box>
		<Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 2, alignItems: 'center' }}>
			<FormControlLabel
				control={<Switch size="small" checked={sc.locationPreferences.remoteAllowed}
					onChange={(e) => setLoc({ remoteAllowed: e.target.checked })}
					sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: THEME_GREEN }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: THEME_GREEN } }} />}
				label={<Typography sx={{ fontSize: '0.84rem', color: '#334155' }}>{t('jobContent.remoteAllowed')}</Typography>}
			/>
			<FormControl size="small" sx={{ minWidth: 130 }}>
				<InputLabel sx={{ fontSize: '0.84rem' }}>{t('jobContent.strictness')}</InputLabel>
				<Select value={sc.locationPreferences.strictness} onChange={(e) => setLoc({ strictness: e.target.value })}
					label={t('jobContent.strictness')} sx={selectSx}>
					<MenuItem value="strict" sx={{ fontSize: '0.84rem' }}>{t('jobContent.strict')}</MenuItem>
					<MenuItem value="medium" sx={{ fontSize: '0.84rem' }}>{t('jobContent.medium')}</MenuItem>
					<MenuItem value="relaxed" sx={{ fontSize: '0.84rem' }}>{t('jobContent.relaxed')}</MenuItem>
				</Select>
			</FormControl>
		</Box>

		</>
	);
};

LocationSection.propTypes = {
	addLocation: PropTypes.any,
	locationInput: PropTypes.any,
	removeLocation: PropTypes.any,
	sc: PropTypes.any,
	setLoc: PropTypes.func,
	setLocationInput: PropTypes.func,
};

export default LocationSection;
