import React, { useState, useEffect } from 'react';
import {
	Box,
	Button,
	TextField,
	List,
	ListItemButton,
	IconButton,
	Typography,
	Chip,
	Avatar,
	Tooltip,
	Switch,
	FormControlLabel,
	Checkbox,
	FormGroup,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	CircularProgress,
	InputAdornment,
	Select,
	MenuItem,
	FormControl,
	InputLabel,
	Stepper,
	Step,
	StepLabel,
	Divider,
	Slider,
	Tabs,
	Tab,
	Paper,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import SearchIcon from '@mui/icons-material/Search';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import ConstructionIcon from '@mui/icons-material/Construction';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import TuneIcon from '@mui/icons-material/Tune';
import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined';
import { useTranslation } from 'react-i18next';
import { getJobs, createJob, updateJob, patchJobStatus, deleteJob } from '../../../services/jobService.js';
import { default as ReactQuill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// ─── Shared style constants ───────────────────────────────────────────────────

const THEME_GREEN = '#629C44';
const THEME_GREEN_DARK = '#528035';
const THEME_GREEN_ALPHA = 'rgba(98, 156, 68, 0.18)';

const inputSx = {
	'& .MuiOutlinedInput-root': {
		borderRadius: 1.5,
		transition: 'box-shadow 0.25s ease',
		'& fieldset': { transition: 'border-color 0.2s ease, border-width 0.1s ease' },
		'&:hover fieldset': { borderColor: THEME_GREEN },
		'&.Mui-focused': { boxShadow: `0 0 0 3px ${THEME_GREEN_ALPHA}` },
		'&.Mui-focused fieldset': { borderColor: THEME_GREEN, borderWidth: '2px' },
	},
	'& .MuiInputBase-input': { fontSize: '0.84rem' },
};

const selectSx = {
	borderRadius: 1.5,
	fontSize: '0.84rem',
	transition: 'box-shadow 0.25s ease',
	'&:hover .MuiOutlinedInput-notchedOutline': { borderColor: THEME_GREEN },
	'&.Mui-focused': { boxShadow: `0 0 0 3px ${THEME_GREEN_ALPHA}` },
	'&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: THEME_GREEN, borderWidth: '2px' },
};

const sliderSx = {
	color: THEME_GREEN,
	'& .MuiSlider-thumb': { width: 14, height: 14 },
	'& .MuiSlider-track': { height: 4 },
	'& .MuiSlider-rail': { height: 4, opacity: 0.25 },
};

const stepperSx = {
	width: '100%',
	'& .MuiStepIcon-root': { color: '#e2e8f0' },
	'& .MuiStepIcon-root.Mui-active': { color: THEME_GREEN },
	'& .MuiStepIcon-root.Mui-completed': { color: THEME_GREEN },
	'& .MuiStepLabel-label': { fontSize: '0.82rem' },
	'& .MuiStepLabel-label.Mui-active': { fontWeight: 600, color: THEME_GREEN },
	'& .MuiStepLabel-label.Mui-completed': { color: THEME_GREEN },
	'& .MuiStepConnector-line': { borderColor: '#e2e8f0' },
	'& .MuiStepConnector-root.Mui-active .MuiStepConnector-line': { borderColor: THEME_GREEN },
	'& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line': { borderColor: THEME_GREEN },
};

// ─── Scoring form helpers ─────────────────────────────────────────────────────

const emptySkill = () => ({ name: '', importance: 'mandatory', weight: 50, minYearsOfExperience: 1, exactSkillOnly: false });

const AVAILABILITY_STATUSES = ['activelyLooking', 'openButNotSearching', 'notAvailable', 'freelanceOnly'];

const SectionTitle = ({ label }) => (
	<Typography sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.07em', mb: 1.5, mt: 0.5 }}>
		{label}
	</Typography>
);

const SliderRow = ({ label, value, onChange, min, max, step, format }) => (
	<Box sx={{ mb: 0.5 }}>
		<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.25 }}>
			<Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>{label}</Typography>
			<Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: THEME_GREEN }}>{format(value)}</Typography>
		</Box>
		<Slider value={value} onChange={(_, v) => onChange(v)} min={min} max={max} step={step} size="small" sx={sliderSx} />
	</Box>
);

// ─── Step 2: Scoring/Matching rules form ──────────────────────────────────────

const JobScoringForm = ({ scoringConfig, setScoringConfig, onBack, onSkip, onSave, loading, saveLabel, t }) => {
	const [locationInput, setLocationInput] = useState('');
	const [industryInput, setIndustryInput] = useState('');

	const sc = scoringConfig;
	const set = (patch) => setScoringConfig(prev => ({ ...prev, ...patch }));
	const setExp = (patch) => set({ experienceRequirements: { ...sc.experienceRequirements, ...patch } });
	const setLoc = (patch) => set({ locationPreferences: { ...sc.locationPreferences, ...patch } });
	const setInd = (patch) => set({ industryPreferences: { ...sc.industryPreferences, ...patch } });
	const setWeights = (patch) => set({ scoringWeight: { ...sc.scoringWeight, ...patch } });

	const addSkill = () => set({ skills: [...sc.skills, emptySkill()] });
	const removeSkill = (i) => set({ skills: sc.skills.filter((_, idx) => idx !== i) });
	const updateSkill = (i, patch) => set({ skills: sc.skills.map((s, idx) => idx === i ? { ...s, ...patch } : s) });

	const addLocation = () => {
		const val = locationInput.trim();
		if (val && !sc.locationPreferences.allowedLocations.includes(val))
			setLoc({ allowedLocations: [...sc.locationPreferences.allowedLocations, val] });
		setLocationInput('');
	};
	const removeLocation = (loc) => setLoc({ allowedLocations: sc.locationPreferences.allowedLocations.filter(l => l !== loc) });

	const addIndustry = () => {
		const val = industryInput.trim();
		if (val && !sc.industryPreferences.preferredIndustries.includes(val))
			setInd({ preferredIndustries: [...sc.industryPreferences.preferredIndustries, val] });
		setIndustryInput('');
	};
	const removeIndustry = (ind) => setInd({ preferredIndustries: sc.industryPreferences.preferredIndustries.filter(i => i !== ind) });

	const weightTotal = ['skills', 'experience', 'location', 'industry'].reduce((s, k) => s + (sc.scoringWeight[k] || 0), 0);
	const weightOk = weightTotal === 100;
	const skillWeightTotal = sc.skills.reduce((s, sk) => s + (sk.weight || 0), 0);
	const skillWeightOk = skillWeightTotal <= 100;

	return (
		<Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
			{/* Scrollable body */}
			<Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, sm: 3 } }}>

				{/* ── Skills ── */}
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

				<Divider sx={{ my: 2 }} />

				{/* ── Experience Requirements ── */}
				<SectionTitle label={t('jobContent.experienceRequirements')} />
				<Box sx={{ display: 'flex', gap: 1.5, mb: 2, flexWrap: 'wrap' }}>
					<TextField size="small" type="number" label={t('jobContent.minYearsOfExperience')}
						value={sc.experienceRequirements.minYearsOfExperience}
						onChange={(e) => setExp({ minYearsOfExperience: e.target.value })}
						inputProps={{ min: 0 }} sx={{ ...inputSx, flex: '1 1 150px' }} />
					<TextField size="small" type="number" label={t('jobContent.minRelevantYears')}
						value={sc.experienceRequirements.minRelevantYears}
						onChange={(e) => setExp({ minRelevantYears: e.target.value })}
						inputProps={{ min: 0 }} sx={{ ...inputSx, flex: '1 1 150px' }} />
					<FormControl size="small" sx={{ flex: '1 1 140px' }}>
						<InputLabel sx={{ fontSize: '0.84rem' }}>{t('jobContent.seniorityLevel')}</InputLabel>
						<Select value={sc.experienceRequirements.seniorityLevel}
							onChange={(e) => setExp({ seniorityLevel: e.target.value })}
							label={t('jobContent.seniorityLevel')} sx={selectSx}>
							<MenuItem value="junior" sx={{ fontSize: '0.84rem' }}>{t('jobContent.junior')}</MenuItem>
							<MenuItem value="mid" sx={{ fontSize: '0.84rem' }}>{t('jobContent.mid')}</MenuItem>
							<MenuItem value="senior" sx={{ fontSize: '0.84rem' }}>{t('jobContent.senior')}</MenuItem>
						</Select>
					</FormControl>
				</Box>

				<Divider sx={{ my: 2 }} />

				{/* ── Location Preferences ── */}
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

				<Divider sx={{ my: 2 }} />

				{/* ── Industry Preferences ── */}
				<SectionTitle label={t('jobContent.industryPreferences')} />
				<Box sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
					<TextField size="small" placeholder={t('jobContent.addIndustry')} value={industryInput}
						onChange={(e) => setIndustryInput(e.target.value)}
						onKeyDown={(e) => e.key === 'Enter' && addIndustry()}
						sx={{ ...inputSx, flex: 1 }} />
					<Button size="small" onClick={addIndustry} variant="outlined"
						sx={{ textTransform: 'none', fontSize: '0.82rem', borderRadius: 1.5, borderColor: '#e2e8f0', color: '#64748b', flexShrink: 0, '&:hover': { borderColor: THEME_GREEN, color: THEME_GREEN } }}>
						{t('jobContent.addIndustry')}
					</Button>
				</Box>
				<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
					{sc.industryPreferences.preferredIndustries.map((ind) => (
						<Chip key={ind} label={ind} size="small" onDelete={() => removeIndustry(ind)}
							sx={{ fontSize: '0.76rem', height: 24, backgroundColor: '#f1f5f9' }} />
					))}
				</Box>
				<FormControl size="small" sx={{ minWidth: 130, mb: 2 }}>
					<InputLabel sx={{ fontSize: '0.84rem' }}>{t('jobContent.strictness')}</InputLabel>
					<Select value={sc.industryPreferences.strictness} onChange={(e) => setInd({ strictness: e.target.value })}
						label={t('jobContent.strictness')} sx={selectSx}>
						<MenuItem value="strict" sx={{ fontSize: '0.84rem' }}>{t('jobContent.strict')}</MenuItem>
						<MenuItem value="medium" sx={{ fontSize: '0.84rem' }}>{t('jobContent.medium')}</MenuItem>
						<MenuItem value="relaxed" sx={{ fontSize: '0.84rem' }}>{t('jobContent.relaxed')}</MenuItem>
					</Select>
				</FormControl>

				<Divider sx={{ my: 2 }} />

				{/* ── Scoring Weights ── */}
				<SectionTitle label={t('jobContent.scoringWeights')} />
				<Box sx={{ display: 'flex', gap: { xs: 2, sm: 4 }, flexWrap: 'wrap', mb: 0.5 }}>
					{[
						{ key: 'skills', label: t('jobContent.weightSkills') },
						{ key: 'experience', label: t('jobContent.weightExperience') },
						{ key: 'location', label: t('jobContent.weightLocation') },
						{ key: 'industry', label: t('jobContent.weightIndustry') },
					].map(({ key, label }) => (
						<Box key={key} sx={{ flex: '1 1 140px', minWidth: 120 }}>
							<SliderRow
								label={label} value={sc.scoringWeight[key]}
								onChange={(v) => setWeights({ [key]: v })}
								min={0} max={100} step={5} format={(v) => `${v}%`}
							/>
						</Box>
					))}
				</Box>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
					<Typography sx={{ fontSize: '0.76rem', color: '#94a3b8' }}>
						{t('jobContent.totalWeight')}:
					</Typography>
					<Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: weightOk ? THEME_GREEN : '#f59e0b' }}>
						{weightTotal}%
					</Typography>
					{!weightOk && (
						<Typography sx={{ fontSize: '0.72rem', color: '#f59e0b' }}>
							(should be 100%)
						</Typography>
					)}
				</Box>

				<Divider sx={{ my: 2 }} />

				{/* ── Candidate Availability Filters ── */}
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

			</Box>

			{/* Fixed action bar — always visible */}
			<Box sx={{
				flexShrink: 0,
				display: 'flex',
				gap: 1,
				px: { xs: 2, sm: 3 },
				py: 2,
				borderTop: '1px solid #e2e8f0',
				backgroundColor: '#ffffff',
			}}>
				<Button onClick={onBack} disabled={loading}
					sx={{ textTransform: 'none', color: '#64748b', borderRadius: 1.5, fontSize: '0.84rem' }}>
					{t('jobContent.back')}
				</Button>
				<Box sx={{ flex: 1 }} />
				<Button onClick={onSkip} disabled={loading}
					sx={{ textTransform: 'none', color: '#94a3b8', borderRadius: 1.5, fontSize: '0.84rem' }}>
					{t('jobContent.skipScoringRules')}
				</Button>
				<Button variant="contained" onClick={onSave} disabled={loading}
					sx={{
						textTransform: 'none', backgroundColor: THEME_GREEN,
						'&:hover': { backgroundColor: THEME_GREEN_DARK },
						borderRadius: 1.5, boxShadow: 'none', fontWeight: 600, fontSize: '0.84rem', minWidth: 100,
					}}>
					{loading ? <CircularProgress size={16} color="inherit" /> : saveLabel}
				</Button>
			</Box>
		</Box>
	);
};

// ─── Main component ───────────────────────────────────────────────────────────

const emptyScoringConfig = () => ({
	skills: [],
	experienceRequirements: { minYearsOfExperience: '', minRelevantYears: '', seniorityLevel: '' },
	locationPreferences: { allowedLocations: [], remoteAllowed: false, strictness: '' },
	industryPreferences: { preferredIndustries: [], strictness: '' },
	scoringWeight: { skills: 50, experience: 35, location: 10, industry: 5 },
	filterOpenToWork: false,
	availabilityStatuses: [],
});

const tabsSx = {
	borderBottom: '1px solid #e2e8f0',
	minHeight: 40,
	px: 2,
	backgroundColor: '#ffffff',
	'& .MuiTabs-indicator': { backgroundColor: THEME_GREEN },
	'& .MuiTab-root': { textTransform: 'none', fontSize: '0.82rem', minHeight: 40, py: 1, color: '#64748b' },
	'& .MuiTab-root.Mui-selected': { color: THEME_GREEN, fontWeight: 600 },
};

// ─── Read-only scoring rules view (mirrors AppCVDetails widgets) ──────────────

const CVCard = ({ children, sx }) => (
	<Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: '1px solid #e2e8f0', ...sx }}>
		{children}
	</Paper>
);

const CVSectionHeader = ({ Icon, title }) => (
	<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, pb: 0.75, borderBottom: '2px solid #629C44' }}>
		<Icon sx={{ fontSize: 14, color: '#629C44' }} />
		<Typography sx={{ fontWeight: 700, fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
			{title}
		</Typography>
	</Box>
);

const importanceChipSx = (importance) => {
	if (importance === 'mandatory') return { fontSize: '0.72rem', backgroundColor: 'rgba(98,156,68,0.10)', color: '#3a6827', borderRadius: 0.75, height: 22, fontWeight: 600 };
	if (importance === 'important') return { fontSize: '0.72rem', backgroundColor: 'rgba(245,158,11,0.12)', color: '#d97706', borderRadius: 0.75, height: 22, fontWeight: 600 };
	return { fontSize: '0.72rem', backgroundColor: '#f1f5f9', color: '#475569', borderRadius: 0.75, height: 22, fontWeight: 500 };
};

// Maps stored enum values to existing i18n keys
const importanceI18nKey = { mandatory: 'mandatory', important: 'important', nice_to_have: 'niceToHave' };

const statLabelSx = { fontSize: '0.70rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' };

const JobScoringView = ({ scoringRules, t }) => {
	if (!scoringRules) return (
		<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4 }}>
			<Typography sx={{ fontSize: '0.88rem', color: '#94a3b8' }}>{t('jobContent.noMatchingRules')}</Typography>
		</Box>
	);

	const sr = scoringRules;
	const weightPct = (v) => `${Math.round((v || 0) * 100)}%`;

	return (
		<Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2, textAlign: 'left' }}>

			{/* ── Skills ── */}
			{sr.skills?.length > 0 && (
				<CVCard>
					<CVSectionHeader Icon={ConstructionIcon} title={t('jobContent.skills')} />
					<Box sx={{ display: 'flex', flexDirection: 'column' }}>
						{sr.skills.map((s, i) => (
							<Box key={i} sx={i > 0 ? { pt: 1.5, mt: 1.5, borderTop: '1px solid #f1f5f9' } : {}}>
								<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 0.5, mb: 0.75 }}>
									<Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>{s.name}</Typography>
									<Chip label={t(`jobContent.${importanceI18nKey[s.importance] || s.importance}`)} size="small" sx={importanceChipSx(s.importance)} />
								</Box>
								<Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
									<Chip label={`${weightPct(s.weight)} ${t('jobContent.weightLabel')}`} size="small"
										sx={{ fontSize: '0.72rem', height: 22, backgroundColor: 'rgba(98,156,68,0.10)', color: '#3a6827', borderRadius: 0.75 }} />
									<Chip label={`${s.minYearsOfExperience} ${t('jobContent.yearsAbbr')} min.`} size="small"
										sx={{ fontSize: '0.72rem', height: 22, backgroundColor: '#f1f5f9', color: '#64748b', borderRadius: 0.75 }} />
									{s.exactSkillOnly && (
										<Chip label={t('jobContent.exactSkillOnly')} size="small"
											sx={{ fontSize: '0.72rem', height: 22, backgroundColor: '#eff6ff', color: '#3b82f6', borderRadius: 0.75 }} />
									)}
								</Box>
							</Box>
						))}
					</Box>
				</CVCard>
			)}

			{/* ── Experience Requirements ── */}
			{sr.experienceRequirements && (
				<CVCard>
					<CVSectionHeader Icon={WorkOutlineOutlinedIcon} title={t('jobContent.experienceRequirements')} />
					<Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
						{sr.experienceRequirements.minYearsOfExperience != null && (
							<Box>
								<Typography sx={statLabelSx}>{t('jobContent.minYearsOfExperience')}</Typography>
								<Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>{sr.experienceRequirements.minYearsOfExperience} {t('jobContent.yearsAbbr')}</Typography>
							</Box>
						)}
						{sr.experienceRequirements.minRelevantYears != null && (
							<Box>
								<Typography sx={statLabelSx}>{t('jobContent.minRelevantYears')}</Typography>
								<Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>{sr.experienceRequirements.minRelevantYears} {t('jobContent.yearsAbbr')}</Typography>
							</Box>
						)}
						{sr.experienceRequirements.seniorityLevel && (
							<Box>
								<Typography sx={statLabelSx}>{t('jobContent.seniorityLevel')}</Typography>
								<Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: THEME_GREEN }}>{t(`jobContent.${sr.experienceRequirements.seniorityLevel}`)}</Typography>
							</Box>
						)}
					</Box>
				</CVCard>
			)}

			{/* ── Location Preferences ── */}
			{sr.locationPreferences && (
				<CVCard>
					<CVSectionHeader Icon={LocationOnOutlinedIcon} title={t('jobContent.locationPreferences')} />
					{sr.locationPreferences.allowedLocations?.length > 0 && (
						<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6, mb: 1.5 }}>
							{sr.locationPreferences.allowedLocations.map(loc => (
								<Chip key={loc} label={loc} size="small"
									sx={{ fontSize: '0.75rem', backgroundColor: 'rgba(98,156,68,0.10)', color: '#3a6827', borderRadius: 1, height: 24, fontWeight: 500 }} />
							))}
						</Box>
					)}
					<Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
						<Box>
							<Typography sx={statLabelSx}>{t('jobContent.remoteAllowed')}</Typography>
							<Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: sr.locationPreferences.remoteAllowed ? THEME_GREEN : '#0f172a' }}>
								{sr.locationPreferences.remoteAllowed ? t('jobContent.yes') : t('jobContent.no')}
							</Typography>
						</Box>
						{sr.locationPreferences.strictness && (
							<Box>
								<Typography sx={statLabelSx}>{t('jobContent.strictness')}</Typography>
								<Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>{t(`jobContent.${sr.locationPreferences.strictness}`)}</Typography>
							</Box>
						)}
					</Box>
				</CVCard>
			)}

			{/* ── Industry Preferences ── */}
			{sr.industryPreferences && (
				<CVCard>
					<CVSectionHeader Icon={BusinessCenterOutlinedIcon} title={t('jobContent.industryPreferences')} />
					{sr.industryPreferences.preferredIndustries?.length > 0 && (
						<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6, mb: 1.5 }}>
							{sr.industryPreferences.preferredIndustries.map(ind => (
								<Chip key={ind} label={ind} size="small"
									sx={{ fontSize: '0.75rem', backgroundColor: '#f1f5f9', color: '#475569', borderRadius: 1, height: 24 }} />
							))}
						</Box>
					)}
					{sr.industryPreferences.strictness && (
						<Box>
							<Typography sx={statLabelSx}>{t('jobContent.strictness')}</Typography>
							<Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>{t(`jobContent.${sr.industryPreferences.strictness}`)}</Typography>
						</Box>
					)}
				</CVCard>
			)}

			{/* ── Scoring Weights ── */}
			{sr.scoringWeight && (
				<CVCard>
					<CVSectionHeader Icon={TuneIcon} title={t('jobContent.scoringWeights')} />
					<Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
						{[
							{ key: 'skills', label: t('jobContent.weightSkills') },
							{ key: 'experience', label: t('jobContent.weightExperience') },
							{ key: 'location', label: t('jobContent.weightLocation') },
							{ key: 'industry', label: t('jobContent.weightIndustry') },
						].map(({ key, label }) => (
							<Box key={key} sx={{ flex: '1 1 80px', p: 1.5, backgroundColor: '#f8fafc', borderRadius: 1.5, border: '1px solid #f1f5f9', textAlign: 'center' }}>
								<Typography sx={{ fontSize: '1.2rem', fontWeight: 700, color: THEME_GREEN, lineHeight: 1.2 }}>
									{weightPct(sr.scoringWeight[key])}
								</Typography>
								<Typography sx={{ ...statLabelSx, mt: 0.25 }}>{label}</Typography>
							</Box>
						))}
					</Box>
				</CVCard>
			)}

			{/* ── Candidate Availability Filters ── */}
			{(sr.filterOpenToWork || sr.availabilityStatuses?.length > 0) && (
				<CVCard>
					<CVSectionHeader Icon={FilterListOutlinedIcon} title={t('jobContent.candidateFilters')} />
					{sr.filterOpenToWork && (
						<Chip label={t('jobContent.filterOpenToWork')} size="small" sx={{
							fontSize: '0.72rem', height: 22, fontWeight: 600, borderRadius: 0.75,
							backgroundColor: 'rgba(98,156,68,0.10)', color: '#3a6827',
							mb: sr.availabilityStatuses?.length > 0 ? 1.5 : 0,
						}} />
					)}
					{sr.availabilityStatuses?.length > 0 && (
						<Box>
							<Typography sx={{ ...statLabelSx, mb: 0.75 }}>{t('jobContent.availabilityStatuses')}</Typography>
							<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
								{sr.availabilityStatuses.map(status => (
									<Chip key={status} label={t(`jobContent.availabilityStatus.${status}`)} size="small"
										sx={{ fontSize: '0.72rem', height: 22, backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: 0.75 }} />
								))}
							</Box>
						</Box>
					)}
				</CVCard>
			)}

		</Box>
	);
};

// Convert backend scoringRules (decimals 0-1) to slider-compatible form state
const loadScoringConfig = (job) => {
	const sc = job?.scoringRules;
	if (!sc) return emptyScoringConfig();
	return {
		skills: (sc.skills || []).map(s => ({
			name: s.name || '',
			importance: s.importance || 'mandatory',
			weight: Math.round((s.weight || 0) * 100),
			minYearsOfExperience: s.minYearsOfExperience || 1,
			exactSkillOnly: s.exactSkillOnly || false,
		})),
		experienceRequirements: {
			minYearsOfExperience: sc.experienceRequirements?.minYearsOfExperience ?? '',
			minRelevantYears: sc.experienceRequirements?.minRelevantYears ?? '',
			seniorityLevel: sc.experienceRequirements?.seniorityLevel || '',
		},
		locationPreferences: {
			allowedLocations: sc.locationPreferences?.allowedLocations || [],
			remoteAllowed: sc.locationPreferences?.remoteAllowed || false,
			strictness: sc.locationPreferences?.strictness || '',
		},
		industryPreferences: {
			preferredIndustries: sc.industryPreferences?.preferredIndustries || [],
			strictness: sc.industryPreferences?.strictness || '',
		},
		scoringWeight: {
			skills: Math.round((sc.scoringWeight?.skills ?? 0) * 100),
			experience: Math.round((sc.scoringWeight?.experience ?? 0) * 100),
			location: Math.round((sc.scoringWeight?.location ?? 0) * 100),
			industry: Math.round((sc.scoringWeight?.industry ?? 0) * 100),
		},
		filterOpenToWork: sc.filterOpenToWork || false,
		availabilityStatuses: sc.availabilityStatuses || [],
	};
};

// Convert form state to backend scoringRules shape (decimals 0-1, enums as stored)
const buildScoringPayload = (scoringConfig) => ({
	skills: scoringConfig.skills.map(s => ({
		name: s.name,
		importance: s.importance,
		weight: s.weight / 100,
		minYearsOfExperience: parseInt(s.minYearsOfExperience, 10) || 0,
		exactSkillOnly: s.exactSkillOnly,
	})),
	experienceRequirements: {
		minYearsOfExperience: parseInt(scoringConfig.experienceRequirements.minYearsOfExperience, 10) || 0,
		minRelevantYears: parseInt(scoringConfig.experienceRequirements.minRelevantYears, 10) || 0,
		seniorityLevel: scoringConfig.experienceRequirements.seniorityLevel || 'mid',
	},
	locationPreferences: {
		allowedLocations: scoringConfig.locationPreferences.allowedLocations,
		remoteAllowed: scoringConfig.locationPreferences.remoteAllowed,
		strictness: scoringConfig.locationPreferences.strictness || 'medium',
	},
	industryPreferences: {
		preferredIndustries: scoringConfig.industryPreferences.preferredIndustries,
		strictness: scoringConfig.industryPreferences.strictness || 'medium',
	},
	scoringWeight: {
		skills: scoringConfig.scoringWeight.skills / 100,
		experience: scoringConfig.scoringWeight.experience / 100,
		location: scoringConfig.scoringWeight.location / 100,
		industry: scoringConfig.scoringWeight.industry / 100,
	},
	...(scoringConfig.filterOpenToWork ? { filterOpenToWork: true } : {}),
	...(scoringConfig.availabilityStatuses?.length > 0
		? { availabilityStatuses: scoringConfig.availabilityStatuses }
		: {}),
});

const JobContent = () => {
	const { t, i18n } = useTranslation();
	const [createMode, setCreateMode] = useState(false);
	const [createStep, setCreateStep] = useState(0);
	const [editMode, setEditMode] = useState(false);
	const [editStep, setEditStep] = useState(0);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [jobs, setJobs] = useState([]);
	const [selectedJob, setSelectedJob] = useState(null);
	const [jobTitle, setJobTitle] = useState('');
	const [jobDescription, setJobDescription] = useState('');
	const [scoringConfig, setScoringConfig] = useState(emptyScoringConfig());
	const [search, setSearch] = useState('');
	const [detailTab, setDetailTab] = useState(0);
	const [loading, setLoading] = useState(false);

	const fetchJobs = async () => {
		try {
			const response = await getJobs();
			setJobs(response.data.data.content);
		} catch (error) {
			console.error('Error fetching job posts:', error);
		}
	};

	useEffect(() => {
		fetchJobs().then(r => console.log('All jobs fetched', r));
	}, []);

	const resetForm = () => { setJobTitle(''); setJobDescription(''); };

	const sanitizeDescription = (html) => {
		const doc = new DOMParser().parseFromString(html, 'text/html');
		const isEmptyEl = (el) => el.innerHTML.trim() === '' || el.innerHTML.trim() === '<br>';
		let prevEmpty = false;
		Array.from(doc.body.children).forEach(el => {
			const empty = isEmptyEl(el);
			if (empty && prevEmpty) el.remove();
			prevEmpty = empty;
		});
		while (doc.body.firstElementChild && isEmptyEl(doc.body.firstElementChild))
			doc.body.firstElementChild.remove();
		while (doc.body.lastElementChild && isEmptyEl(doc.body.lastElementChild))
			doc.body.lastElementChild.remove();
		return doc.body.innerHTML;
	};

	// ── Create flow ──────────────────────────────────────────────────────────────

	const handleStartCreate = () => {
		resetForm();
		setScoringConfig(emptyScoringConfig());
		setCreateStep(0);
		setCreateMode(true);
		setSelectedJob(null);
		setEditMode(false);
	};

	const handleCancelCreate = () => {
		setCreateMode(false);
		setCreateStep(0);
		resetForm();
		setScoringConfig(emptyScoringConfig());
	};

	const handleCreateJob = async (withScoringConfig) => {
		if (!jobTitle || !jobDescription) return;
		setLoading(true);
		try {
			const payload = {
				title: jobTitle,
				description: sanitizeDescription(jobDescription),
				status: 'open',
				language: i18n.language,
			};
			if (withScoringConfig) payload.scoringRules = buildScoringPayload(scoringConfig);
			const response = await createJob(payload);
			const created = response.data?.data;
			if (created) {
				setJobs(prev => [...prev, created]);
				handleCancelCreate();
			}
		} catch (error) {
			console.error('Error creating job post:', error);
		} finally {
			setLoading(false);
		}
	};

	// ── Edit flow ────────────────────────────────────────────────────────────────

	const handleStartEdit = () => {
		setScoringConfig(loadScoringConfig(selectedJob));
		setEditStep(0);
		setEditMode(true);
		setCreateMode(false);
	};

	const handleCancelEdit = () => {
		setEditMode(false);
		setEditStep(0);
		if (selectedJob) {
			setJobTitle(selectedJob.title);
			setJobDescription(selectedJob.description);
		}
		setScoringConfig(emptyScoringConfig());
	};

	const handleEditJob = async (withScoringConfig) => {
		if (!selectedJob || !jobTitle || !jobDescription) return;
		setLoading(true);
		try {
			const { scoringConfig: _sc, scoringRules: _sr, ...jobBase } = selectedJob;
			const payload = {
				...jobBase,
				title: jobTitle,
				description: sanitizeDescription(jobDescription),
				language: i18n.language,
			};
			if (withScoringConfig) payload.scoringRules = buildScoringPayload(scoringConfig);
			await updateJob(selectedJob.id, payload);
			setJobs(jobs.map(j => j.id === selectedJob.id ? payload : j));
			setSelectedJob(payload);
			setEditMode(false);
			setEditStep(0);
		} catch (error) {
			console.error('Error updating job post:', error);
		} finally {
			setLoading(false);
		}
	};

	// ── Other handlers ────────────────────────────────────────────────────────────

	const handleDeleteJob = async () => {
		if (!selectedJob) return;
		try {
			await deleteJob(selectedJob.id);
			setJobs(jobs.filter(j => j.id !== selectedJob.id));
			setSelectedJob(null);
			setDeleteDialogOpen(false);
		} catch (error) {
			console.error('Error deleting job post:', error);
		}
	};

	const handleToggleStatus = async () => {
		if (!selectedJob) return;
		const next = selectedJob.status === 'open' ? 'closed' : 'open';
		try {
			await patchJobStatus(selectedJob.id, next);
			setJobs(jobs.map(j => j.id === selectedJob.id ? { ...j, status: next } : j));
			setSelectedJob({ ...selectedJob, status: next });
		} catch (error) {
			console.error('Error updating job status:', error);
		}
	};

	const handleJobClick = (job) => {
		setSelectedJob(job);
		setJobTitle(job.title);
		setJobDescription(job.description);
		setDetailTab(0);
		setCreateMode(false);
		setEditMode(false);
	};

	const filtered = jobs.filter(j => j.title?.toLowerCase().includes(search.toLowerCase()));
	const jobInitials = (title = '') => title.split(' ').map(w => w[0]).filter(Boolean).join('').slice(0, 2).toUpperCase();

	const stepperHeader = (activeStep) => (
		<Box sx={{ px: { xs: 2, sm: 3 }, pt: 2, pb: 1.5, backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', flexShrink: 0 }}>
			<Stepper activeStep={activeStep} sx={stepperSx}>
				<Step><StepLabel>{t('jobContent.stepBasicInfo')}</StepLabel></Step>
				<Step><StepLabel>{t('jobContent.stepScoringRules')}</StepLabel></Step>
			</Stepper>
		</Box>
	);

	const step1Form = (onCancel, onNext) => (
		<Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, backgroundColor: '#ffffff' }}>
			{stepperHeader(0)}
			<Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, sm: 3 } }}>
				<TextField
					label={t('jobContent.jobTitle')} fullWidth size="small" margin="normal"
					value={jobTitle} onChange={(e) => setJobTitle(e.target.value)}
					sx={{ mb: 2, ...inputSx }}
				/>
				<Box sx={{
					'.ql-container': { borderRadius: '0 0 8px 8px', fontSize: '0.88rem' },
					'.ql-toolbar': { borderRadius: '8px 8px 0 0', borderColor: '#e2e8f0' },
					'.ql-container.ql-snow': { borderColor: '#e2e8f0', minHeight: 300 },
				}}>
					<ReactQuill theme="snow" value={jobDescription} onChange={setJobDescription} style={{ color: '#0f172a' }} />
				</Box>
			</Box>
			<Box sx={{ flexShrink: 0, display: 'flex', gap: 1, px: { xs: 2, sm: 3 }, py: 2, borderTop: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
				<Button onClick={onCancel}
					sx={{ textTransform: 'none', color: '#64748b', borderRadius: 1.5, fontSize: '0.84rem' }}>
					{t('jobContent.cancel')}
				</Button>
				<Box sx={{ flex: 1 }} />
				<Button variant="contained"
					disabled={!jobTitle.trim() || !jobDescription.trim() || jobDescription.trim() === '<p><br></p>'}
					onClick={onNext}
					sx={{
						textTransform: 'none', backgroundColor: THEME_GREEN,
						'&:hover': { backgroundColor: THEME_GREEN_DARK },
						borderRadius: 1.5, boxShadow: 'none', fontWeight: 600, fontSize: '0.84rem',
					}}>
					{t('jobContent.next')}
				</Button>
			</Box>
		</Box>
	);

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', overflow: 'hidden', backgroundColor: '#f8fafc' }}>
			{/* Toolbar */}
			<Box sx={{
				display: 'flex', alignItems: 'center', gap: 1.5, px: 2.5, py: 1.5,
				backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', flexShrink: 0,
			}}>
				<Button startIcon={<AddIcon />} variant="contained" onClick={handleStartCreate}
					sx={{
						backgroundColor: THEME_GREEN, '&:hover': { backgroundColor: THEME_GREEN_DARK },
						borderRadius: 1.5, textTransform: 'none', fontWeight: 600, fontSize: '0.84rem', boxShadow: 'none', px: 2,
					}}>
					{t('jobContent.createJobPost')}
				</Button>
			</Box>

			{/* Split pane */}
			<Box sx={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>

				{/* Left panel — job list */}
				<Box sx={{
					width: { xs: 180, sm: 220, md: 300 }, flexShrink: 0,
					borderRight: '1px solid #e2e8f0',
					display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: '#ffffff',
				}}>
					<Box sx={{ px: 1.5, pt: 1.5, pb: 1, flexShrink: 0 }}>
						<TextField size="small" fullWidth placeholder={t('jobContent.jobListTitle')}
							value={search} onChange={e => setSearch(e.target.value)}
							InputProps={{
								startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: '#94a3b8' }} /></InputAdornment>,
								sx: { fontSize: '0.82rem', borderRadius: 1.5 },
							}}
						/>
					</Box>
					{filtered.length === 0 ? (
						<Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
							<Typography sx={{ fontSize: '0.84rem', color: '#94a3b8' }}>{t('jobContent.noJobPosts')}</Typography>
						</Box>
					) : (
						<List disablePadding sx={{ flex: 1, overflowY: 'auto', px: 1 }}>
							{filtered.map((job) => {
								const active = selectedJob?.id === job.id && !createMode && !editMode;
								const isOpen = job.status === 'open';
								return (
									<ListItemButton key={job.id} onClick={() => handleJobClick(job)} sx={{
										borderRadius: 1.5, mb: 0.5, px: 1.5, py: 1,
										borderLeft: active ? `3px solid ${THEME_GREEN}` : '3px solid transparent',
										backgroundColor: active ? 'rgba(98,156,68,0.07)' : 'transparent',
										'&:hover': { backgroundColor: active ? 'rgba(98,156,68,0.10)' : '#f8fafc' },
									}}>
										<Avatar sx={{ width: 32, height: 32, fontSize: '0.68rem', fontWeight: 700, backgroundColor: active ? THEME_GREEN : '#e2e8f0', color: active ? '#ffffff' : '#64748b', mr: 1.5, flexShrink: 0 }}>
											{jobInitials(job.title)}
										</Avatar>
										<Box sx={{ flex: 1, minWidth: 0 }}>
											<Typography sx={{ fontSize: '0.84rem', fontWeight: active ? 600 : 500, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
												{job.title}
											</Typography>
											<Chip label={isOpen ? 'Open' : 'Closed'} size="small" sx={{
												mt: 0.25, height: 18, fontSize: '0.68rem', fontWeight: 600, borderRadius: 0.75,
												backgroundColor: isOpen ? 'rgba(98,156,68,0.12)' : 'rgba(239,68,68,0.10)',
												color: isOpen ? '#3a6827' : '#dc2626',
											}} />
										</Box>
									</ListItemButton>
								);
							})}
						</List>
					)}
				</Box>

				{/* Right panel */}
				<Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: '#f8fafc' }}>

					{/* ── Create: Step 1 ── */}
					{createMode && createStep === 0 && step1Form(handleCancelCreate, () => setCreateStep(1))}

					{/* ── Create: Step 2 ── */}
					{createMode && createStep === 1 && (
						<Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, backgroundColor: '#ffffff' }}>
							{stepperHeader(1)}
							<JobScoringForm
								scoringConfig={scoringConfig}
								setScoringConfig={setScoringConfig}
								onBack={() => setCreateStep(0)}
								onSkip={() => handleCreateJob(false)}
								onSave={() => handleCreateJob(true)}
								loading={loading}
								saveLabel={t('jobContent.postJob')}
								t={t}
							/>
						</Box>
					)}

					{/* ── Edit: Step 1 ── */}
					{editMode && editStep === 0 && step1Form(handleCancelEdit, () => setEditStep(1))}

					{/* ── Edit: Step 2 ── */}
					{editMode && editStep === 1 && (
						<Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, backgroundColor: '#ffffff' }}>
							{stepperHeader(1)}
							<JobScoringForm
								scoringConfig={scoringConfig}
								setScoringConfig={setScoringConfig}
								onBack={() => setEditStep(0)}
								onSkip={() => handleEditJob(false)}
								onSave={() => handleEditJob(true)}
								loading={loading}
								saveLabel={t('jobContent.updateJobPost')}
								t={t}
							/>
						</Box>
					)}

					{/* ── Job detail ── */}
					{!createMode && !editMode && selectedJob && (
						<Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
							{/* Header: status + actions */}
							<Box sx={{
								display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1,
								px: 2.5, py: 1.25, backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', flexShrink: 0,
							}}>
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
									<Typography sx={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500, display: { xs: 'none', sm: 'block' } }}>
										{selectedJob.status === 'open' ? 'Open' : 'Closed'}
									</Typography>
									<Switch checked={selectedJob.status === 'open'} onChange={handleToggleStatus} size="small"
										sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: THEME_GREEN }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: THEME_GREEN } }} />
								</Box>
								<Box sx={{ flexGrow: 1, minWidth: 4 }} />
								<Box sx={{ display: 'flex', gap: 1, flexShrink: 0, ml: 'auto' }}>
									<Tooltip title={t('jobContent.editJobPost')}>
										<IconButton size="small" onClick={handleStartEdit}
											sx={{ border: '1px solid #e2e8f0', borderRadius: 1.5, color: '#64748b', '&:hover': { backgroundColor: '#f1f5f9' } }}>
											<EditOutlinedIcon sx={{ fontSize: 16 }} />
										</IconButton>
									</Tooltip>
									<Tooltip title={t('jobContent.deleteJobTitle')}>
										<IconButton size="small" onClick={() => setDeleteDialogOpen(true)}
											sx={{ border: '1px solid #fecaca', borderRadius: 1.5, color: '#ef4444', '&:hover': { backgroundColor: '#fef2f2' } }}>
											<DeleteOutlineIcon sx={{ fontSize: 16 }} />
										</IconButton>
									</Tooltip>
								</Box>
							</Box>

							{/* Tabs */}
							<Tabs value={detailTab} onChange={(_, v) => setDetailTab(v)} sx={{ ...tabsSx, flexShrink: 0 }}>
								<Tab label={t('jobContent.tabDescription')} />
								<Tab label={t('jobContent.stepScoringRules')} />
							</Tabs>

							{/* Tab content */}
							<Box sx={{ flex: 1, overflowY: 'auto' }}>
								{detailTab === 0 && (
									<Box sx={{ p: 3, textAlign: 'left' }}>
										<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
											<Avatar sx={{ width: 44, height: 44, fontSize: '0.9rem', fontWeight: 700, backgroundColor: THEME_GREEN, color: '#fff' }}>
												{jobInitials(selectedJob.title)}
											</Avatar>
											<Box>
												<Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#0f172a', lineHeight: 1.2 }}>
													{selectedJob.title}
												</Typography>
												<Chip label={selectedJob.status === 'open' ? 'Open' : 'Closed'} size="small" sx={{
													mt: 0.5, height: 20, fontSize: '0.70rem', fontWeight: 600, borderRadius: 0.75,
													backgroundColor: selectedJob.status === 'open' ? 'rgba(98,156,68,0.12)' : 'rgba(239,68,68,0.10)',
													color: selectedJob.status === 'open' ? '#3a6827' : '#dc2626',
												}} />
											</Box>
										</Box>
										<Box sx={{
											'& p': { fontSize: '0.88rem', lineHeight: 1.8, color: '#334155', mb: 1 },
											'& ul, & ol': { pl: 2.5, mb: 1 },
											'& li': { fontSize: '0.88rem', lineHeight: 1.8, color: '#334155', mb: 0.25 },
											'& strong': { fontWeight: 700, color: '#0f172a' },
											'& h1, & h2, & h3': { color: '#0f172a', mt: 2, mb: 1 },
										}} dangerouslySetInnerHTML={{ __html: selectedJob.description }} />
									</Box>
								)}
								{detailTab === 1 && <JobScoringView scoringRules={selectedJob.scoringRules} t={t} />}
							</Box>
						</Box>
					)}

					{/* ── Empty state ── */}
					{!createMode && !editMode && !selectedJob && (
						<Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
							<WorkOutlineOutlinedIcon sx={{ fontSize: 40, color: '#cbd5e1' }} />
							<Typography sx={{ fontSize: '0.88rem', color: '#94a3b8' }}>{t('jobContent.selectJobToSeeDetails')}</Typography>
						</Box>
					)}
				</Box>
			</Box>

			{/* Delete confirmation */}
			<Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} PaperProps={{ sx: { borderRadius: 2.5 } }}>
				<DialogTitle sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>{t('jobContent.deleteJobTitle')}</DialogTitle>
				<DialogContent>
					<DialogContentText sx={{ fontSize: '0.88rem', color: '#64748b' }}>{t('jobContent.deleteJobConfirmation')}</DialogContentText>
				</DialogContent>
				<DialogActions sx={{ px: 2, pb: 2, gap: 1 }}>
					<Button onClick={() => setDeleteDialogOpen(false)} sx={{ textTransform: 'none', color: '#64748b', borderRadius: 1.5 }}>
						{t('jobContent.cancel')}
					</Button>
					<Button onClick={handleDeleteJob} variant="contained" color="error" sx={{ textTransform: 'none', borderRadius: 1.5, boxShadow: 'none' }}>
						{t('jobContent.confirm')}
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export default JobContent;
