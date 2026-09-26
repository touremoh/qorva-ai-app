import PropTypes from 'prop-types';
import SectionHeader from '../../../../shared/ui/SectionHeader.jsx';
import { Box, Button, CircularProgress, IconButton, InputAdornment, Paper, TextField, Typography } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import { useTranslation } from 'react-i18next';
import { brandPillButtonSx } from '../../../../shared/ui/buttonSx.js';
import * as tokens from '../../../../theme/tokens.js';
import { alpha } from '@mui/material/styles';

/** Changes the signed-in user's password. */
const PasswordCard = ({ PW_FIELDS, handleCancelPw, handleSavePassword, pwError, pwMode, pwValues, savingPw, setPwError, setPwMode, setPwValues, setShowPw, showPw }) => {
	const { t } = useTranslation();
	return (
		<>
		<Paper elevation={0} sx={{ border: `1px solid ${tokens.line.main}`, borderRadius: 2.5, p: 2.5 }}>
			<SectionHeader
				icon={LockOutlinedIcon}
				label={t('accountSettings.security')}
				action={!pwMode && (
					<Button size="small" onClick={() => setPwMode(true)}
						sx={{ borderRadius: 2, textTransform: 'none', fontSize: tokens.fontSize.caption, color: tokens.brand.text, border: `1px solid ${alpha(tokens.brand.main, 0.3)}`, py: 0.25, px: 1 }}>
						{t('accountSettings.changePassword')}
					</Button>
				)}
			/>
			{pwMode ? (
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
					{pwError && (
						<Typography sx={{ fontSize: tokens.fontSize.small, color: tokens.status.error.bright }}>{pwError}</Typography>
					)}
					{PW_FIELDS.map(({ field, labelKey, showKey }) => (
						<TextField
							key={field} size="small" label={t(labelKey)} fullWidth
							type={showPw[showKey] ? 'text' : 'password'}
							value={pwValues[field]}
							onChange={e => { setPwError(''); setPwValues(p => ({ ...p, [field]: e.target.value })); }}
							InputProps={{
								endAdornment: (
									<InputAdornment position="end">
										<IconButton size="small" onClick={() => setShowPw(p => ({ ...p, [showKey]: !p[showKey] }))}>
											{showPw[showKey]
												? <VisibilityOffOutlinedIcon sx={{ fontSize: tokens.iconSize.md }} />
												: <VisibilityOutlinedIcon sx={{ fontSize: tokens.iconSize.md }} />
											}
										</IconButton>
									</InputAdornment>
								),
							}}
							sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: tokens.fontSize.body2 } }}
						/>
					))}
					<Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
						<Button size="small" onClick={handleCancelPw}
							sx={{ borderRadius: 2, textTransform: 'none', fontSize: tokens.fontSize.body2, color: tokens.ink.muted }}>
							{t('accountSettings.cancel')}
						</Button>
						<Button size="small" variant="contained" onClick={handleSavePassword}
							disabled={savingPw || !pwValues.currentPassword || !pwValues.newPassword || !pwValues.confirmPassword}
							startIcon={savingPw ? <CircularProgress size={12} color="inherit" /> : null}
							sx={brandPillButtonSx}>
							{t('accountSettings.saveChanges')}
						</Button>
					</Box>
				</Box>
			) : (
				<Typography sx={{ fontSize: tokens.fontSize.body2, color: tokens.ink.subtle }}>
					{t('accountSettings.passwordHint')}
				</Typography>
			)}
		</Paper>
		</>
	);
};

PasswordCard.propTypes = {
	PW_FIELDS: PropTypes.any,
	handleCancelPw: PropTypes.func,
	handleSavePassword: PropTypes.func,
	pwError: PropTypes.any,
	pwMode: PropTypes.any,
	pwValues: PropTypes.any,
	savingPw: PropTypes.any,
	setPwError: PropTypes.func,
	setPwMode: PropTypes.func,
	setPwValues: PropTypes.func,
	setShowPw: PropTypes.func,
	showPw: PropTypes.bool,
};

export default PasswordCard;
