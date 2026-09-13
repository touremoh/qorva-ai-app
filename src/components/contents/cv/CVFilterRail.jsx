// eslint-disable-next-line no-unused-vars
import React from 'react';
import PropTypes from 'prop-types';
import {
	Autocomplete,
	Box,
	Button,
	Chip,
	CircularProgress,
	Drawer,
	IconButton,
	Link,
	MenuItem,
	Select,
	TextField,
	Typography,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import 'dayjs/locale/de';
import 'dayjs/locale/es';
import 'dayjs/locale/it';
import 'dayjs/locale/nl';
import 'dayjs/locale/pt';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ATS_LABELS } from './atsLabels.js';
import { DEFAULT_SORT } from './useCVFilters.js';

export const RAIL_WIDTH = 260;
// Sent for the "Not analysed" bucket; the backend maps it to a null match (CVSpecifications.fieldIn).
const UNSET = '_unset';
const DRAWER_WIDTH = 280;
const GREEN = '#629C44';

const SORT_OPTIONS = [
	{ value: 'lastUpdatedAt,desc', key: 'lastUpdated' },
	{ value: 'createdAt,desc', key: 'newest' },
	{ value: 'name,asc', key: 'name' },
	{ value: 'experience,desc', key: 'experience' },
];

// Chip groups read their labels from i18n by value; sources use the ATS display names.
const ENUM_GROUPS = ['seniority', 'leadership', 'availability', 'skillDepth'];
const VALUE_GROUPS = ['industries', 'locations', 'skills', 'tags'];

const labelSx = {
	fontSize: '0.68rem',
	fontWeight: 700,
	color: '#64748b',
	textTransform: 'uppercase',
	letterSpacing: '0.05em',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'space-between',
	mb: 0.5,
};

const inputSx = {
	fontSize: '0.78rem',
	borderRadius: 1,
	backgroundColor: '#ffffff',
	'& input': { py: '5px', px: '8px', fontSize: '0.78rem' },
};

const GroupLabel = ({ text, count, onReset }) => (
	<Typography component="div" sx={labelSx}>
		<span>{text}{count > 0 ? ` · ${count}` : ''}</span>
		{count > 0 && onReset && (
			<Box component="button" type="button" onClick={onReset} sx={{
				border: 0, background: 'none', p: 0, cursor: 'pointer',
				fontSize: '0.66rem', fontWeight: 600, color: GREEN, textTransform: 'none', letterSpacing: 0,
				'&:hover': { textDecoration: 'underline' },
			}}>
				×
			</Box>
		)}
	</Typography>
);
GroupLabel.propTypes = { text: PropTypes.string.isRequired, count: PropTypes.number, onReset: PropTypes.func };

const CVFilterRail = ({
	open, onClose, persistent,
	filters, setFilter, onClearAll, activeCount,
	sort, setSort,
	options, loading,
}) => {
	const { t, i18n } = useTranslation();
	const navigate = useNavigate();
	// dayjs ships locales by ISO code; fall back to English for anything we don't bundle above.
	const dateLocale = ['fr', 'de', 'es', 'it', 'nl', 'pt'].includes((i18n.language || '').slice(0, 2))
		? i18n.language.slice(0, 2)
		: 'en';

	const enumLabel = (group, value) =>
		value == null
			? t('appCVContent.filters.notAnalysed')
			: t(`appCVContent.filters.${group}.${value}`, value);

	const sourceLabel = (value) =>
		value === 'MANUAL' ? t('appCVContent.filters.source.manual') : (ATS_LABELS[value] || value);

	const toggleIn = (group, value) => {
		const current = filters[group] || [];
		const key = value == null ? UNSET : value;
		setFilter(group, current.includes(key) ? current.filter(v => v !== key) : [...current, key]);
	};

	const chipGroup = (group, labelOf) => {
		const list = options?.[group === 'source' ? 'sources' : group] || [];
		if (list.length === 0) return null;
		const selected = filters[group] || [];
		return (
			<Box key={group}>
				<GroupLabel
					text={t(`appCVContent.filters.${group}.label`)}
					count={selected.length}
					onReset={() => setFilter(group, [])}
				/>
				<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
					{list.map(({ value, count }) => {
						const key = value == null ? UNSET : value;
						const active = selected.includes(key);
						return (
							<Chip
								key={key}
								size="small"
								clickable
								onClick={() => toggleIn(group, value)}
								label={`${labelOf(value)} (${count})`}
								sx={{
									height: 22, fontSize: '0.7rem', fontWeight: active ? 600 : 500,
									color: active ? '#ffffff' : '#334155',
									backgroundColor: active ? GREEN : '#ffffff',
									border: `1px solid ${active ? GREEN : '#e2e8f0'}`,
									'&:hover': { backgroundColor: active ? '#528035' : '#f1f5f9' },
									'& .MuiChip-label': { px: 0.9 },
								}}
							/>
						);
					})}
				</Box>
			</Box>
		);
	};

	const valueGroup = (group) => {
		const list = options?.[group] || [];
		if (list.length === 0) return null;
		const selected = filters[group] || [];
		const byValue = Object.fromEntries(list.map(o => [o.value, o]));
		const labelKey = group === 'skills' ? 'appCVContent.filters.skillsAllOf' : `appCVContent.filters.${group}`;
		return (
			<Box key={group}>
				<GroupLabel text={t(labelKey)} count={selected.length} onReset={() => setFilter(group, [])} />
				<Autocomplete
					multiple
					size="small"
					limitTags={2}
					options={list.map(o => o.value)}
					value={selected}
					onChange={(_, value) => setFilter(group, value)}
					getOptionLabel={(v) => v}
					renderOption={(props, v) => (
						<li {...props} key={v} style={{ fontSize: '0.78rem', display: 'flex', justifyContent: 'space-between' }}>
							<span>{v}</span>
							<span style={{ color: '#94a3b8', marginLeft: 8 }}>{byValue[v]?.count ?? ''}</span>
						</li>
					)}
					renderTags={(value, getTagProps) => value.map((v, index) => (
						<Chip
							{...getTagProps({ index })}
							key={v}
							label={v}
							size="small"
							sx={{ height: 20, fontSize: '0.68rem', backgroundColor: 'rgba(98,156,68,0.10)', color: '#166534' }}
						/>
					))}
					renderInput={(params) => (
						<TextField
							{...params}
							placeholder={selected.length ? '' : t('appCVContent.filters.any')}
							InputProps={{ ...params.InputProps, sx: { ...inputSx, py: '2px' } }}
						/>
					)}
					sx={{ '& .MuiAutocomplete-inputRoot': { fontSize: '0.78rem' } }}
				/>
			</Box>
		);
	};

	const numberField = (key, placeholder) => (
		<TextField
			size="small"
			type="number"
			placeholder={placeholder}
			value={filters[key]}
			onChange={(e) => setFilter(key, e.target.value)}
			inputProps={{ min: 0 }}
			sx={{ width: 78 }}
			InputProps={{ sx: inputSx }}
		/>
	);

	// State keeps the ISO day string the backend reads (CVQueryBuilder.instant); the picker
	// works in dayjs and converts at the edge. "Since" dates can't be in the future.
	const dateField = (key) => (
		<DatePicker
			value={filters[key] ? dayjs(filters[key]) : null}
			onChange={(v) => setFilter(key, v && v.isValid() ? v.format('YYYY-MM-DD') : '')}
			disableFuture
			slotProps={{
				textField: {
					size: 'small',
					fullWidth: true,
					placeholder: t('appCVContent.filters.pickDate'),
					InputProps: { sx: inputSx },
				},
				field: { clearable: true },
				openPickerButton: { size: 'small', sx: { color: '#94a3b8', mr: -0.5 } },
				openPickerIcon: { sx: { fontSize: 16 } },
				popper: { placement: 'bottom-start' },
				desktopPaper: { sx: { borderRadius: 2, border: '1px solid #e2e8f0', boxShadow: '0 8px 24px rgba(15,23,42,0.10)' } },
				day: {
					sx: {
						fontSize: '0.78rem',
						'&.Mui-selected, &.Mui-selected:hover, &.Mui-selected:focus': { backgroundColor: GREEN },
						'&.MuiPickersDay-today:not(.Mui-selected)': { borderColor: GREEN },
					},
				},
			}}
		/>
	);

	const experience = options?.experience;
	const experienceCount = (filters.minYearsOfExperience !== '' ? 1 : 0) + (filters.maxYearsOfExperience !== '' ? 1 : 0);
	const dateCount = (filters.createdAfter ? 1 : 0) + (filters.updatedAfter ? 1 : 0);

	const content = (
		<LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={dateLocale}>
		<Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
			<Box sx={{
				display: 'flex', alignItems: 'center', gap: 0.5,
				px: 1.5, py: 1, borderBottom: '1px solid #e2e8f0', flexShrink: 0,
			}}>
				<Typography sx={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a', flex: 1 }}>
					{t('appCVContent.filters.title')}
				</Typography>
				{activeCount > 0 && (
					<Button size="small" onClick={onClearAll} sx={{
						textTransform: 'none', fontSize: '0.74rem', fontWeight: 600, color: GREEN, minWidth: 0, px: 0.75,
					}}>
						{t('appCVContent.filters.clearAll')}
					</Button>
				)}
				<IconButton size="small" onClick={onClose} sx={{ color: '#94a3b8' }}>
					<ChevronLeftIcon sx={{ fontSize: 18 }} />
				</IconButton>
			</Box>

			<Box sx={{ flex: 1, overflowY: 'auto', px: 1.5, py: 1.25, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
				{loading && !options && (
					<Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
						<CircularProgress size={20} sx={{ color: GREEN }} />
					</Box>
				)}

				{ENUM_GROUPS.map(group => chipGroup(group, (v) => enumLabel(group, v)))}
				{VALUE_GROUPS.map(valueGroup)}
				{chipGroup('source', sourceLabel)}

				{experience && experience.max != null && (
					<Box>
						<GroupLabel
							text={t('appCVContent.filters.experience')}
							count={experienceCount}
							onReset={() => { setFilter('minYearsOfExperience', ''); setFilter('maxYearsOfExperience', ''); }}
						/>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
							{numberField('minYearsOfExperience', String(experience.min ?? 0))}
							<Typography sx={{ fontSize: '0.74rem', color: '#94a3b8' }}>–</Typography>
							{numberField('maxYearsOfExperience', String(experience.max))}
							<Typography sx={{ fontSize: '0.74rem', color: '#94a3b8' }}>{t('appCVContent.yearsAbbr')}</Typography>
						</Box>
					</Box>
				)}

				<Box>
					<GroupLabel
						text={t('appCVContent.filters.dates')}
						count={dateCount}
						onReset={() => { setFilter('createdAfter', ''); setFilter('updatedAfter', ''); }}
					/>
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
						<Box>
							<Typography sx={{ fontSize: '0.7rem', color: '#94a3b8', mb: 0.25 }}>{t('appCVContent.filters.createdAfter')}</Typography>
							{dateField('createdAfter')}
						</Box>
						<Box>
							<Typography sx={{ fontSize: '0.7rem', color: '#94a3b8', mb: 0.25 }}>{t('appCVContent.filters.updatedAfter')}</Typography>
							{dateField('updatedAfter')}
						</Box>
					</Box>
				</Box>

				<Box>
					<GroupLabel text={t('appCVContent.filters.sortBy')} count={0} />
					<Select
						size="small"
						fullWidth
						value={sort || DEFAULT_SORT}
						onChange={(e) => setSort(e.target.value)}
						sx={{ fontSize: '0.78rem', backgroundColor: '#ffffff', '& .MuiSelect-select': { py: '5px', px: '8px' } }}
					>
						{SORT_OPTIONS.map(o => (
							<MenuItem key={o.value} value={o.value} sx={{ fontSize: '0.78rem' }}>
								{t(`appCVContent.filters.sort.${o.key}`)}
							</MenuItem>
						))}
					</Select>
				</Box>
			</Box>

			<Box sx={{ px: 1.5, py: 1.25, borderTop: '1px solid #e2e8f0', backgroundColor: '#ffffff', flexShrink: 0 }}>
				<Typography sx={{ fontSize: '0.72rem', color: '#64748b', lineHeight: 1.4 }}>
					{t('appCVContent.filters.needMore')}{' '}
					<Link
						component="button"
						type="button"
						onClick={() => navigate('/app/intelligence')}
						sx={{ fontSize: '0.72rem', fontWeight: 600, color: GREEN, verticalAlign: 'baseline', display: 'inline-flex', alignItems: 'center', gap: 0.25 }}
					>
						<PsychologyOutlinedIcon sx={{ fontSize: 14 }} />
						{t('appCVContent.filters.askIntelligence')}
					</Link>
				</Typography>
			</Box>
		</Box>
		</LocalizationProvider>
	);

	if (!persistent) {
		return (
			<Drawer
				variant="temporary"
				anchor="left"
				open={open}
				onClose={onClose}
				PaperProps={{ sx: { width: DRAWER_WIDTH, backgroundColor: '#f8fafc' } }}
			>
				{content}
			</Drawer>
		);
	}

	return (
		<Box sx={{
			width: open ? RAIL_WIDTH : 0,
			flexShrink: 0,
			transition: 'width 0.2s ease',
			overflow: 'hidden',
			borderRight: open ? '1px solid #e2e8f0' : 'none',
			backgroundColor: '#f8fafc',
		}}>
			<Box sx={{ width: RAIL_WIDTH, height: '100%' }}>
				{content}
			</Box>
		</Box>
	);
};

CVFilterRail.propTypes = {
	open: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	persistent: PropTypes.bool.isRequired,
	filters: PropTypes.object.isRequired,
	setFilter: PropTypes.func.isRequired,
	onClearAll: PropTypes.func.isRequired,
	activeCount: PropTypes.number.isRequired,
	sort: PropTypes.string.isRequired,
	setSort: PropTypes.func.isRequired,
	options: PropTypes.object,
	loading: PropTypes.bool,
};

export default CVFilterRail;
