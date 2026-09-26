import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';

const TONES = {
	// Section titles in cards and panels: green icon and label.
	brand: { iconSize: 15, label: { fontSize: '0.7rem', color: 'brand.main', letterSpacing: '0.07em' } },
	// Section titles inside a document (resume, job scoring): quieter grey label, tighter spacing.
	document: { iconSize: 14, spacing: { mb: 1.5, pb: 0.75 }, label: { fontSize: '0.68rem', color: 'ink.muted', letterSpacing: '0.08em' } },
};

/**
 * The uppercase title above a section, underlined in brand green, with an optional action on the right.
 * Spacing differs per screen today; pass it through `sx` (it is unified in the readability phase).
 */
export default function SectionHeader({ icon: Icon, label, action, tone = 'brand', sx }) {
	const style = TONES[tone];
	return (
		<Box sx={{
			display: 'flex', alignItems: 'center', gap: 1, mb: 2, pb: 1, flexShrink: 0,
			borderBottom: '2px solid', borderColor: 'brand.main',
			...style.spacing,
			...sx,
		}}>
			{Icon && <Icon sx={{ fontSize: style.iconSize, color: 'brand.main' }} />}
			<Typography sx={{ ...style.label, fontWeight: 700, textTransform: 'uppercase', flex: 1 }}>
				{label}
			</Typography>
			{action}
		</Box>
	);
}

SectionHeader.propTypes = {
	icon: PropTypes.elementType,
	label: PropTypes.node,
	action: PropTypes.node,
	tone: PropTypes.oneOf(['brand', 'document']),
	sx: PropTypes.object,
};
