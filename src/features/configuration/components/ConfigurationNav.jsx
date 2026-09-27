import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { alpha } from '@mui/material/styles';
import * as tokens from '../../../theme/tokens.js';

/** The configuration sections, laid out like the Account Settings navigation. */
const ConfigurationNav = ({ sections, activeSection, onSelect }) => {
	const { t } = useTranslation();
	return (
		<Box component="nav" sx={{
			width: 210, flexShrink: 0,
			backgroundColor: tokens.surface.paper,
			borderRight: `1px solid ${tokens.line.main}`,
			display: 'flex', flexDirection: 'column',
			pt: 2.5, gap: 0.25,
		}}>
			<Typography sx={{ px: 2, mb: 1, fontSize: tokens.fontSize.micro, fontWeight: 700, color: tokens.ink.subtle, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
				{t('configuration.title', 'Configuration')}
			</Typography>
			{sections.map(({ id, Icon, labelKey, fallback }) => {
				const isActive = activeSection === id;
				return (
					<Box
						key={id}
						role="button"
						tabIndex={0}
						aria-current={isActive ? 'page' : undefined}
						onClick={() => onSelect(id)}
						onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') onSelect(id); }}
						sx={{
							mx: 1, display: 'flex', alignItems: 'center', gap: 1.25,
							px: 1.5, py: 1.1, borderRadius: '0 8px 8px 0',
							cursor: 'pointer',
							borderLeft: isActive ? `3px solid ${tokens.brand.main}` : '3px solid transparent',
							backgroundColor: isActive ? alpha(tokens.brand.main, 0.06) : 'transparent',
							color: isActive ? tokens.brand.main : tokens.ink.muted,
							transition: 'all 0.1s ease',
							'&:hover': {
								backgroundColor: isActive ? alpha(tokens.brand.main, 0.08) : tokens.surface.subtle,
								color: isActive ? tokens.brand.main : tokens.ink.body,
							},
						}}
					>
						<Icon sx={{ fontSize: tokens.iconSize.md }} />
						<Typography sx={{ fontSize: tokens.fontSize.body2, fontWeight: isActive ? 600 : 400 }}>
							{t(labelKey, fallback)}
						</Typography>
					</Box>
				);
			})}
		</Box>
	);
};

ConfigurationNav.propTypes = {
	sections: PropTypes.arrayOf(PropTypes.shape({
		id: PropTypes.string.isRequired,
		Icon: PropTypes.elementType.isRequired,
		labelKey: PropTypes.string.isRequired,
		fallback: PropTypes.string,
	})).isRequired,
	activeSection: PropTypes.string.isRequired,
	onSelect: PropTypes.func.isRequired,
};

export default ConfigurationNav;
