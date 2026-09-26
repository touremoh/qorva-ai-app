import PropTypes from 'prop-types';
import { Box, Button, TextField, Chip, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import SectionTitle from './SectionTitle.jsx';
import { THEME_GREEN, inputSx, selectSx } from '../../model/jobForm.js';
import { useTranslation } from 'react-i18next';
import * as tokens from '../../../../theme/tokens.js';

/** Preferred industries and how strictly they apply. */
const IndustrySection = ({ addIndustry, industryInput, removeIndustry, sc, setInd, setIndustryInput }) => {
	const { t } = useTranslation();
	return (
		<>
		<SectionTitle label={t('jobContent.industryPreferences')} />
		<Box sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
			<TextField size="small" placeholder={t('jobContent.addIndustry')} value={industryInput}
				onChange={(e) => setIndustryInput(e.target.value)}
				onKeyDown={(e) => e.key === 'Enter' && addIndustry()}
				sx={{ ...inputSx, flex: 1 }} />
			<Button size="small" onClick={addIndustry} variant="outlined"
				sx={{ textTransform: 'none', fontSize: tokens.fontSize.body2, borderRadius: 1.5, borderColor: tokens.line.main, color: tokens.ink.muted, flexShrink: 0, '&:hover': { borderColor: THEME_GREEN, color: THEME_GREEN } }}>
				{t('jobContent.addIndustry')}
			</Button>
		</Box>
		<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
			{sc.industryPreferences.preferredIndustries.map((ind) => (
				<Chip key={ind} label={ind} size="small" onDelete={() => removeIndustry(ind)}
					sx={{ fontSize: tokens.fontSize.small, height: 24, backgroundColor: tokens.surface.muted }} />
			))}
		</Box>
		<FormControl size="small" sx={{ minWidth: 130, mb: 2 }}>
			<InputLabel sx={{ fontSize: tokens.fontSize.body2 }}>{t('jobContent.strictness')}</InputLabel>
			<Select value={sc.industryPreferences.strictness} onChange={(e) => setInd({ strictness: e.target.value })}
				label={t('jobContent.strictness')} sx={selectSx}>
				<MenuItem value="strict" sx={{ fontSize: tokens.fontSize.body2 }}>{t('jobContent.strict')}</MenuItem>
				<MenuItem value="medium" sx={{ fontSize: tokens.fontSize.body2 }}>{t('jobContent.medium')}</MenuItem>
				<MenuItem value="relaxed" sx={{ fontSize: tokens.fontSize.body2 }}>{t('jobContent.relaxed')}</MenuItem>
			</Select>
		</FormControl>

		</>
	);
};

IndustrySection.propTypes = {
	addIndustry: PropTypes.any,
	industryInput: PropTypes.any,
	removeIndustry: PropTypes.any,
	sc: PropTypes.any,
	setInd: PropTypes.func,
	setIndustryInput: PropTypes.func,
};

export default IndustrySection;
