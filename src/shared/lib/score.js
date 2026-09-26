import { score as scoreColors } from '../../theme/tokens.js';

/**
 * The one rule for colouring a match score: good from 70, fair from 40, poor below.
 * `scale` is the score's maximum: 100 for percentages, 1 for the 0–1 scores some APIs return.
 */
export function scoreTone(score, scale = 100) {
	const percent = (Number(score) / scale) * 100;
	if (percent >= 70) return 'good';
	if (percent >= 40) return 'fair';
	return 'poor';
}

/** The token colours for a score's tone: `text` on `tint` for chips, `main` for strokes, `soft` backgrounds. */
export function scoreColorsFor(score, scale = 100) {
	return scoreColors[scoreTone(score, scale)];
}
