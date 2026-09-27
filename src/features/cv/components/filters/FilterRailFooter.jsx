import { Box, Link, Typography } from '@mui/material';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { GREEN } from '../../model/filterRail.js';
import * as tokens from '../../../../theme/tokens.js';

/** Rail footer: points at Talent Intelligence for questions the facets can't answer. */
const FilterRailFooter = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	return (
		<Box sx={{ px: 1.5, py: 1.25, borderTop: `1px solid ${tokens.line.main}`, backgroundColor: tokens.surface.paper, flexShrink: 0 }}>
			<Typography sx={{ fontSize: tokens.fontSize.caption, color: tokens.ink.muted, lineHeight: 1.4 }}>
				{t('appCVContent.filters.needMore')}{' '}
				<Link
					component="button"
					type="button"
					onClick={() => navigate('/app/intelligence')}
					sx={{ fontSize: tokens.fontSize.caption, fontWeight: 600, color: GREEN, verticalAlign: 'baseline', display: 'inline-flex', alignItems: 'center', gap: 0.25 }}
				>
					<PsychologyOutlinedIcon sx={{ fontSize: tokens.iconSize.sm }} />
					{t('appCVContent.filters.askIntelligence')}
				</Link>
			</Typography>
		</Box>
	);
};

export default FilterRailFooter;
