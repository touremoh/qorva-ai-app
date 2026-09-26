import { useMemo } from 'react';
import SectionHeader from '../../../shared/ui/SectionHeader.jsx';
import { Box, Paper } from '@mui/material';
import PropTypes from 'prop-types';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import InsightCard from './InsightCard.jsx';
import { TALENT_POOL_INSIGHT_CONFIG } from '../model/dashboard.js';

const TalentPoolInsightSection = ({ data, t }) => {
	const config = useMemo(() => TALENT_POOL_INSIGHT_CONFIG(t), [t]);
	const hasData = config.some(({ key }) => Array.isArray(data[key]) && data[key].length > 0);
	if (!hasData) return null;

	return (
		<Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2.5, p: 2.5 }}>
			<SectionHeader sx={{ pb: 1.5 }} icon={InsightsOutlinedIcon} label={t('dashboard.sections.talentPoolInsight', 'Talent Pool Insight')} />
			<Box sx={{
				display: 'grid',
				gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
				gap: 3,
			}}>
				{config.map(({ key, label, icon, accent, bg }) => {
					const items = data[key];
					if (!Array.isArray(items) || items.length === 0) return null;
					return (
						<InsightCard key={key} label={label} icon={icon} accent={accent} bg={bg} items={items} t={t} />
					);
				})}
			</Box>
		</Paper>
	);
};
TalentPoolInsightSection.propTypes = {
	data: PropTypes.object.isRequired,
	t: PropTypes.func.isRequired,
};

export default TalentPoolInsightSection;
