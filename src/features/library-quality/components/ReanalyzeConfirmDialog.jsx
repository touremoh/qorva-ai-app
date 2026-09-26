import PropTypes from 'prop-types';
import ConfirmDialog from '../../../shared/ui/ConfirmDialog.jsx';
import { DialogContentText } from '@mui/material';
import { useTranslation } from 'react-i18next';
import * as tokens from '../../../theme/tokens.js';

/** Shows the AI re-analysis estimate (resumes, actions, quota) before starting it. */
const ReanalyzeConfirmDialog = ({ actionBusy, handleReanalyzeConfirm, reanalyzeEstimate, setReanalyzeEstimate }) => {
	const { t } = useTranslation();
	return (
		<>
		<ConfirmDialog
			open={Boolean(reanalyzeEstimate)}
			title={t('libraryQuality.jobs.confirmTitle', 'Re-analyze resumes with AI')}
			cancelLabel={t('appCVContent.cancel')}
			confirmLabel={t('libraryQuality.jobs.confirmStart', 'Start re-analysis')}
			onCancel={() => setReanalyzeEstimate(null)}
			onConfirm={handleReanalyzeConfirm}
			busy={actionBusy}
			confirmDisabled={(reanalyzeEstimate?.estimate?.estimatedActions ?? 0) === 0}
		>
			<DialogContentText sx={{ fontSize: '0.88rem', color: tokens.ink.muted }}>
				{t('libraryQuality.jobs.confirmBody',
					'This will re-run AI extraction on {{count}} resumes and use {{actions}} screening actions{{quota}}.',
					{
						count: reanalyzeEstimate?.estimate?.estimatedActions ?? 0,
						actions: reanalyzeEstimate?.estimate?.estimatedActions ?? 0,
						quota: Number.isFinite(reanalyzeEstimate?.estimate?.remainingQuota)
							? t('libraryQuality.jobs.confirmQuota', ' ({{remaining}} remaining this period)', { remaining: reanalyzeEstimate.estimate.remainingQuota })
							: '',
					})}
				{reanalyzeEstimate?.estimate?.skippedNoRawText > 0 && (
					<>
						{' '}
						{t('libraryQuality.jobs.confirmSkipped',
							'{{count}} older resumes have no stored source text and will be skipped — re-upload them to refresh.',
							{ count: reanalyzeEstimate.estimate.skippedNoRawText })}
					</>
				)}
			</DialogContentText>
		</ConfirmDialog>
		</>
	);
};

ReanalyzeConfirmDialog.propTypes = {
	actionBusy: PropTypes.any,
	handleReanalyzeConfirm: PropTypes.func,
	reanalyzeEstimate: PropTypes.any,
	setReanalyzeEstimate: PropTypes.func,
};

export default ReanalyzeConfirmDialog;
