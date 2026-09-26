import { useEffect, useRef, useState } from 'react';
import {
    Box,
    CircularProgress,
} from '@mui/material';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import { useTranslation } from 'react-i18next';
import { getTenantById, getTenantLogo, updateTenantProfile } from '../api/tenantService.js';
import { TENANT_ID } from '../../../constants.js';
import { isDemoUser } from '../../../utils/demoMode.js';
import CompanyProfileCard from './company/CompanyProfileCard.jsx';
import CompanyLogoCard from './company/CompanyLogoCard.jsx';
import SubscriptionSummary from './company/SubscriptionSummary.jsx';
import CompanySystemInfo from './company/CompanySystemInfo.jsx';
import { formatUsdCents } from '../../../shared/lib/format.js';
import * as tokens from '../../../theme/tokens.js';


const ACCEPTED_LOGO_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'];
const EMPTY_PROFILE = { tenantName: '', companyAddress: '', phoneNumber: '', contactEmail: '', websiteUrl: '' };



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
        getTenantLogo()
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
        ? `${formatUsdCents(sub.price)} / ${sub.billingCycle === 'year' ? t('accountSettings.company.billingAnnual').toLowerCase() : t('accountSettings.company.billingMonthly').toLowerCase()}`
        : '—';

    if (loading) {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 6 }}>
                <CircularProgress size={24} sx={{ color: tokens.brand.text }} />
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, maxWidth: 860 }}>

            {/* System information — read-only */}
            <CompanySystemInfo tenantReadOnly={tenantReadOnly} />

            {/* Subscription — read-only */}
            <SubscriptionSummary billingCycleLabel={billingCycleLabel} priceLabel={priceLabel} sub={sub} />

            {/* Logo section */}
            <CompanyLogoCard
                displayLogo={displayLogo}
                editMode={editMode}
                handleDrop={handleDrop}
                handleLogoInputChange={handleLogoInputChange}
                isDragging={isDragging}
                logoFile={logoFile}
                logoInputRef={logoInputRef}
                setIsDragging={setIsDragging}
            />

            {/* Company fields */}
            <CompanyProfileCard
                PROFILE_FIELDS={PROFILE_FIELDS}
                demo={demo}
                displayProfile={displayProfile}
                editMode={editMode}
                handleCancel={handleCancel}
                handleSave={handleSave}
                profile={profile}
                saveError={saveError}
                saving={saving}
                setEditMode={setEditMode}
                setProfile={setProfile}
            />
        </Box>
    );
};

export default AccountCompanyTab;
