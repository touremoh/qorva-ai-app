import PropTypes from 'prop-types';
import { Box, Button, TextField, IconButton, Typography, Switch, FormControlLabel, Select, MenuItem, FormControl } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import SectionTitle from './SectionTitle.jsx';
import SliderRow from './SliderRow.jsx';
import { THEME_GREEN, inputSx, selectSx } from '../../model/jobForm.js';
import { useTranslation } from 'react-i18next';

/** Required skills with importance, weight and minimum years. */
const SkillsSection = ({ addSkill, removeSkill, sc, skillWeightOk, skillWeightTotal, updateSkill }) => {
	const { t } = useTranslation();
	return (
		<>
		<SectionTitle label={t('jobContent.skills')} />
		{sc.skills.map((skill, i) => (
			<Box key={i} sx={{
				mb: 1.5, p: 1.5, borderRadius: 2,
				border: '1px solid #e2e8f0',
				backgroundColor: '#fafafa',
				transition: 'border-color 0.2s ease',
				'&:hover': { borderColor: '#cbd5e1' },
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
							<MenuItem value="mandatory" sx={{ fontSize: '0.84rem' }}>{t('jobContent.mandatory')}</MenuItem>
							<MenuItem value="important" sx={{ fontSize: '0.84rem' }}>{t('jobContent.important')}</MenuItem>
							<MenuItem value="nice_to_have" sx={{ fontSize: '0.84rem' }}>{t('jobContent.niceToHave')}</MenuItem>
						</Select>
					</FormControl>
					<IconButton size="small" onClick={() => removeSkill(i)} sx={{ color: '#ef4444', flexShrink: 0 }}>
						<DeleteOutlinedIcon sx={{ fontSize: 16 }} />
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
					label={<Typography sx={{ fontSize: '0.78rem', color: '#64748b' }}>{t('jobContent.exactSkillOnly')}</Typography>}
					sx={{ mt: 0.5, ml: 0 }}
				/>
			</Box>
		))}
		{sc.skills.length > 0 && (
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, mb: 1 }}>
				<Typography sx={{ fontSize: '0.76rem', color: '#94a3b8' }}>
					{t('jobContent.totalWeight')}:
				</Typography>
				<Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: skillWeightOk ? THEME_GREEN : '#f59e0b' }}>
					{skillWeightTotal}%
				</Typography>
				{!skillWeightOk && (
					<Typography sx={{ fontSize: '0.72rem', color: '#f59e0b' }}>
						({'>'} 100%)
					</Typography>
				)}
			</Box>
		)}
		<Button size="small" startIcon={<AddIcon />} onClick={addSkill}
			sx={{ textTransform: 'none', fontSize: '0.82rem', color: THEME_GREEN, mb: 2, '&:hover': { backgroundColor: 'rgba(98,156,68,0.06)' } }}>
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
