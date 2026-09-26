// eslint-disable-next-line no-unused-vars
import React from 'react';
import PropTypes from 'prop-types';
import {
	Box,
	CircularProgress,
	Drawer,
	MenuItem,
	Select,
	TextField,
	Typography,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useTranslation } from 'react-i18next';
import { ATS_LABELS } from '../model/atsLabels.js';
import { DEFAULT_SORT } from '../hooks/useCVFilters.js';
import GroupLabel from './filters/GroupLabel.jsx';
import FilterChipGroup from './filters/FilterChipGroup.jsx';
import FilterValueGroup from './filters/FilterValueGroup.jsx';
import FilterDateField from './filters/FilterDateField.jsx';
import FilterRailHeader from './filters/FilterRailHeader.jsx';
import FilterRailFooter from './filters/FilterRailFooter.jsx';
import { DRAWER_WIDTH, GREEN, SORT_OPTIONS, ENUM_GROUPS, VALUE_GROUPS, inputSx } from '../model/filterRail.js';
import * as tokens from '../../../theme/tokens.js';

export const RAIL_WIDTH = 260;

const CVFilterRail = ({
	open, onClose, persistent,
	filters, setFilter, onClearAll, activeCount,
	sort, setSort,
	options, loading,
}) => {
	const { t, i18n } = useTranslation();
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

	const chipGroup = (group, labelOf) => (
		<FilterChipGroup
			key={group}
			group={group}
			list={options?.[group === 'source' ? 'sources' : group] || []}
			selected={filters[group] || []}
			labelOf={labelOf}
			onChange={(values) => setFilter(group, values)}
		/>
	);

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

	const dateField = (key) => <FilterDateField value={filters[key]} onChange={(v) => setFilter(key, v)} />;

	const experience = options?.experience;
	const experienceCount = (filters.minYearsOfExperience !== '' ? 1 : 0) + (filters.maxYearsOfExperience !== '' ? 1 : 0);
	const dateCount = (filters.createdAfter ? 1 : 0) + (filters.updatedAfter ? 1 : 0);

	const content = (
		<LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={dateLocale}>
		<Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
			<FilterRailHeader activeCount={activeCount} onClearAll={onClearAll} onClose={onClose} />

			<Box sx={{ flex: 1, overflowY: 'auto', px: 1.5, py: 1.25, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
				{loading && !options && (
					<Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
						<CircularProgress size={20} sx={{ color: GREEN }} />
					</Box>
				)}

				{ENUM_GROUPS.map(group => chipGroup(group, (v) => enumLabel(group, v)))}
				{VALUE_GROUPS.map(group => (
					<FilterValueGroup
						key={group}
						group={group}
						list={options?.[group] || []}
						selected={filters[group] || []}
						onChange={(values) => setFilter(group, values)}
					/>
				))}
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
							<Typography sx={{ fontSize: tokens.fontSize.small, color: tokens.ink.subtle }}>–</Typography>
							{numberField('maxYearsOfExperience', String(experience.max))}
							<Typography sx={{ fontSize: tokens.fontSize.small, color: tokens.ink.subtle }}>{t('appCVContent.yearsAbbr')}</Typography>
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
							<Typography sx={{ fontSize: tokens.fontSize.caption, color: tokens.ink.subtle, mb: 0.25 }}>{t('appCVContent.filters.createdAfter')}</Typography>
							{dateField('createdAfter')}
						</Box>
						<Box>
							<Typography sx={{ fontSize: tokens.fontSize.caption, color: tokens.ink.subtle, mb: 0.25 }}>{t('appCVContent.filters.updatedAfter')}</Typography>
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
						sx={{ fontSize: tokens.fontSize.small, backgroundColor: tokens.surface.paper, '& .MuiSelect-select': { py: '5px', px: '8px' } }}
					>
						{SORT_OPTIONS.map(o => (
							<MenuItem key={o.value} value={o.value} sx={{ fontSize: tokens.fontSize.small }}>
								{t(`appCVContent.filters.sort.${o.key}`)}
							</MenuItem>
						))}
					</Select>
				</Box>
			</Box>

			<FilterRailFooter />
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
				PaperProps={{ sx: { width: DRAWER_WIDTH, backgroundColor: tokens.surface.subtle } }}
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
			borderRight: open ? `1px solid ${tokens.line.main}` : 'none',
			backgroundColor: tokens.surface.subtle,
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
