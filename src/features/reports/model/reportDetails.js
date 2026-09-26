import { scoreColorsFor } from '../../../shared/lib/score.js';

export const THEME_GREEN = '#629C44';

export const importanceKey = {
	MANDATORY: 'mandatory', mandatory: 'mandatory',
	IMPORTANT: 'important', important: 'important',
	NICE_TO_HAVE: 'niceToHave', nice_to_have: 'niceToHave',
};

export const importanceChipSx = {
	mandatory:  { backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca' },
	important:  { backgroundColor: '#fef9c3', color: '#854d0e', border: '1px solid #fde68a' },
	niceToHave: { backgroundColor: '#dbeafe', color: '#1d4ed8', border: '1px solid #bfdbfe' },
};

export const severityChipSx = {
	high:   { backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca' },
	medium: { backgroundColor: '#fef9c3', color: '#854d0e', border: '1px solid #fde68a' },
	low:    { backgroundColor: '#dbeafe', color: '#1d4ed8', border: '1px solid #bfdbfe' },
};

export const RECOMMENDATION_CONFIG = {
	strong_interview: { bg: '#dcfce7', color: '#15803d', border: '#86efac' },
	interview:        { bg: '#d1fae5', color: '#059669', border: '#6ee7b7' },
	may_be:           { bg: '#fef9c3', color: '#854d0e', border: '#fde68a' },
	reject:           { bg: '#fee2e2', color: '#dc2626', border: '#fecaca' },
};

export const CONFIDENCE_CONFIG = {
	high:   { bg: 'rgba(98,156,68,0.10)',  color: THEME_GREEN },
	medium: { bg: 'rgba(245,158,11,0.10)', color: '#d97706'  },
	low:    { bg: 'rgba(220,38,38,0.10)',  color: '#dc2626'  },
};

export const getColor = (v) => scoreColorsFor(v).main;

export const getBg    = (v) => scoreColorsFor(v).tint;
