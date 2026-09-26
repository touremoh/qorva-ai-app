import PropTypes from 'prop-types';
import { Autocomplete, Box, Chip, TextField } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import GroupLabel from './GroupLabel.jsx';
import { inputSx } from '../../model/filterRail.js';
import * as tokens from '../../../../theme/tokens.js';

/** A free-value facet (skills, locations…) as a multi-select with per-value counts. */
const FilterValueGroup = ({ group, list, selected, onChange }) => {
	const { t } = useTranslation();
	if (list.length === 0) return null;
	const byValue = Object.fromEntries(list.map(o => [o.value, o]));
	const labelKey = group === 'skills' ? 'appCVContent.filters.skillsAllOf' : `appCVContent.filters.${group}`;
	return (
		<Box>
			<GroupLabel text={t(labelKey)} count={selected.length} onReset={() => onChange([])} />
			<Autocomplete
				multiple
				size="small"
				limitTags={2}
				options={list.map(o => o.value)}
				value={selected}
				onChange={(_, value) => onChange(value)}
				getOptionLabel={(v) => v}
				renderOption={(props, v) => (
					<li {...props} key={v} style={{ fontSize: tokens.fontSize.small, display: 'flex', justifyContent: 'space-between' }}>
						<span>{v}</span>
						<span style={{ color: tokens.ink.subtle, marginLeft: 8 }}>{byValue[v]?.count ?? ''}</span>
					</li>
				)}
				renderTags={(value, getTagProps) => value.map((v, index) => (
					<Chip
						{...getTagProps({ index })}
						key={v}
						label={v}
						size="small"
						sx={{ height: 20, fontSize: tokens.fontSize.caption, backgroundColor: alpha(tokens.brand.main, 0.10), color: tokens.status.success.text }}
					/>
				))}
				renderInput={(params) => (
					<TextField
						{...params}
						placeholder={selected.length ? '' : t('appCVContent.filters.any')}
						InputProps={{ ...params.InputProps, sx: { ...inputSx, py: '2px' } }}
					/>
				)}
				sx={{ '& .MuiAutocomplete-inputRoot': { fontSize: tokens.fontSize.small } }}
			/>
		</Box>
	);
};

FilterValueGroup.propTypes = {
	group: PropTypes.string.isRequired,
	list: PropTypes.arrayOf(PropTypes.shape({ value: PropTypes.string, count: PropTypes.number })).isRequired,
	selected: PropTypes.array.isRequired,
	onChange: PropTypes.func.isRequired,
};

export default FilterValueGroup;
