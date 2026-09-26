import PropTypes from 'prop-types';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CloseIcon from '@mui/icons-material/Close';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { useTranslation } from 'react-i18next';

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
			backgroundColor: '#ffffff',
			borderBottom: '1px solid #e2e8f0',
			flexShrink: 0,
		}}>
			{/* Anonymize toggle */}
			<Tooltip title={anonymized ? t('appCVContent.showIdentity') : t('appCVContent.anonymize')}>
				<Box
					onClick={() => setAnonymized(a => !a)}
					sx={{
						display: 'flex', alignItems: 'center', gap: 0.75,
						px: 1.25, py: 0.5, borderRadius: 1.5, cursor: 'pointer',
						border: `1px solid ${anonymized ? '#fca5a5' : '#e2e8f0'}`,
						backgroundColor: anonymized ? '#fef2f2' : '#f8fafc',
						transition: 'all 0.15s ease',
						'&:hover': { backgroundColor: anonymized ? '#fee2e2' : '#f1f5f9' },
					}}
				>
					{anonymized
						? <VisibilityOffOutlinedIcon sx={{ fontSize: 14, color: '#ef4444' }} />
						: <VisibilityOutlinedIcon sx={{ fontSize: 14, color: '#64748b' }} />
					}
					<Typography sx={{
						fontSize: '0.72rem', fontWeight: 600,
						color: anonymized ? '#ef4444' : '#64748b',
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
							color: '#629C44',
							borderRadius: 1.5,
							border: '1px solid #e2e8f0',
							mr: 1,
							'&:hover': { backgroundColor: '#f1f5f9' },
						}}
					>
						<MailOutlineIcon sx={{ fontSize: 16 }} />
					</IconButton>
				</Tooltip>
			)}

			<Tooltip title={t('appCVContent.downloadCV')}>
				<IconButton
					size="small"
					onClick={handleDownload}
					sx={{
						color: '#64748b',
						borderRadius: 1.5,
						border: '1px solid #e2e8f0',
						mr: 1,
						'&:hover': { backgroundColor: '#f1f5f9' },
					}}
				>
					<FileDownloadIcon sx={{ fontSize: 16 }} />
				</IconButton>
			</Tooltip>

			{onClose && (
				<IconButton
					size="small"
					onClick={onClose}
					sx={{
						color: '#64748b',
						borderRadius: 1.5,
						border: '1px solid #e2e8f0',
						'&:hover': { backgroundColor: '#f1f5f9' },
					}}
				>
					<CloseIcon sx={{ fontSize: 16 }} />
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
