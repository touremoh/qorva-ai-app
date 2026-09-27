import PropTypes from 'prop-types';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CloseIcon from '@mui/icons-material/Close';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { useTranslation } from 'react-i18next';
import * as tokens from '../../../../theme/tokens.js';

/** Anonymize, email, download and close actions above the resume (not printed). */
const CvActionBar = ({ anonymized, canContact, handleDownload, onClose, openEmailComposer, setAnonymized }) => {
	const { t } = useTranslation();
	return (
		<>
		<Box sx={{
			display: 'flex',
			alignItems: 'center',
			px: 2.5,
			py: 1.25,
			backgroundColor: tokens.surface.paper,
			borderBottom: `1px solid ${tokens.line.main}`,
			flexShrink: 0,
		}}>
			{/* Anonymize toggle */}
			<Tooltip title={anonymized ? t('appCVContent.showIdentity') : t('appCVContent.anonymize')}>
				<Box
					onClick={() => setAnonymized(a => !a)}
					sx={{
						display: 'flex', alignItems: 'center', gap: 0.75,
						px: 1.25, py: 0.5, borderRadius: 1.5, cursor: 'pointer',
						border: `1px solid ${anonymized ? `${tokens.status.error.soft}` : `${tokens.line.main}`}`,
						backgroundColor: anonymized ? `${tokens.status.error.pale}` : `${tokens.surface.subtle}`,
						transition: 'all 0.15s ease',
						'&:hover': { backgroundColor: anonymized ? `${tokens.status.error.tint}` : `${tokens.surface.muted}` },
					}}
				>
					{anonymized
						? <VisibilityOffOutlinedIcon sx={{ fontSize: tokens.iconSize.sm, color: tokens.status.error.bright }} />
						: <VisibilityOutlinedIcon sx={{ fontSize: tokens.iconSize.sm, color: tokens.ink.muted }} />
					}
					<Typography sx={{
						fontSize: tokens.fontSize.caption, fontWeight: 600,
						color: anonymized ? `${tokens.status.error.bright}` : `${tokens.ink.muted}`,
					}}>
						{anonymized ? t('appCVContent.showIdentity') : t('appCVContent.anonymize')}
					</Typography>
				</Box>
			</Tooltip>

			<Box sx={{ flexGrow: 1 }} />

			{/* Email the candidate — hidden while anonymized (the address is hidden too) */}
			{canContact && !anonymized && (
				<Tooltip title={t('candidateOutreach.emailCandidate')}>
					<IconButton
						size="small"
						onClick={openEmailComposer}
						sx={{
							color: tokens.brand.text,
							borderRadius: 1.5,
							border: `1px solid ${tokens.line.main}`,
							mr: 1,
							'&:hover': { backgroundColor: tokens.surface.muted },
						}}
					>
						<MailOutlineIcon sx={{ fontSize: tokens.iconSize.md }} />
					</IconButton>
				</Tooltip>
			)}

			<Tooltip title={t('appCVContent.downloadCV')}>
				<IconButton
					size="small"
					onClick={handleDownload}
					sx={{
						color: tokens.ink.muted,
						borderRadius: 1.5,
						border: `1px solid ${tokens.line.main}`,
						mr: 1,
						'&:hover': { backgroundColor: tokens.surface.muted },
					}}
				>
					<FileDownloadIcon sx={{ fontSize: tokens.iconSize.md }} />
				</IconButton>
			</Tooltip>

			{onClose && (
				<IconButton
					size="small"
					onClick={onClose}
					sx={{
						color: tokens.ink.muted,
						borderRadius: 1.5,
						border: `1px solid ${tokens.line.main}`,
						'&:hover': { backgroundColor: tokens.surface.muted },
					}}
				>
					<CloseIcon sx={{ fontSize: tokens.iconSize.md }} />
				</IconButton>
			)}
		</Box>
		</>
	);
};

CvActionBar.propTypes = {
	anonymized: PropTypes.any,
	canContact: PropTypes.bool,
	handleDownload: PropTypes.func,
	onClose: PropTypes.func,
	openEmailComposer: PropTypes.func,
	setAnonymized: PropTypes.func,
};

export default CvActionBar;
