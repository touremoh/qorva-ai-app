import React, { useEffect, useRef, useState } from 'react';
import {
    Box,
    Button,
    CircularProgress,
    IconButton,
    Paper,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import FingerprintOutlinedIcon from '@mui/icons-material/FingerprintOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import RepeatOutlinedIcon from '@mui/icons-material/RepeatOutlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import PriceChangeOutlinedIcon from '@mui/icons-material/PriceChangeOutlined';
import { useTranslation } from 'react-i18next';
import apiClient from '../../../../axiosConfig.js';
import { getTenantById, updateTenantProfile } from '../../../services/tenantService.js';
import { TENANT_ID } from '../../../constants.js';
import QorvaChip from '../../commons/QorvaChip.jsx';
import { isDemoUser } from '../../../utils/demoMode.js';

const SectionHeader = ({ icon: Icon, label, action }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, pb: 1, borderBottom: '2px solid #629C44' }}>
        <Icon sx={{ fontSize: 15, color: '#629C44' }} />
        <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#629C44', textTransform: 'uppercase', letterSpacing: '0.07em', flex: 1 }}>
            {label}
        </Typography>
        {action}
    </Box>
);

const CARD_SX = {
    p: 1.5, borderRadius: 2,
    backgroundColor: '#f8fafc', border: '1px solid #f1f5f9',
    display: 'flex', alignItems: 'flex-start', gap: 1.25,
};

const ICON_BOX_SX = {
    width: 28, height: 28, borderRadius: 1.25, flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#ffffff', border: '1px solid #e2e8f0',
};

const LABEL_SX = { fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' };
const VALUE_SX = { fontSize: '0.85rem', color: '#0f172a', fontWeight: 500, mt: 0.25, wordBreak: 'break-all' };

const FieldCard = ({ icon: Icon, label, value }) => (
    <Box sx={CARD_SX}>
        <Box sx={ICON_BOX_SX}>
            <Icon sx={{ fontSize: 14, color: '#64748b' }} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
            <Typography sx={LABEL_SX}>{label}</Typography>
            <Typography sx={VALUE_SX}>{value || '—'}</Typography>
        </Box>
    </Box>
);

const ChipFieldCard = ({ icon: Icon, label, statusCode }) => (
    <Box sx={CARD_SX}>
        <Box sx={ICON_BOX_SX}>
            <Icon sx={{ fontSize: 14, color: '#64748b' }} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ ...LABEL_SX, mb: 0.5 }}>{label}</Typography>
            <QorvaChip statusCode={statusCode} />
        </Box>
    </Box>
);

const BTN_GREEN_SX = {
    backgroundColor: '#629C44', borderRadius: 2, textTransform: 'none',
    fontSize: '0.82rem', fontWeight: 600, boxShadow: 'none',
    '&:hover': { backgroundColor: '#4a7a33', boxShadow: 'none' },
};

const ACCEPTED_LOGO_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'];
const EMPTY_PROFILE = { tenantName: '', companyAddress: '', phoneNumber: '', contactEmail: '', websiteUrl: '' };

const formatDate = (isoString) => {
    if (!isoString) return '—';
    return new Date(isoString).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
};

const formatPrice = (cents) => {
    if (cents == null) return '—';
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(cents / 100);
};

const AccountCompanyTab = () => {
    const { t } = useTranslation();
    const demo = isDemoUser();
    const logoInputRef = useRef(null);

    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState('');

    const [profile, setProfile] = useState({ ...EMPTY_PROFILE });
    const [savedProfile, setSavedProfile] = useState({ ...EMPTY_PROFILE });

    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState('');
    const [savedLogoUrl, setSavedLogoUrl] = useState('');
    const [resolvedLogoUrl, setResolvedLogoUrl] = useState('');
    const [isDragging, setIsDragging] = useState(false);

    const [tenantReadOnly, setTenantReadOnly] = useState({ organizationId: '', subscriptionInfo: null });

    useEffect(() => {
        let objectUrl = '';
        if (!savedLogoUrl) { setResolvedLogoUrl(''); return; }
        apiClient.get('/tenants/logo', { responseType: 'blob' })
            .then(res => {
                objectUrl = URL.createObjectURL(res.data);
                setResolvedLogoUrl(objectUrl);
            })
            .catch(() => setResolvedLogoUrl(''));
        return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
    }, [savedLogoUrl]);

    useEffect(() => {
        const tenantId = localStorage.getItem(TENANT_ID);
        if (!tenantId) { setLoading(false); return; }
        getTenantById(tenantId)
            .then(res => {
                const data = res?.data?.data ?? {};
                const p = {
                    tenantName: data.tenantName ?? '',
                    companyAddress: data.companyAddress ?? '',
                    phoneNumber: data.phoneNumber ?? '',
                    contactEmail: data.contactEmail ?? '',
                    websiteUrl: data.websiteUrl ?? '',
                };
                setProfile(p);
                setSavedProfile(p);
                setSavedLogoUrl(data.companyLogoUrl ?? '');
                setTenantReadOnly({
                    organizationId: data.organizationId ?? '',
                    subscriptionInfo: data.subscriptionInfo ?? null,
                });
            })
            .catch(e => console.error('Failed to load tenant data', e))
            .finally(() => setLoading(false));
    }, []);

    const handleLogoSelect = (file) => {
        if (!file || !ACCEPTED_LOGO_TYPES.includes(file.type)) return;
        setLogoFile(file);
        setLogoPreview(URL.createObjectURL(file));
    };

    const handleLogoInputChange = (e) => {
        handleLogoSelect(e.target.files?.[0]);
        e.target.value = '';
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        handleLogoSelect(e.dataTransfer.files?.[0]);
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setSaveError('');
            const res = await updateTenantProfile(profile, logoFile);
            // PATCH /tenants/profile returns TenantDTO directly (no wrapper)
            const updated = res?.data;
            const p = {
                tenantName: updated?.tenantName ?? profile.tenantName,
                companyAddress: updated?.companyAddress ?? profile.companyAddress,
                phoneNumber: updated?.phoneNumber ?? profile.phoneNumber,
                contactEmail: updated?.contactEmail ?? profile.contactEmail,
                websiteUrl: updated?.websiteUrl ?? profile.websiteUrl,
            };
            setProfile(p);
            setSavedProfile(p);
            if (updated?.companyLogoUrl) {
                setResolvedLogoUrl('');
                setSavedLogoUrl(updated.companyLogoUrl);
            }
            if (updated?.subscriptionInfo !== undefined) {
                setTenantReadOnly(prev => ({ ...prev, subscriptionInfo: updated.subscriptionInfo }));
            }
            setLogoFile(null);
            setLogoPreview('');
            setEditMode(false);
        } catch (e) {
            console.error('Failed to update company profile', e);
            setSaveError(t('errors.server'));
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setProfile({ ...savedProfile });
        setLogoFile(null);
        setLogoPreview('');
        setSaveError('');
        setEditMode(false);
    };

    const displayLogo = logoPreview || resolvedLogoUrl;
    const displayProfile = editMode ? profile : savedProfile;

    const PROFILE_FIELDS = [
        { key: 'tenantName',     labelKey: 'accountSettings.company.tenantName',  Icon: BusinessOutlinedIcon,   type: 'text' },
        { key: 'companyAddress', labelKey: 'accountSettings.company.address',      Icon: LocationOnOutlinedIcon, type: 'text' },
        { key: 'phoneNumber',    labelKey: 'accountSettings.company.phoneNumber',  Icon: PhoneOutlinedIcon,      type: 'tel' },
        { key: 'contactEmail',   labelKey: 'accountSettings.company.contactEmail', Icon: EmailOutlinedIcon,      type: 'email' },
        { key: 'websiteUrl',     labelKey: 'accountSettings.company.websiteUrl',   Icon: LanguageOutlinedIcon,   type: 'url' },
    ];

    const sub = tenantReadOnly.subscriptionInfo;
    const billingCycleLabel = sub?.billingCycle === 'year'
        ? t('accountSettings.company.billingAnnual')
        : sub?.billingCycle === 'month'
            ? t('accountSettings.company.billingMonthly')
            : sub?.billingCycle ?? '—';
    const priceLabel = sub?.price != null && sub?.billingCycle
        ? `${formatPrice(sub.price)} / ${sub.billingCycle === 'year' ? t('accountSettings.company.billingAnnual').toLowerCase() : t('accountSettings.company.billingMonthly').toLowerCase()}`
        : '—';

    if (loading) {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 6 }}>
                <CircularProgress size={24} sx={{ color: '#629C44' }} />
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, maxWidth: 860 }}>

            {/* System information — read-only */}
            <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2.5, p: 2.5 }}>
                <SectionHeader icon={InfoOutlinedIcon} label={t('accountSettings.company.systemSection')} />
                <FieldCard
                    icon={FingerprintOutlinedIcon}
                    label={t('accountSettings.company.organizationId')}
                    value={tenantReadOnly.organizationId}
                />
            </Paper>

            {/* Subscription — read-only */}
            {sub && (
                <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2.5, p: 2.5 }}>
                    <SectionHeader icon={CreditCardOutlinedIcon} label={t('accountSettings.company.subscriptionSection')} />
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
                        <ChipFieldCard
                            icon={CreditCardOutlinedIcon}
                            label={t('accountSettings.subscriptionStatus')}
                            statusCode={sub.subscriptionStatus}
                        />
                        <FieldCard
                            icon={WorkspacePremiumOutlinedIcon}
                            label={t('accountSettings.company.subscriptionPlan')}
                            value={sub.subscriptionPlan}
                        />
                        <FieldCard
                            icon={RepeatOutlinedIcon}
                            label={t('accountSettings.company.billingCycle')}
                            value={billingCycleLabel}
                        />
                        <FieldCard
                            icon={PriceChangeOutlinedIcon}
                            label={t('accountSettings.company.subscriptionPrice')}
                            value={priceLabel}
                        />
                        <FieldCard
                            icon={EventOutlinedIcon}
                            label={t('accountSettings.company.subscriptionStart')}
                            value={formatDate(sub.currentPeriodStart)}
                        />
                        <FieldCard
                            icon={EventOutlinedIcon}
                            label={t('accountSettings.company.subscriptionRenewal')}
                            value={formatDate(sub.currentPeriodEnd)}
                        />
                    </Box>
                </Paper>
            )}

            {/* Logo section */}
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

            {/* Company fields */}
            <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2.5, p: 2.5 }}>
                <SectionHeader
                    icon={BusinessOutlinedIcon}
                    label={t('accountSettings.company.profileSection')}
                    action={!demo && !editMode && (
                        <Tooltip title={t('accountSettings.editProfile')}>
                            <IconButton
                                size="small"
                                onClick={() => setEditMode(true)}
                                sx={{ color: '#629C44', border: '1px solid rgba(98,156,68,0.3)', borderRadius: 1.5, p: 0.5 }}
                            >
                                <EditOutlinedIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                        </Tooltip>
                    )}
                />

                {editMode ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {saveError && (
                            <Typography sx={{ fontSize: '0.78rem', color: '#ef4444' }}>{saveError}</Typography>
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
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: '0.85rem' } }}
                                />
                            ))}
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                            <Button size="small" onClick={handleCancel} disabled={saving}
                                sx={{ borderRadius: 2, textTransform: 'none', fontSize: '0.82rem', color: '#64748b' }}>
                                {t('accountSettings.cancel')}
                            </Button>
                            <Button size="small" variant="contained" onClick={handleSave}
                                disabled={saving}
                                startIcon={saving ? <CircularProgress size={12} color="inherit" /> : null}
                                sx={BTN_GREEN_SX}>
                                {t('accountSettings.saveChanges')}
                            </Button>
                        </Box>
                    </Box>
                ) : (
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
                        {PROFILE_FIELDS.map(({ key, labelKey, Icon }) => (
                            <FieldCard key={key} icon={Icon} label={t(labelKey)} value={displayProfile[key]} />
                        ))}
                    </Box>
                )}
            </Paper>
        </Box>
    );
};

export default AccountCompanyTab;
