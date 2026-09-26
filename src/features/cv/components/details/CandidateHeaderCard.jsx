import PropTypes from 'prop-types';
import { getInitials } from '../../../../shared/lib/text.js';
import { Box, Typography, Avatar, Chip, Tooltip } from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';
import LanguageIcon from '@mui/icons-material/Language';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import FingerprintOutlinedIcon from '@mui/icons-material/FingerprintOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import CheckIcon from '@mui/icons-material/Check';
import { safeExternalUrl } from '../../../../utils/safeUrl.js';
import { fontFamilyMono } from '../../../../theme/tokens.js';
import Card from './Card.jsx';
import { contactChipSx } from '../../model/cvDetailsStyles.js';
import { useTranslation } from 'react-i18next';
import * as tokens from '../../../../theme/tokens.js';
import { alpha } from '@mui/material/styles';

/** Name, role, reference number and contact links (hidden while anonymized). */
const CandidateHeaderCard = ({ anonymized, applicantNumber, canContact, contact, handleCopyRef, openEmailComposer, pi, refCopied }) => {
	const { t } = useTranslation();
	return (
		<>
		<Card sx={{ mb: 2, display: 'flex', alignItems: 'flex-start', gap: 2 }}>
			{anonymized ? (
				<Avatar sx={{
					width: 52, height: 52, flexShrink: 0,
					backgroundColor: tokens.surface.muted, color: tokens.ink.subtle,
					border: `2px dashed ${tokens.line.strong}`,
				}}>
					<PersonOutlinedIcon sx={{ fontSize: 28 }} />
				</Avatar>
			) : (
				<Avatar sx={{
					width: 52, height: 52,
					fontSize: '1.1rem', fontWeight: 700,
					backgroundColor: tokens.brand.main, color: tokens.ink.inverse,
					flexShrink: 0,
				}}>
					{getInitials(pi.name)}
				</Avatar>
			)}
			<Box sx={{ flex: 1, minWidth: 0 }}>
				{anonymized ? (
					<Tooltip title={refCopied ? t('appCVContent.copied', 'Copied!') : t('appCVContent.copyReference', 'Copy reference')} placement="top">
						<Box
							onClick={applicantNumber ? handleCopyRef : undefined}
							sx={{
								display: 'inline-flex', alignItems: 'center', gap: 0.75,
								cursor: applicantNumber ? 'pointer' : 'default',
								px: 1, py: 0.4, borderRadius: 1.5,
								border: `1px solid ${refCopied ? alpha(tokens.brand.main, 0.3) : `${tokens.line.main}`}`,
								backgroundColor: refCopied ? alpha(tokens.brand.main, 0.06) : `${tokens.surface.subtle}`,
								transition: 'all 0.15s ease',
								'&:hover': applicantNumber ? { backgroundColor: tokens.surface.muted, borderColor: tokens.line.strong } : {},
							}}
						>
							<Typography sx={{ fontWeight: 700, fontSize: '1rem', lineHeight: 1.2, fontFamily: fontFamilyMono, letterSpacing: '0.04em', color: refCopied ? `${tokens.brand.main}` : `${tokens.ink.muted}` }}>
								{applicantNumber ? `#${applicantNumber}` : t('appCVContent.identityHidden', 'Identity hidden')}
							</Typography>
							{applicantNumber && (
								refCopied
									? <CheckIcon sx={{ fontSize: 14, color: tokens.brand.text }} />
									: <ContentCopyOutlinedIcon sx={{ fontSize: 13, color: tokens.ink.subtle }} />
							)}
						</Box>
					</Tooltip>
				) : (
					<Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: tokens.ink.strong, lineHeight: 1.2 }}>
						{pi.name}
					</Typography>
				)}
				{pi.role && (
					<Typography sx={{ fontSize: '0.85rem', color: tokens.ink.muted, mt: 0.25 }}>
						{pi.role}
					</Typography>
				)}
				{/* Reference number — always visible */}
				{applicantNumber && (
					<Tooltip title={refCopied ? t('appCVContent.copied', 'Copied!') : t('appCVContent.copyReference', 'Copy reference')} placement="top">
						<Box
							onClick={handleCopyRef}
							sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, mt: 0.5, cursor: 'pointer', '&:hover': { opacity: 0.75 } }}
						>
							<FingerprintOutlinedIcon sx={{ fontSize: 11, color: refCopied ? `${tokens.brand.main}` : `${tokens.ink.subtle}` }} />
							<Typography sx={{ fontSize: '0.70rem', color: refCopied ? `${tokens.brand.main}` : `${tokens.ink.subtle}`, fontFamily: fontFamilyMono, letterSpacing: '0.03em' }}>
								{t('appCVContent.referenceNumber')}: {applicantNumber}
							</Typography>
							{refCopied
								? <CheckIcon sx={{ fontSize: 12, color: tokens.brand.text }} />
								: <ContentCopyOutlinedIcon sx={{ fontSize: 11, color: tokens.ink.subtle }} />
							}
						</Box>
					</Tooltip>
				)}
				{/* Contact details — hidden when anonymized */}
				{!anonymized ? (
					<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1.25 }}>
						{contact.phone && (
							<Chip icon={<PhoneIcon />} label={contact.phone} size="small" sx={contactChipSx} />
						)}
						{contact.email && (
							canContact ? (
								<Tooltip title={t('candidateOutreach.emailCandidate')}>
									<Chip icon={<EmailIcon />} label={contact.email} size="small" sx={contactChipSx}
										onClick={openEmailComposer} clickable />
								</Tooltip>
							) : (
								<Chip icon={<EmailIcon />} label={contact.email} size="small" sx={contactChipSx} />
							)
						)}
						{contact.socialLinks?.linkedin && (safeExternalUrl(contact.socialLinks.linkedin) ? (
							<Chip icon={<LinkedInIcon />} label="LinkedIn" size="small" sx={contactChipSx}
								component="a" href={safeExternalUrl(contact.socialLinks.linkedin)} target="_blank" rel="noopener noreferrer" clickable />
						) : (
							<Chip icon={<LinkedInIcon />} label="LinkedIn" size="small" sx={contactChipSx} />
						))}
						{contact.socialLinks?.github && (safeExternalUrl(contact.socialLinks.github) ? (
							<Chip icon={<GitHubIcon />} label="GitHub" size="small" sx={contactChipSx}
								component="a" href={safeExternalUrl(contact.socialLinks.github)} target="_blank" rel="noopener noreferrer" clickable />
						) : (
							<Chip icon={<GitHubIcon />} label="GitHub" size="small" sx={contactChipSx} />
						))}
						{contact.socialLinks?.website && (safeExternalUrl(contact.socialLinks.website) ? (
							<Chip icon={<LanguageIcon />} label="Portfolio" size="small" sx={contactChipSx}
								component="a" href={safeExternalUrl(contact.socialLinks.website)} target="_blank" rel="noopener noreferrer" clickable />
						) : (
							<Chip icon={<LanguageIcon />} label="Portfolio" size="small" sx={contactChipSx} />
						))}
					</Box>
				) : (
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
						<VisibilityOffOutlinedIcon sx={{ fontSize: 12, color: tokens.ink.faint }} />
						<Typography sx={{ fontSize: '0.72rem', color: tokens.ink.faint, fontStyle: 'italic' }}>
							{t('appCVContent.contactHidden')}
						</Typography>
					</Box>
				)}
			</Box>
		</Card>
		</>
	);
};

CandidateHeaderCard.propTypes = {
	anonymized: PropTypes.any,
	applicantNumber: PropTypes.any,
	canContact: PropTypes.bool,
	contact: PropTypes.any,
	handleCopyRef: PropTypes.func,
	openEmailComposer: PropTypes.func,
	pi: PropTypes.any,
	refCopied: PropTypes.any,
};

export default CandidateHeaderCard;
