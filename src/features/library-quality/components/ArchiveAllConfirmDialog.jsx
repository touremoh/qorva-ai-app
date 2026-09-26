import PropTypes from 'prop-types';
import ConfirmDialog from '../../../shared/ui/ConfirmDialog.jsx';
import { useTranslation } from 'react-i18next';

/** Confirms archiving every resume affected by an issue. */
const ArchiveAllConfirmDialog = ({ actionBusy, archiveConfirm, handleArchiveAll, setArchiveConfirm }) => {
	const { t } = useTranslation();
	return (
		<>
		<ConfirmDialog
			open={Boolean(archiveConfirm)}
			title={t('libraryQuality.archiveAllTitle', 'Archive resumes')}
			cancelLabel={t('appCVContent.cancel')}
			confirmLabel={t('libraryQuality.archiveAll', 'Archive all')}
			onCancel={() => setArchiveConfirm(null)}
			onConfirm={handleArchiveAll}
			busy={actionBusy}
		>
			{t('libraryQuality.archiveAllConfirmation',
						'This will archive {{count}} resumes. Archived resumes are excluded from matching and quality reporting; you can unarchive them from the Resume Library at any time.',
						{ count: archiveConfirm?.count ?? 0 })}
		</ConfirmDialog>
		</>
	);
};

ArchiveAllConfirmDialog.propTypes = {
	actionBusy: PropTypes.any,
	archiveConfirm: PropTypes.any,
	handleArchiveAll: PropTypes.func,
	setArchiveConfirm: PropTypes.func,
};

export default ArchiveAllConfirmDialog;
