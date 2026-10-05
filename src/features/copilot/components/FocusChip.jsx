import PropTypes from 'prop-types';
import Chip from '@mui/material/Chip';
import PersonSearchOutlinedIcon from '@mui/icons-material/PersonSearchOutlined';
import { useTranslation } from 'react-i18next';
import * as tokens from '../../../theme/tokens.js';

/** What "this candidate" means in the conversation: removable until its first request is sent. */
const FocusChip = ({ focus, onClear }) => {
	const { t } = useTranslation();
	const label = t('copilot.focus.label', {
		name: focus.cvName || t('copilot.focus.unnamed'),
		job: focus.jobTitle || t('copilot.focus.untitled'),
	});
	return (
		<Chip
			data-testid="copilot-focus"
			size="small"
			icon={<PersonSearchOutlinedIcon />}
			label={label}
			title={label}
			onDelete={onClear}
			sx={{
				maxWidth: '100%', mb: 0.75, fontSize: tokens.fontSize.caption, fontWeight: 600,
				color: tokens.brand.text, backgroundColor: tokens.surface.subtle, border: `1px solid ${tokens.line.main}`,
				'& .MuiChip-icon': { color: tokens.brand.text, fontSize: tokens.iconSize.sm },
			}}
		/>
	);
};

FocusChip.propTypes = {
	focus: PropTypes.shape({ cvName: PropTypes.string, jobTitle: PropTypes.string }).isRequired,
	onClear: PropTypes.func,
};

export default FocusChip;
