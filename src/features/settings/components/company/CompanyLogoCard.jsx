import PropTypes from 'prop-types';
import SectionHeader from '../../../../shared/ui/SectionHeader.jsx';
import { Box, Button, Paper, Typography } from '@mui/material';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import { useTranslation } from 'react-i18next';

/** Uploads, previews and removes the company logo used on shared documents. */
const CompanyLogoCard = ({ displayLogo, editMode, handleDrop, handleLogoInputChange, isDragging, logoFile, logoInputRef, setIsDragging }) => {
    const { t } = useTranslation();
    return (
        <>
        <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2.5, p: 2.5 }}>
            <SectionHeader icon={AddPhotoAlternateOutlinedIcon} label={t('accountSettings.company.logo')} />

            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2.5, flexWrap: 'wrap' }}>
                <Box
                    sx={{
                        width: 100, height: 100, borderRadius: 2.5, flexShrink: 0,
                        border: `2px dashed ${isDragging ? '#629C44' : '#e2e8f0'}`,
                        backgroundColor: isDragging ? 'rgba(98,156,68,0.04)' : '#f8fafc',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        overflow: 'hidden', transition: 'all 0.15s ease',
                        cursor: editMode ? 'pointer' : 'default',
                        ...(editMode && {
                            '&:hover': { borderColor: '#629C44', backgroundColor: 'rgba(98,156,68,0.04)' },
                        }),
                    }}
                    onClick={() => editMode && logoInputRef.current?.click()}
                    onDragOver={editMode ? (e) => { e.preventDefault(); setIsDragging(true); } : undefined}
                    onDragLeave={editMode ? () => setIsDragging(false) : undefined}
                    onDrop={editMode ? handleDrop : undefined}
                >
                    {displayLogo ? (
                        <Box
                            component="img"
                            src={displayLogo}
                            alt="Company logo"
                            sx={{ width: '100%', height: '100%', objectFit: 'contain', p: 1 }}
                        />
                    ) : (
                        <BusinessOutlinedIcon sx={{ fontSize: 36, color: '#cbd5e1' }} />
                    )}
                </Box>

                <Box sx={{ flex: 1, minWidth: 180 }}>
                    <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', mb: 0.5 }}>
                        {t('accountSettings.company.logoTitle')}
                    </Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8', mb: 1.5, lineHeight: 1.5 }}>
                        {t('accountSettings.company.logoHint')}
                    </Typography>
                    {editMode && (
                        <Button
                            size="small"
                            variant="outlined"
                            startIcon={<AddPhotoAlternateOutlinedIcon sx={{ fontSize: 15 }} />}
                            onClick={() => logoInputRef.current?.click()}
                            sx={{
                                borderRadius: 2, textTransform: 'none', fontSize: '0.78rem',
                                borderColor: '#629C44', color: '#629C44',
                                '&:hover': { borderColor: '#4a7a33', backgroundColor: 'rgba(98,156,68,0.04)' },
                            }}
                        >
                            {logoFile ? t('accountSettings.company.changeLogo') : t('accountSettings.company.uploadLogo')}
                        </Button>
                    )}
                    {logoFile && (
                        <Typography sx={{ fontSize: '0.72rem', color: '#629C44', mt: 0.75 }}>
                            {logoFile.name}
                        </Typography>
                    )}
                </Box>
            </Box>

            <input
                ref={logoInputRef}
                type="file"
                accept=".png,.jpg,.jpeg,.svg,.webp"
                onChange={handleLogoInputChange}
                style={{ display: 'none' }}
            />
        </Paper>
        </>
    );
};

CompanyLogoCard.propTypes = {
    displayLogo: PropTypes.any,
    editMode: PropTypes.bool,
    handleDrop: PropTypes.func,
    handleLogoInputChange: PropTypes.func,
    isDragging: PropTypes.bool,
    logoFile: PropTypes.any,
    logoInputRef: PropTypes.any,
    setIsDragging: PropTypes.func,
};

export default CompanyLogoCard;
