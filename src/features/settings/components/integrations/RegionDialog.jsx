import PropTypes from 'prop-types';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import GuideSteps from './GuideSteps.jsx';
import { BTN_GREEN_SX, PROVIDERS, regionLabel, stepList } from '../../model/integrations.js';
import * as tokens from '../../../../theme/tokens.js';

/** Datacenter picker (Zoho): the account is only reachable on its own region's host. */
const RegionDialog = ({ provider, regions, region, onRegionChange, busy, onCancel, onConnect }) => {
	const { t } = useTranslation();
	return (
		<Dialog open={!!provider} onClose={onCancel} maxWidth="xs" fullWidth>
			<DialogTitle sx={{ fontSize: tokens.fontSize.body, fontWeight: 700 }}>
				{t('atsIntegrations.regionTitle')}
			</DialogTitle>
			<DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: '8px !important' }}>
				<Typography sx={{ fontSize: tokens.fontSize.small, color: tokens.ink.muted }}>
					{t('atsIntegrations.regionHint')}
				</Typography>
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
				<TextField
					select size="small" fullWidth value={region}
					onChange={(e) => onRegionChange(e.target.value)}
					slotProps={{ inputLabel: { shrink: true } }}
				>
					{(regions || ['com']).map((key) => (
						<MenuItem key={key} value={key} sx={{ fontSize: tokens.fontSize.body2 }}>
							{regionLabel(key, t)}
						</MenuItem>
					))}
				</TextField>
			</DialogContent>
			<DialogActions sx={{ px: 3, pb: 2 }}>
				<Button onClick={onCancel}
					sx={{ textTransform: 'none', fontSize: tokens.fontSize.body2, color: tokens.ink.muted }}>
					{t('accountSettings.cancel')}
				</Button>
				<Button variant="contained" sx={BTN_GREEN_SX} disabled={busy} onClick={onConnect}>
					{t('atsIntegrations.connect')}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

RegionDialog.propTypes = {
	provider: PropTypes.string,
	regions: PropTypes.arrayOf(PropTypes.string),
	region: PropTypes.string.isRequired,
	onRegionChange: PropTypes.func.isRequired,
	busy: PropTypes.bool,
	onCancel: PropTypes.func.isRequired,
	onConnect: PropTypes.func.isRequired,
};

export default RegionDialog;
