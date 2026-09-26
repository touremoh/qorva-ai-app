import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LanguageIcon from '@mui/icons-material/Language';
import { useTranslation } from 'react-i18next';
import { safeExternalUrl } from '../../../../utils/safeUrl.js';

const ContactLine = ({ icon: Icon, children }) => (
	<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
		<Icon sx={{ fontSize: 11, color: 'ink.subtle' }} />
		{children}
	</Box>
);

ContactLine.propTypes = { icon: PropTypes.elementType.isRequired, children: PropTypes.node };

/**
 * "Presented by" header on shared documents: the tenant's logo (or a placeholder), name and contact
 * details. `sx` styles the container, which differs between the resume view and the report view.
 */
const TenantBrandHeader = ({ tenant, logoUrl, sx }) => {
	const { t } = useTranslation();
	return (
		<Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5, backgroundColor: 'surface.paper', ...sx }}>
			{logoUrl ? (
				<Box
					component="img"
					src={logoUrl}
					alt={tenant.tenantName}
					sx={{ height: 36, maxWidth: 100, objectFit: 'contain', flexShrink: 0 }}
				/>
			) : (
				<Box sx={{
					width: 36, height: 36, borderRadius: 1.5, flexShrink: 0,
					display: 'flex', alignItems: 'center', justifyContent: 'center',
					backgroundColor: 'rgba(98,156,68,0.08)', border: '1px solid rgba(98,156,68,0.2)',
				}}>
					<BusinessOutlinedIcon sx={{ fontSize: 18, color: 'brand.main' }} />
				</Box>
			)}
			<Box sx={{ flex: 1, minWidth: 0 }}>
				<Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: 'ink.strong', lineHeight: 1.3 }}>
					{tenant.tenantName}
				</Typography>
				<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 0.4 }}>
					{tenant.contactEmail && (
						<ContactLine icon={EmailIcon}>
							<Typography sx={{ fontSize: '0.72rem', color: 'ink.muted' }}>{tenant.contactEmail}</Typography>
						</ContactLine>
					)}
					{tenant.phoneNumber && (
						<ContactLine icon={PhoneIcon}>
							<Typography sx={{ fontSize: '0.72rem', color: 'ink.muted' }}>{tenant.phoneNumber}</Typography>
						</ContactLine>
					)}
					{tenant.websiteUrl && (
						<ContactLine icon={LanguageIcon}>
							<Typography
								component="a"
								href={safeExternalUrl(tenant.websiteUrl) ?? undefined}
								target="_blank"
								rel="noopener noreferrer"
								sx={{ fontSize: '0.72rem', color: 'brand.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
							>
								{tenant.websiteUrl.replace(/^https?:\/\//, '')}
							</Typography>
						</ContactLine>
					)}
				</Box>
			</Box>
			<Typography sx={{ fontSize: '0.65rem', color: 'line.strong', fontStyle: 'italic', flexShrink: 0, alignSelf: 'flex-start' }}>
				{t('appCVContent.presentedBy')}
			</Typography>
		</Box>
	);
};

TenantBrandHeader.propTypes = {
	tenant: PropTypes.shape({
		tenantName: PropTypes.string,
		contactEmail: PropTypes.string,
		phoneNumber: PropTypes.string,
		websiteUrl: PropTypes.string,
	}).isRequired,
	logoUrl: PropTypes.string,
	sx: PropTypes.object,
};

export default TenantBrandHeader;
