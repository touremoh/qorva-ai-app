import PropTypes from 'prop-types';
import { DatePicker } from '@mui/x-date-pickers';
import { useTranslation } from 'react-i18next';
import dayjs from '../../../../shared/lib/dayjs.js';
import { GREEN, inputSx } from '../../model/filterRail.js';
import * as tokens from '../../../../theme/tokens.js';

/**
 * A "since" date filter. State keeps the ISO day string the backend reads
 * (CVQueryBuilder.instant); the picker works in dayjs and converts at the edge.
 */
const FilterDateField = ({ value, onChange }) => {
	const { t } = useTranslation();
	return (
		<DatePicker
			value={value ? dayjs(value) : null}
			onChange={(v) => onChange(v && v.isValid() ? v.format('YYYY-MM-DD') : '')}
			disableFuture
			slotProps={{
				textField: {
					size: 'small',
					fullWidth: true,
					placeholder: t('appCVContent.filters.pickDate'),
					InputProps: { sx: inputSx },
				},
				field: { clearable: true },
				openPickerButton: { size: 'small', sx: { color: tokens.ink.subtle, mr: -0.5 } },
				openPickerIcon: { sx: { fontSize: tokens.iconSize.md } },
				popper: { placement: 'bottom-start' },
				desktopPaper: { sx: { borderRadius: 2, border: `1px solid ${tokens.line.main}`, boxShadow: '0 8px 24px rgba(15,23,42,0.10)' } },
				day: {
					sx: {
						fontSize: tokens.fontSize.small,
						'&.Mui-selected, &.Mui-selected:hover, &.Mui-selected:focus': { backgroundColor: GREEN },
						'&.MuiPickersDay-today:not(.Mui-selected)': { borderColor: GREEN },
					},
				},
			}}
		/>
	);
};

FilterDateField.propTypes = { value: PropTypes.string, onChange: PropTypes.func.isRequired };

export default FilterDateField;
