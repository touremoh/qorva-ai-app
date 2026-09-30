import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import { useTranslation } from 'react-i18next';
import { alpha } from '@mui/material/styles';
import * as tokens from '../../../theme/tokens.js';

const EXAMPLES = ['copilot.empty.examples.topCandidates', 'copilot.empty.examples.count', 'copilot.empty.examples.compare', 'copilot.empty.examples.usage'];

/** First screen of a conversation: what Copilot can do today, and example tasks to start from. */
const CopilotEmptyState = ({ onPick }) => {
	const { t } = useTranslation();
	return (
		<Box sx={{ textAlign: 'center', py: { xs: 3, md: 6 } }} data-testid="copilot-empty">
			<Box sx={{
				width: 48, height: 48, mx: 'auto', mb: 1.5, borderRadius: '50%',
				backgroundColor: alpha(tokens.brand.main, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center',
			}}>
				<SmartToyOutlinedIcon sx={{ fontSize: tokens.iconSize.xl, color: tokens.brand.text }} />
			</Box>
			<Typography sx={{ fontSize: tokens.fontSize.lg, fontWeight: 700, color: tokens.ink.strong }}>
				{t('copilot.empty.title')}
			</Typography>
			<Typography sx={{ fontSize: tokens.fontSize.body2, color: tokens.ink.subtle, mt: 0.75, maxWidth: 520, mx: 'auto' }}>
				{t('copilot.empty.subtitle')}
			</Typography>
			<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.25, mt: 3, maxWidth: 640, mx: 'auto' }}>
				{EXAMPLES.map((key) => (
					<ButtonBase
						key={key}
						onClick={() => onPick(t(key))}
						data-testid="copilot-example"
						sx={{
							justifyContent: 'flex-start',
							textAlign: 'left',
							p: 1.5,
							borderRadius: 2,
							border: `1px solid ${tokens.line.main}`,
							backgroundColor: tokens.surface.paper,
							'&:hover': { borderColor: tokens.brand.main, backgroundColor: alpha(tokens.brand.main, 0.04) },
						}}
					>
						<Typography sx={{ fontSize: tokens.fontSize.caption, color: tokens.ink.body, lineHeight: 1.5 }}>{t(key)}</Typography>
					</ButtonBase>
				))}
			</Box>
		</Box>
	);
};

CopilotEmptyState.propTypes = {
	onPick: PropTypes.func.isRequired,
};

export default CopilotEmptyState;
