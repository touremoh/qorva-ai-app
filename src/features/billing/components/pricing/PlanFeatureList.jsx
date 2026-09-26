import PropTypes from 'prop-types';
import { List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RemoveIcon from '@mui/icons-material/Remove';
import { useTranslation } from 'react-i18next';
import * as tokens from '../../../../theme/tokens.js';

/** A plan's feature list: included features ticked, the rest dimmed. */
const PlanFeatureList = ({ features, inverted }) => {
	const { t } = useTranslation();
	return (
		<List disablePadding sx={{ flexGrow: 1, mb: 3 }}>
			{features.map((feat, idx) => (
				<ListItem key={idx} sx={{ px: 0, py: 0.6 }}>
					<ListItemIcon sx={{ minWidth: 28 }}>
						{feat.included ? (
							<CheckCircleOutlineIcon
								sx={{
									fontSize: tokens.iconSize.md,
									color: inverted ? 'rgba(255,255,255,0.85)' : `${tokens.brand.main}`,
								}}
							/>
						) : (
							<RemoveIcon
								sx={{
									fontSize: tokens.iconSize.md,
									color: inverted ? 'rgba(255,255,255,0.2)' : 'text.disabled',
								}}
							/>
						)}
					</ListItemIcon>
					<ListItemText
						primary={t(feat.labelKey)}
						primaryTypographyProps={{
							variant: 'body2',
							sx: {
								fontSize: tokens.fontSize.small,
								color: feat.included
									? inverted ? `${tokens.surface.paper}` : 'text.primary'
									: inverted ? 'rgba(255,255,255,0.28)' : 'text.disabled',
								fontWeight: feat.included ? 500 : 400,
							},
						}}
					/>
				</ListItem>
			))}
		</List>
	);
};

PlanFeatureList.propTypes = {
	features: PropTypes.arrayOf(PropTypes.shape({
		labelKey: PropTypes.string.isRequired,
		included: PropTypes.bool.isRequired,
	})).isRequired,
	/** Light-on-dark colours, for the recommended plan's dark card. */
	inverted: PropTypes.bool,
};

export default PlanFeatureList;
