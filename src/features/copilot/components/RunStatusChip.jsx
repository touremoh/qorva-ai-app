import PropTypes from 'prop-types';
import Chip from '@mui/material/Chip';
import { useTranslation } from 'react-i18next';
import * as tokens from '../../../theme/tokens.js';
import { statusTone } from '../model/agentRun.js';

const RunStatusChip = ({ status }) => {
	const { t } = useTranslation();
	const tone = statusTone(status);
	return (
		<Chip
			size="small"
			label={t(`copilot.status.${status}`, status)}
			data-testid="copilot-run-status"
			sx={{ height: 22, fontSize: tokens.fontSize.micro, fontWeight: 600, color: tone.color, backgroundColor: tone.bg }}
		/>
	);
};

RunStatusChip.propTypes = {
	status: PropTypes.string,
};

export default RunStatusChip;
