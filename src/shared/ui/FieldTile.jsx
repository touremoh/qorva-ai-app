import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';

/**
 * A read-only field: icon, small uppercase label, and its value (or custom content, e.g. a status
 * chip, passed as children). An empty value shows an em dash.
 */
export default function FieldTile({ icon: Icon, label, value, children }) {
	return (
		<Box sx={{
			p: 1.5, borderRadius: 2,
			backgroundColor: 'surface.subtle', border: '1px solid', borderColor: 'surface.muted',
			display: 'flex', alignItems: 'flex-start', gap: 1.25,
		}}>
			<Box sx={{
				width: 28, height: 28, borderRadius: 1.25, flexShrink: 0,
				display: 'flex', alignItems: 'center', justifyContent: 'center',
				backgroundColor: 'surface.paper', border: '1px solid', borderColor: 'line.main',
			}}>
				<Icon sx={{ fontSize: 14, color: 'ink.muted' }} />
			</Box>
			<Box sx={{ minWidth: 0 }}>
				<Typography sx={{
					fontSize: '0.65rem', color: 'ink.subtle', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
					...(children ? { mb: 0.5 } : {}),
				}}>
					{label}
				</Typography>
				{children ?? (
					<Typography sx={{ fontSize: '0.85rem', color: 'ink.strong', fontWeight: 500, mt: 0.25, wordBreak: 'break-all' }}>
						{value || '—'}
					</Typography>
				)}
			</Box>
		</Box>
	);
}

FieldTile.propTypes = {
	icon: PropTypes.elementType.isRequired,
	label: PropTypes.node,
	value: PropTypes.node,
	children: PropTypes.node,
};
