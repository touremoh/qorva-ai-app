import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Alert, Box, FormControlLabel, Paper, Switch, Typography } from '@mui/material';
import KeyOutlinedIcon from '@mui/icons-material/KeyOutlined';
import { useTranslation } from 'react-i18next';
import SectionHeader from '../../../../shared/ui/SectionHeader.jsx';
import ConfirmDialog from '../../../../shared/ui/ConfirmDialog.jsx';
import { getSsoAvailability } from '../../../auth/api/authService.js';
import { setTenantSsoRequired } from '../../api/tenantService.js';
import * as tokens from '../../../../theme/tokens.js';

/**
 * "Require Microsoft sign-in": everyone signs in through the company's Microsoft account except the account owner,
 * who keeps the password as a way in if Microsoft sign-in ever fails. Hidden where the environment doesn't offer it.
 */
const CompanySsoCard = ({ ssoRequired, readOnly, onChange }) => {
	const { t } = useTranslation();
	const [available, setAvailable] = useState(false);
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState('');

	useEffect(() => {
		getSsoAvailability().then((res) => setAvailable(res?.data?.microsoft === true)).catch(() => {});
	}, []);

	if (!available) return null;

	const save = async (value) => {
		setSaving(true);
		setError('');
		try {
			const res = await setTenantSsoRequired(value);
			onChange(res?.data?.ssoRequired === true);
			setConfirmOpen(false);
		} catch (e) {
			setError(e?.response?.data?.message || t('accountSettings.company.sso.error'));
		} finally {
			setSaving(false);
		}
	};

	return (
		<Paper elevation={0} data-testid="company-sso-card" sx={{ border: `1px solid ${tokens.line.main}`, borderRadius: 2.5, p: 2.5 }}>
			<SectionHeader icon={KeyOutlinedIcon} label={t('accountSettings.company.sso.title')} />
			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
				<FormControlLabel
					control={<Switch checked={!!ssoRequired} disabled={readOnly || saving}
						onChange={(e) => (e.target.checked ? setConfirmOpen(true) : save(false))} />}
					label={<Typography sx={{ fontSize: tokens.fontSize.body2, fontWeight: 600, color: tokens.ink.strong }}>{t('accountSettings.company.sso.require')}</Typography>}
				/>
				<Typography sx={{ fontSize: tokens.fontSize.small, color: tokens.ink.muted }}>{t('accountSettings.company.sso.help')}</Typography>
				{error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}
			</Box>
			<ConfirmDialog open={confirmOpen} title={t('accountSettings.company.sso.confirmTitle')}
				confirmLabel={t('accountSettings.company.sso.confirm')} cancelLabel={t('accountSettings.company.sso.cancel')}
				onConfirm={() => save(true)} onCancel={() => setConfirmOpen(false)} busy={saving}>
				{t('accountSettings.company.sso.confirmBody')}
			</ConfirmDialog>
		</Paper>
	);
};

CompanySsoCard.propTypes = {
	ssoRequired: PropTypes.bool,
	readOnly: PropTypes.bool,
	onChange: PropTypes.func.isRequired,
};

export default CompanySsoCard;
