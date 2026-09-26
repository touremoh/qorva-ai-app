import PropTypes from 'prop-types';
import { Box, Button, TextField, IconButton, Typography, Switch, FormControlLabel, Select, MenuItem, FormControl } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import SectionTitle from './SectionTitle.jsx';
import SliderRow from './SliderRow.jsx';
import { THEME_GREEN, inputSx, selectSx } from '../../model/jobForm.js';
import { useTranslation } from 'react-i18next';
import * as tokens from '../../../../theme/tokens.js';
import { alpha } from '@mui/material/styles';

/** Required skills with importance, weight and minimum years. */
const SkillsSection = ({ addSkill, removeSkill, sc, skillWeightOk, skillWeightTotal, updateSkill }) => {
	const { t } = useTranslation();
	return (
		<>
		<SectionTitle label={t('jobContent.skills')} />
		{sc.skills.map((skill, i) => (
			<Box key={i} sx={{
				mb: 1.5, p: 1.5, borderRadius: 2,
				border: `1px solid ${tokens.line.main}`,
				backgroundColor: tokens.surface.dim,
				transition: 'border-color 0.2s ease',
				'&:hover': { borderColor: tokens.line.strong },
			}}>
				{/* Name + Importance + Delete */}
				<Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1.5, flexWrap: 'wrap' }}>
					<TextField
						size="small" placeholder={t('jobContent.skillName')} value={skill.name}
						onChange={(e) => updateSkill(i, { name: e.target.value })}
						sx={{ ...inputSx, flex: '1 1 140px', minWidth: 100 }}
					/>
					<FormControl size="small" sx={{ flex: '1 1 130px', minWidth: 110 }}>
						<Select value={skill.importance} onChange={(e) => updateSkill(i, { importance: e.target.value })} sx={selectSx}>
							<MenuItem value="mandatory" sx={{ fontSize: tokens.fontSize.body2 }}>{t('jobContent.mandatory')}</MenuItem>
							<MenuItem value="important" sx={{ fontSize: tokens.fontSize.body2 }}>{t('jobContent.important')}</MenuItem>
							<MenuItem value="nice_to_have" sx={{ fontSize: tokens.fontSize.body2 }}>{t('jobContent.niceToHave')}</MenuItem>
						</Select>
					</FormControl>
					<IconButton size="small" onClick={() => removeSkill(i)} sx={{ color: tokens.status.error.bright, flexShrink: 0 }}>
						<DeleteOutlinedIcon sx={{ fontSize: tokens.iconSize.md }} />
					</IconButton>
				</Box>

				{/* Sliders */}
				<Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
					<Box sx={{ flex: '1 1 160px', minWidth: 140 }}>
						<SliderRow
							label={t('jobContent.skillWeight')}
							value={skill.weight} onChange={(v) => updateSkill(i, { weight: v })}
							min={0} max={100} step={5} format={(v) => `${v}%`}
						/>
					</Box>
					<Box sx={{ flex: '1 1 160px', minWidth: 140 }}>
						<SliderRow
							label={t('jobContent.minYearsExp')}
							value={skill.minYearsOfExperience} onChange={(v) => updateSkill(i, { minYearsOfExperience: v })}
							min={1} max={10} step={1} format={(v) => `${v} yr${v > 1 ? 's' : ''}`}
						/>
					</Box>
				</Box>

				{/* Exact match */}
				<FormControlLabel
					control={<Switch size="small" checked={skill.exactSkillOnly} onChange={(e) => updateSkill(i, { exactSkillOnly: e.target.checked })}
						sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: THEME_GREEN }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: THEME_GREEN } }} />}
					label={<Typography sx={{ fontSize: tokens.fontSize.small, color: tokens.ink.muted }}>{t('jobContent.exactSkillOnly')}</Typography>}
					sx={{ mt: 0.5, ml: 0 }}
				/>
			</Box>
		))}
		{sc.skills.length > 0 && (
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, mb: 1 }}>
				<Typography sx={{ fontSize: tokens.fontSize.small, color: tokens.ink.subtle }}>
					{t('jobContent.totalWeight')}:
				</Typography>
				<Typography sx={{ fontSize: tokens.fontSize.small, fontWeight: 700, color: skillWeightOk ? THEME_GREEN : `${tokens.status.warning.bright}` }}>
					{skillWeightTotal}%
				</Typography>
				{!skillWeightOk && (
					<Typography sx={{ fontSize: tokens.fontSize.caption, color: tokens.status.warning.bright }}>
						({'>'} 100%)
					</Typography>
				)}
			</Box>
		)}
		<Button size="small" startIcon={<AddIcon />} onClick={addSkill}
			sx={{ textTransform: 'none', fontSize: tokens.fontSize.body2, color: THEME_GREEN, mb: 2, '&:hover': { backgroundColor: alpha(tokens.brand.main, 0.06) } }}>
			{t('jobContent.addSkill')}
		</Button>

		</>
	);
};

SkillsSection.propTypes = {
	addSkill: PropTypes.any,
	removeSkill: PropTypes.any,
	sc: PropTypes.any,
	skillWeightOk: PropTypes.any,
	skillWeightTotal: PropTypes.any,
	updateSkill: PropTypes.any,
};

export default SkillsSection;
