import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
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
	Pagination,
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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import SearchIcon from '@mui/icons-material/Search';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useTranslation } from 'react-i18next';
import { getJobs, createJob, updateJob, patchJobStatus, deleteJob, suggestScoringRules, generateJobDescription } from '../../../services/jobService.js';
import { isDemoUser } from '../../../utils/demoMode.js';
import UpgradeButton from '../../demo/UpgradeButton.jsx';
import { default as ReactQuill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { descriptionToHtml } from '../../../utils/jobDescription.js';
import JobScoringView from './JobScoringView.jsx';
import JobPostReadView from './JobPostReadView.jsx';
import { emptyScoringConfig, loadScoringConfig, buildScoringPayload } from './scoringConfig.js';

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

SectionTitle.propTypes = {
	label: PropTypes.node,
};

const SliderRow = ({ label, value, onChange, min, max, step, format }) => (
	<Box sx={{ mb: 0.5 }}>
		<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.25 }}>
			<Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>{label}</Typography>
			<Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: THEME_GREEN }}>{format(value)}</Typography>
		</Box>
		<Slider value={value} onChange={(_, v) => onChange(v)} min={min} max={max} step={step} size="small" sx={sliderSx} />
	</Box>
);

SliderRow.propTypes = {
	label: PropTypes.node,
	value: PropTypes.number,
	onChange: PropTypes.func.isRequired,
	min: PropTypes.number,
	max: PropTypes.number,
	step: PropTypes.number,
	format: PropTypes.func.isRequired,
};

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

JobScoringForm.propTypes = {
	scoringConfig: PropTypes.shape({
		skills: PropTypes.arrayOf(PropTypes.shape({
			name: PropTypes.string,
			importance: PropTypes.string,
			weight: PropTypes.number,
			minYearsOfExperience: PropTypes.number,
			exactSkillOnly: PropTypes.bool,
		})).isRequired,
		experienceRequirements: PropTypes.shape({
			minYearsOfExperience: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
			minRelevantYears: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
			seniorityLevel: PropTypes.string,
		}).isRequired,
		locationPreferences: PropTypes.shape({
			allowedLocations: PropTypes.arrayOf(PropTypes.string),
			remoteAllowed: PropTypes.bool,
			strictness: PropTypes.string,
		}).isRequired,
		industryPreferences: PropTypes.shape({
			preferredIndustries: PropTypes.arrayOf(PropTypes.string),
			strictness: PropTypes.string,
		}).isRequired,
		scoringWeight: PropTypes.shape({
			skills: PropTypes.number,
			experience: PropTypes.number,
			location: PropTypes.number,
			industry: PropTypes.number,
		}).isRequired,
		filterOpenToWork: PropTypes.bool,
		availabilityStatuses: PropTypes.arrayOf(PropTypes.string),
	}).isRequired,
	setScoringConfig: PropTypes.func.isRequired,
	onBack: PropTypes.func,
	onSkip: PropTypes.func,
	onSave: PropTypes.func,
	loading: PropTypes.bool,
	saveLabel: PropTypes.node,
	t: PropTypes.func.isRequired,
};

// ─── Main component ───────────────────────────────────────────────────────────

const tabsSx = {
	borderBottom: '1px solid #e2e8f0',
	minHeight: 40,
	px: 2,
	backgroundColor: '#ffffff',
	'& .MuiTabs-indicator': { backgroundColor: THEME_GREEN },
	'& .MuiTab-root': { textTransform: 'none', fontSize: '0.82rem', minHeight: 40, py: 1, color: '#64748b' },
	'& .MuiTab-root.Mui-selected': { color: THEME_GREEN, fontWeight: 600 },
};


const JobContent = () => {
	const { t, i18n } = useTranslation();
	const demo = isDemoUser();
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
	// AI job-description builder (create mode only): a few structured inputs draft the
	// whole post — title, description, and scoring rules for step 2 (unmetered).
	const [aiBuilderOpen, setAiBuilderOpen] = useState(false);
	const [aiBuilderBusy, setAiBuilderBusy] = useState(false);
	const [aiSeniority, setAiSeniority] = useState('');
	const [aiSkills, setAiSkills] = useState('');
	const [aiLocation, setAiLocation] = useState('');
	const [aiContract, setAiContract] = useState('');
	const [aiNotes, setAiNotes] = useState('');

	// AI pre-fill of scoring rules (create mode only). lastSuggestedFor guards against
	// re-billing an LLM call when the user bounces Back/Next without changing the description.
	const [aiPrefillBusy, setAiPrefillBusy] = useState(false);
	const [aiPrefillApplied, setAiPrefillApplied] = useState(false);
	const [lastSuggestedFor, setLastSuggestedFor] = useState(null);
	const [search, setSearch] = useState('');
	const [detailTab, setDetailTab] = useState(0);
	const [loading, setLoading] = useState(false);
	const [jobsLoading, setJobsLoading] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [totalElements, setTotalElements] = useState(0);
	const searchDebounceRef = useRef(null);

	const fetchJobs = async (term = '', page = 0) => {
		setJobsLoading(true);
		try {
			const params = { pageSize: 20, pageNumber: page };
			if (term.trim()) { params.title = term.trim(); params.description = term.trim(); }
			const response = await getJobs(params);
			const data = response.data.data;
			setJobs(data.content ?? []);
			setTotalPages(data.totalPages ?? 1);
			setTotalElements(data.totalElements ?? 0);
		} catch (error) {
			console.error('Error fetching job posts:', error);
		} finally {
			setJobsLoading(false);
		}
	};

	const handlePageChange = (_, value) => {
		setCurrentPage(value);
		fetchJobs(search, value - 1);
	};

	useEffect(() => {
		fetchJobs();
	}, []);

	const resetForm = () => {
		setJobTitle(''); setJobDescription('');
		setAiPrefillApplied(false); setAiPrefillBusy(false); setLastSuggestedFor(null);
	};


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

	/**
	 * Create-mode "Next": advance immediately, then let AI draft the scoring rules —
	 * only when the form is still untouched and the description changed since the last
	 * suggestion. Failures fall back silently to the empty form (accelerator, not blocker).
	 */
	// Plain-text JD from the backend → simple Quill-friendly HTML (paragraphs + bullet lists).
	const jdTextToHtml = (text) => {
		const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
		const lines = (text || '').split('\n');
		const html = [];
		let bullets = [];
		const flushBullets = () => {
			if (bullets.length) {
				html.push(`<ul>${bullets.map(b => `<li>${escape(b)}</li>`).join('')}</ul>`);
				bullets = [];
			}
		};
		for (const raw of lines) {
			const line = raw.trim();
			if (line.startsWith('- ')) {
				bullets.push(line.slice(2));
			} else {
				flushBullets();
				if (line) html.push(`<p>${escape(line)}</p>`);
			}
		}
		flushBullets();
		return html.join('');
	};

	const handleGenerateJd = async () => {
		if (!jobTitle.trim() || aiBuilderBusy) return;
		setAiBuilderBusy(true);
		try {
			const res = await generateJobDescription({
				title: jobTitle.trim(),
				seniority: aiSeniority.trim(),
				mustHaveSkills: aiSkills.trim(),
				location: aiLocation.trim(),
				contractType: aiContract.trim(),
				extraNotes: aiNotes.trim(),
				language: i18n.language,
			});
			const draft = res.data;
			if (draft?.description) {
				const html = jdTextToHtml(draft.description);
				if (draft.title) setJobTitle(draft.title);
				setJobDescription(html);
				// The backend already suggested scoring rules for this draft (free) — apply
				// them and mark the draft as suggested so step 2 skips the metered re-suggest.
				if (draft.scoringRules) {
					setScoringConfig(loadScoringConfig({ scoringRules: draft.scoringRules }));
					setAiPrefillApplied(true);
					setLastSuggestedFor(`${draft.title || jobTitle}::${html}`);
				}
				setAiBuilderOpen(false);
			}
		} catch (error) {
			console.error('Job description generation failed:', error);
		} finally {
			setAiBuilderBusy(false);
		}
	};

	const handleCreateNext = async () => {
		setCreateStep(1);
		const descriptionKey = `${jobTitle}::${jobDescription}`;
		const formUntouched = JSON.stringify(scoringConfig) === JSON.stringify(emptyScoringConfig()) || aiPrefillApplied;
		if (!jobDescription || !formUntouched || descriptionKey === lastSuggestedFor) return;
		setAiPrefillBusy(true);
		try {
			const res = await suggestScoringRules(jobTitle, sanitizeDescription(jobDescription));
			const suggestion = res.data?.data ?? res.data;
			if (suggestion) {
				setScoringConfig(loadScoringConfig({ scoringRules: suggestion }));
				setAiPrefillApplied(true);
				setLastSuggestedFor(descriptionKey);
			}
		} catch (error) {
			console.error('Scoring rules pre-fill failed (falling back to manual setup):', error);
		} finally {
			setAiPrefillBusy(false);
		}
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
				handleCancelCreate();
				setSearch('');
				setCurrentPage(1);
				fetchJobs('', 0);
				setSelectedJob(created);
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
			setJobDescription(descriptionToHtml(selectedJob.description));
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
			setSelectedJob(null);
			setDeleteDialogOpen(false);
			const nextPage = jobs.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
			setCurrentPage(nextPage);
			fetchJobs(search, nextPage - 1);
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
		setJobDescription(descriptionToHtml(job.description));
		setDetailTab(0);
		setCreateMode(false);
		setEditMode(false);
	};

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

				{/* AI job-description builder — create mode only */}
				{createMode && (
					<Box sx={{ mb: 2, border: '1px solid rgba(98,156,68,0.35)', borderRadius: 2, overflow: 'hidden' }}>
						<Box
							onClick={() => setAiBuilderOpen(prev => !prev)}
							sx={{
								display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 1,
								backgroundColor: 'rgba(98,156,68,0.06)', cursor: 'pointer',
								'&:hover': { backgroundColor: 'rgba(98,156,68,0.10)' },
							}}
						>
							<AutoAwesomeIcon sx={{ fontSize: 17, color: THEME_GREEN }} />
							<Typography sx={{ fontSize: '0.84rem', fontWeight: 600, color: '#166534' }}>
								{t('jobContent.aiBuilder.toggle', 'Generate the description with AI')}
							</Typography>
							<Box sx={{ flex: 1 }} />
							<Typography sx={{ fontSize: '0.76rem', color: '#629C44' }}>
								{aiBuilderOpen ? '−' : '+'}
							</Typography>
						</Box>
						{aiBuilderOpen && (
							<Box sx={{ px: 1.5, py: 1.5, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
								<Typography sx={{ fontSize: '0.76rem', color: '#64748b' }}>
									{t('jobContent.aiBuilder.hint', 'Fill in the job title above plus any details below — the draft lands in the editor for you to review.')}
								</Typography>
								<Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
									<TextField size="small" label={t('jobContent.aiBuilder.seniority', 'Seniority')}
										value={aiSeniority} onChange={(e) => setAiSeniority(e.target.value)}
										sx={{ flex: '1 1 160px', ...inputSx }} />
									<TextField size="small" label={t('jobContent.aiBuilder.contract', 'Contract type')}
										value={aiContract} onChange={(e) => setAiContract(e.target.value)}
										sx={{ flex: '1 1 160px', ...inputSx }} />
									<TextField size="small" label={t('jobContent.aiBuilder.location', 'Location / remote')}
										value={aiLocation} onChange={(e) => setAiLocation(e.target.value)}
										sx={{ flex: '1 1 160px', ...inputSx }} />
								</Box>
								<TextField size="small" label={t('jobContent.aiBuilder.mustHave', 'Must-have skills (comma-separated)')}
									value={aiSkills} onChange={(e) => setAiSkills(e.target.value)}
									fullWidth sx={inputSx} />
								<TextField size="small" label={t('jobContent.aiBuilder.notes', 'Anything else the description should mention')}
									value={aiNotes} onChange={(e) => setAiNotes(e.target.value)}
									fullWidth multiline minRows={2} sx={inputSx} />
								<Button
									variant="contained"
									disabled={!jobTitle.trim() || aiBuilderBusy}
									onClick={handleGenerateJd}
									startIcon={aiBuilderBusy ? <CircularProgress size={14} color="inherit" /> : <AutoAwesomeIcon sx={{ fontSize: 16 }} />}
									sx={{
										alignSelf: 'flex-start', textTransform: 'none', fontWeight: 600, fontSize: '0.8rem',
										backgroundColor: THEME_GREEN, '&:hover': { backgroundColor: THEME_GREEN_DARK },
										borderRadius: 1.5, boxShadow: 'none',
									}}
								>
									{aiBuilderBusy
										? t('jobContent.aiBuilder.generating', 'Drafting…')
										: t('jobContent.aiBuilder.generate', 'Generate draft')}
								</Button>
							</Box>
						)}
					</Box>
				)}
				<Box sx={{
					'.ql-container': { borderRadius: '0 0 8px 8px', fontSize: '0.88rem' },
					'.ql-toolbar': { borderRadius: '8px 8px 0 0', borderColor: '#e2e8f0', transition: 'border-color 0.2s, box-shadow 0.2s' },
					'.ql-container.ql-snow': { borderColor: '#e2e8f0', minHeight: 300, transition: 'border-color 0.2s, box-shadow 0.2s' },
					// Mirror the title TextField's states (inputSx): hover darkens, focus turns green
					// with a 1.5px-feel ring (box-shadow instead of border-width to avoid layout shift).
					'&:hover .ql-toolbar, &:hover .ql-container.ql-snow': { borderColor: '#cbd5e1' },
					'&:focus-within .ql-toolbar': { borderColor: '#629C44', boxShadow: 'inset 0 0 0 0.5px #629C44' },
					'&:focus-within .ql-container.ql-snow': { borderColor: '#629C44', boxShadow: 'inset 0 0 0 0.5px #629C44' },
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
							value={search}
							onChange={e => {
								const val = e.target.value;
								setSearch(val);
								setCurrentPage(1);
								clearTimeout(searchDebounceRef.current);
								searchDebounceRef.current = setTimeout(() => fetchJobs(val, 0), 300);
							}}
							InputProps={{
								startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: '#94a3b8' }} /></InputAdornment>,
								endAdornment: jobsLoading ? <InputAdornment position="end"><CircularProgress size={12} sx={{ color: '#94a3b8' }} /></InputAdornment> : null,
								sx: { fontSize: '0.82rem', borderRadius: 1.5 },
							}}
						/>
					</Box>
					{jobs.length === 0 && !jobsLoading ? (
						<Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
							<Typography sx={{ fontSize: '0.84rem', color: '#94a3b8' }}>{t('jobContent.noJobPosts')}</Typography>
						</Box>
					) : (
						<List disablePadding sx={{ flex: 1, overflowY: 'auto', px: 1 }}>
							{jobs.map((job) => {
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
											<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25, flexWrap: 'wrap' }}>
												<Chip label={isOpen ? 'Open' : 'Closed'} size="small" sx={{
													height: 18, fontSize: '0.68rem', fontWeight: 600, borderRadius: 0.75,
													backgroundColor: isOpen ? 'rgba(98,156,68,0.12)' : 'rgba(239,68,68,0.10)',
													color: isOpen ? '#3a6827' : '#dc2626',
												}} />
											</Box>
										</Box>
									</ListItemButton>
								);
							})}
						</List>
					)}

					{/* Pagination footer */}
					<Box sx={{
						display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.25,
						px: 1, py: 0.75, borderTop: '1px solid #f1f5f9', flexShrink: 0, backgroundColor: '#fafafa',
					}}>
						<Typography sx={{ fontSize: '0.68rem', color: '#94a3b8' }}>
							{totalElements} {t('jobContent.jobs', 'jobs')}
						</Typography>
						{totalPages > 1 && (
							<Pagination
								count={totalPages}
								page={currentPage}
								onChange={handlePageChange}
								size="small"
								siblingCount={0}
								boundaryCount={1}
								sx={{ '& .MuiPaginationItem-root': { fontSize: '0.68rem', minWidth: 24, height: 24 } }}
							/>
						)}
					</Box>
				</Box>

				{/* Right panel */}
				<Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: '#f8fafc' }}>

					{/* ── Create: Step 1 ── */}
					{createMode && createStep === 0 && step1Form(handleCancelCreate, handleCreateNext)}

					{/* ── Create: Step 2 ── */}
					{createMode && createStep === 1 && (
						<Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, backgroundColor: '#ffffff', position: 'relative' }}>
							{stepperHeader(1)}
							{aiPrefillBusy && (
								<Box sx={{
									position: 'absolute', inset: 0, zIndex: 5,
									backgroundColor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(1px)',
									display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1.5,
								}}>
									<CircularProgress size={26} sx={{ color: '#629C44' }} />
									<Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
										{t('jobContent.aiPrefill.drafting', 'AI is drafting your scoring rules…')}
									</Typography>
								</Box>
							)}
							{aiPrefillApplied && !aiPrefillBusy && (
								<Box sx={{
									mx: 2.5, mt: 1, px: 1.5, py: 0.75, borderRadius: 1.5,
									backgroundColor: 'rgba(98,156,68,0.08)', border: '1px solid rgba(98,156,68,0.3)',
								}}>
									<Typography sx={{ fontSize: '0.74rem', color: '#3f6212', fontWeight: 600 }}>
										{t('jobContent.aiPrefill.applied', 'AI-suggested scoring rules — review and adjust before saving.')}
									</Typography>
								</Box>
							)}
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
									{!demo && (
										<>
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
										</>
									)}
								</Box>
							</Box>

							{/* Tabs */}
							<Tabs value={detailTab} onChange={(_, v) => setDetailTab(v)} sx={{ ...tabsSx, flexShrink: 0 }}>
								<Tab label={t('jobContent.tabDescription')} />
								<Tab label={t('jobContent.stepScoringRules')} />
							</Tabs>

							{/* Tab content */}
							<Box sx={{ flex: 1, overflowY: 'auto' }}>
								{detailTab === 0 && <JobPostReadView job={selectedJob} showScoringRules={false} />}
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
