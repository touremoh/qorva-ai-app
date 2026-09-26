import PropTypes from 'prop-types';
import SectionHeader from '../../../../shared/ui/SectionHeader.jsx';
import { Box, Typography, Grid2 } from '@mui/material';
import ContactsIcon from '@mui/icons-material/Contacts';
import Card from './Card.jsx';
import { useTranslation } from 'react-i18next';
import * as tokens from '../../../../theme/tokens.js';

/** Referees, with contact details hidden while the resume is anonymized. */
const ReferencesSection = ({ anonymized, references }) => {
	const { t } = useTranslation();
	return (
		<>
		{references.length > 0 && (
			<Card sx={{ mb: 2 }}>
				<SectionHeader tone="document" icon={ContactsIcon} label={t('appCVContent.references')} />
				<Grid2 container spacing={1.5}>
					{references.map((ref, i) => (
						<Grid2 key={i} size={{ xs: 12, sm: 6 }}>
							<Box sx={{ p: 1.5, backgroundColor: tokens.surface.subtle, borderRadius: 1.5, border: `1px solid ${tokens.surface.muted}` }}>
								<Typography sx={{ fontWeight: 700, fontSize: '0.84rem', color: tokens.ink.strong }}>
									{ref.name}
								</Typography>
								{(ref.position || ref.company) && (
									<Typography sx={{ fontSize: '0.78rem', color: tokens.brand.text, fontWeight: 600 }}>
										{[ref.position, ref.company].filter(Boolean).join(' — ')}
									</Typography>
								)}
								{!anonymized && ref.contact?.phone && (
									<Typography sx={{ fontSize: '0.75rem', color: tokens.ink.muted }}>{ref.contact.phone}</Typography>
								)}
								{!anonymized && ref.contact?.email && (
									<Typography sx={{ fontSize: '0.75rem', color: tokens.ink.muted }}>{ref.contact.email}</Typography>
								)}
							</Box>
						</Grid2>
					))}
				</Grid2>
			</Card>
		)}
		</>
	);
};

ReferencesSection.propTypes = {
	anonymized: PropTypes.any,
	references: PropTypes.any,
};

export default ReferencesSection;
