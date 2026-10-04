import PropTypes from 'prop-types';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import ConfirmDialog from '../../../../shared/ui/ConfirmDialog.jsx';
import * as tokens from '../../../../theme/tokens.js';

/** Confirms deleting every outdated report of a job — their notes and chats go too. */
const DeleteOutdatedDialog = ({ open, count, jobTitle, busy, onCancel, onConfirm }) => {
	const { t } = useTranslation();
	return (
		<ConfirmDialog
			open={open}
			title={t('matchingRun.deleteOutdatedTitle')}
			cancelLabel={t('appReportContent.cancel')}
			confirmLabel={t('appReportContent.delete')}
			onCancel={onCancel}
			onConfirm={onConfirm}
			busy={busy}
			tone="danger"
			subject={jobTitle && (
				<Typography sx={{ fontSize: tokens.fontSize.body2, fontWeight: 600, color: 'ink.strong' }}>{jobTitle}</Typography>
			)}
		>
			{t('matchingRun.deleteOutdatedBody', { count })}
		</ConfirmDialog>
	);
};

DeleteOutdatedDialog.propTypes = {
	open: PropTypes.bool.isRequired,
	count: PropTypes.number,
	jobTitle: PropTypes.string,
	busy: PropTypes.bool,
	onCancel: PropTypes.func.isRequired,
	onConfirm: PropTypes.func.isRequired,
};

export default DeleteOutdatedDialog;
