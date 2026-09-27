import PropTypes from 'prop-types';
import FieldTile from '../../../../shared/ui/FieldTile.jsx';
import SectionHeader from '../../../../shared/ui/SectionHeader.jsx';
import { Box, Button, CircularProgress, IconButton, Paper, TextField, Tooltip, Typography } from '@mui/material';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { brandPillButtonSx } from '../../../../shared/ui/buttonSx.js';
import { useTranslation } from 'react-i18next';
import * as tokens from '../../../../theme/tokens.js';
import { alpha } from '@mui/material/styles';

/** The company's contact details, read-only or in edit mode. */
const CompanyProfileCard = ({ PROFILE_FIELDS, readOnly, displayProfile, editMode, handleCancel, handleSave, profile, saveError, saving, setEditMode, setProfile }) => {
    const { t } = useTranslation();
    return (
        <>
        <Paper elevation={0} sx={{ border: `1px solid ${tokens.line.main}`, borderRadius: 2.5, p: 2.5 }}>
            <SectionHeader
                icon={BusinessOutlinedIcon}
                label={t('accountSettings.company.profileSection')}
                action={!readOnly && !editMode && (
                    <Tooltip title={t('accountSettings.editProfile')}>
                        <IconButton
                            size="small"
                            onClick={() => setEditMode(true)}
                            sx={{ color: tokens.brand.text, border: `1px solid ${alpha(tokens.brand.main, 0.3)}`, borderRadius: 1.5, p: 0.5 }}
                        >
                            <EditOutlinedIcon sx={{ fontSize: tokens.iconSize.sm }} />
                        </IconButton>
                    </Tooltip>
                )}
            />

            {editMode ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {saveError && (
                        <Typography sx={{ fontSize: tokens.fontSize.small, color: tokens.status.error.bright }}>{saveError}</Typography>
                    )}
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
                        {PROFILE_FIELDS.map(({ key, labelKey, type }) => (
                            <TextField
                                key={key}
                                size="small"
                                label={t(labelKey)}
                                type={type}
                                value={profile[key]}
                                onChange={e => setProfile(p => ({ ...p, [key]: e.target.value }))}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: tokens.fontSize.body2 } }}
                            />
                        ))}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Button size="small" onClick={handleCancel} disabled={saving}
                            sx={{ borderRadius: 2, textTransform: 'none', fontSize: tokens.fontSize.body2, color: tokens.ink.muted }}>
                            {t('accountSettings.cancel')}
                        </Button>
                        <Button size="small" variant="contained" onClick={handleSave}
                            disabled={saving}
                            startIcon={saving ? <CircularProgress size={12} color="inherit" /> : null}
                            sx={brandPillButtonSx}>
                            {t('accountSettings.saveChanges')}
                        </Button>
                    </Box>
                </Box>
            ) : (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
                    {PROFILE_FIELDS.map(({ key, labelKey, Icon }) => (
                        <FieldTile key={key} icon={Icon} label={t(labelKey)} value={displayProfile[key]} />
                    ))}
                </Box>
            )}
        </Paper>
        </>
    );
};

CompanyProfileCard.propTypes = {
    PROFILE_FIELDS: PropTypes.any,
    readOnly: PropTypes.bool,
    displayProfile: PropTypes.any,
    editMode: PropTypes.bool,
    handleCancel: PropTypes.func,
    handleSave: PropTypes.func,
    profile: PropTypes.any,
    saveError: PropTypes.any,
    saving: PropTypes.bool,
    setEditMode: PropTypes.func,
    setProfile: PropTypes.func,
};

export default CompanyProfileCard;
