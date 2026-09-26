import PropTypes from 'prop-types';
import SectionHeader from '../../../../shared/ui/SectionHeader.jsx';
import { Typography } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Card from './Card.jsx';
import { useTranslation } from 'react-i18next';
import * as tokens from '../../../../theme/tokens.js';

/** The candidate's profile summary. */
const SummarySection = ({ candidateProfileSummary }) => {
	const { t } = useTranslation();
	return (
		<>
		{candidateProfileSummary && (
			<Card sx={{ mb: 2 }}>
				<SectionHeader tone="document" icon={InfoOutlinedIcon} label={t('appCVContent.summary')} />
				<Typography sx={{ fontSize: '0.84rem', color: tokens.ink.body, lineHeight: 1.7 }}>
					{candidateProfileSummary}
				</Typography>
			</Card>
		)}
		</>
	);
};

SummarySection.propTypes = {
	candidateProfileSummary: PropTypes.any,
};

export default SummarySection;
