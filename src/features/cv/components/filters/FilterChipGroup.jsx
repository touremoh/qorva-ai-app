import PropTypes from 'prop-types';
import { Box, Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import GroupLabel from './GroupLabel.jsx';
import { UNSET, GREEN } from '../../model/filterRail.js';
import * as tokens from '../../../../theme/tokens.js';

/** A facet as toggle chips with counts; the unanalysed bucket filters on UNSET. */
const FilterChipGroup = ({ group, list, selected, labelOf, onChange }) => {
	const { t } = useTranslation();
	if (list.length === 0) return null;
	const toggle = (value) => {
		const key = value == null ? UNSET : value;
		onChange(selected.includes(key) ? selected.filter(v => v !== key) : [...selected, key]);
	};
	return (
		<Box>
			<GroupLabel
				text={t(`appCVContent.filters.${group}.label`)}
				count={selected.length}
				onReset={() => onChange([])}
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
							onClick={() => toggle(value)}
							label={`${labelOf(value)} (${count})`}
							sx={{
								height: 22, fontSize: tokens.fontSize.caption, fontWeight: active ? 600 : 500,
								color: active ? `${tokens.surface.paper}` : `${tokens.ink.body}`,
								backgroundColor: active ? GREEN : `${tokens.surface.paper}`,
								border: `1px solid ${active ? GREEN : `${tokens.line.main}`}`,
								'&:hover': { backgroundColor: active ? `${tokens.brand.hover}` : `${tokens.surface.muted}` },
								'& .MuiChip-label': { px: 0.9 },
							}}
						/>
					);
				})}
			</Box>
		</Box>
	);
};

FilterChipGroup.propTypes = {
	group: PropTypes.string.isRequired,
	list: PropTypes.arrayOf(PropTypes.shape({ value: PropTypes.string, count: PropTypes.number })).isRequired,
	selected: PropTypes.array.isRequired,
	labelOf: PropTypes.func.isRequired,
	onChange: PropTypes.func.isRequired,
};

export default FilterChipGroup;
