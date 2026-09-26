import PropTypes from 'prop-types';
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import GuideSteps from './GuideSteps.jsx';
import { BTN_GREEN_SX, PROVIDERS, SECRET_FIELDS, stepList } from '../../model/integrations.js';
import * as tokens from '../../../../theme/tokens.js';

/** Credentials form for providers connected with a customer-generated key rather than OAuth. */
const ConnectDialog = ({ provider, form, onFieldChange, connecting, onCancel, onConnect }) => {
	const { t } = useTranslation();
	// Greenhouse needs a client id and secret, others a key plus their path segment, so the
	// button waits on whatever this provider actually declared rather than on apiKey alone.
	const complete = provider ? PROVIDERS[provider].required.every((field) => form[field]?.trim()) : false;
	return (
		<Dialog open={!!provider} onClose={() => !connecting && onCancel()} maxWidth="sm" fullWidth>
			<DialogTitle sx={{ fontSize: tokens.fontSize.body, fontWeight: 700 }}>
				{provider ? t('atsIntegrations.connectTitle', { provider: PROVIDERS[provider].label }) : ''}
			</DialogTitle>
			<DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: '8px !important' }}>
				{provider && (
					<GuideSteps
						title={t('atsIntegrations.guides.credentialsTitle')}
						intro={t(`atsIntegrations.guides.${provider}.intro`, '')}
						steps={stepList(t, `atsIntegrations.guides.${provider}.steps`)}
						note={t(`atsIntegrations.guides.${provider}.note`, '')}
						docsUrl={PROVIDERS[provider].docsUrl}
						docsLabel={t('atsIntegrations.guides.docs', { provider: PROVIDERS[provider].label })}
					/>
				)}
				{(provider ? PROVIDERS[provider].fields : []).map((field) => (
					<TextField
						key={field} size="small" fullWidth
						type={SECRET_FIELDS.has(field) ? 'password' : 'text'}
						label={t(`atsIntegrations.fields.${field}`)}
						helperText={t(`atsIntegrations.fields.${field}Hint`, '')}
						value={form[field] || ''}
						onChange={(e) => onFieldChange(field, e.target.value)}
						sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: tokens.fontSize.body2 } }}
					/>
				))}
			</DialogContent>
			<DialogActions sx={{ px: 3, pb: 2 }}>
				<Button size="small" disabled={connecting} onClick={onCancel}
					sx={{ textTransform: 'none', color: tokens.ink.muted }}>
					{t('accountSettings.cancel')}
				</Button>
				<Button size="small" variant="contained" onClick={onConnect}
					disabled={connecting || !complete}
					startIcon={connecting ? <CircularProgress size={12} color="inherit" /> : null}
					sx={BTN_GREEN_SX}>
					{t('atsIntegrations.connect')}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

ConnectDialog.propTypes = {
	provider: PropTypes.string,
	form: PropTypes.object.isRequired,
	onFieldChange: PropTypes.func.isRequired,
	connecting: PropTypes.bool,
	onCancel: PropTypes.func.isRequired,
	onConnect: PropTypes.func.isRequired,
};

export default ConnectDialog;
