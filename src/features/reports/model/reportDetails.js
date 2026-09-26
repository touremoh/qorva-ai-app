import { scoreColorsFor } from '../../../shared/lib/score.js';
import * as tokens from '../../../theme/tokens.js';
import { alpha } from '@mui/material/styles';

export const THEME_GREEN = tokens.brand.main;

export const importanceKey = {
	MANDATORY: 'mandatory', mandatory: 'mandatory',
	IMPORTANT: 'important', important: 'important',
	NICE_TO_HAVE: 'niceToHave', nice_to_have: 'niceToHave',
};

export const importanceChipSx = {
	mandatory:  { backgroundColor: tokens.status.error.tint, color: tokens.status.error.main, border: `1px solid ${tokens.status.error.border}` },
	important:  { backgroundColor: tokens.status.warning.tint, color: tokens.score.fair.text, border: `1px solid ${tokens.status.warning.border}` },
	niceToHave: { backgroundColor: tokens.status.info.paleBlue, color: tokens.status.info.deep, border: `1px solid ${tokens.status.info.borderBlue}` },
};

export const severityChipSx = {
	high:   { backgroundColor: tokens.status.error.tint, color: tokens.status.error.main, border: `1px solid ${tokens.status.error.border}` },
	medium: { backgroundColor: tokens.status.warning.tint, color: tokens.score.fair.text, border: `1px solid ${tokens.status.warning.border}` },
	low:    { backgroundColor: tokens.status.info.paleBlue, color: tokens.status.info.deep, border: `1px solid ${tokens.status.info.borderBlue}` },
};

export const RECOMMENDATION_CONFIG = {
	strong_interview: { bg: tokens.status.success.tint, color: tokens.status.success.strong, border: tokens.status.success.mint },
	interview:        { bg: tokens.status.success.mintPale, color: tokens.status.success.emerald, border: tokens.status.success.mintBright },
	may_be:           { bg: tokens.status.warning.tint, color: tokens.score.fair.text, border: tokens.status.warning.border },
	reject:           { bg: tokens.status.error.tint, color: tokens.status.error.main, border: tokens.status.error.border },
};

export const CONFIDENCE_CONFIG = {
	high:   { bg: alpha(tokens.brand.main, 0.10),  color: THEME_GREEN },
	medium: { bg: 'rgba(245,158,11,0.10)', color: tokens.status.warning.main  },
	low:    { bg: 'rgba(220,38,38,0.10)',  color: tokens.status.error.main  },
};

export const getColor = (v) => scoreColorsFor(v).main;

export const getBg    = (v) => scoreColorsFor(v).tint;
