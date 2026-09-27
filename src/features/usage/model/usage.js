import * as tokens from '../../../theme/tokens.js';

/** Localised short date ("18 Oct 2026" / "Oct 18, 2026") for an ISO timestamp. */
export const formatUsageDate = (iso, language) =>
	iso ? new Date(iso).toLocaleDateString(language || 'en', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

/** Whole days until `iso`, never negative. */
export const daysUntil = (iso, now = Date.now()) =>
	iso ? Math.max(0, Math.ceil((new Date(iso).getTime() - now) / 86_400_000)) : 0;

/** Badge colours per forecast status (see qorva-ai UsageForecast.Status). */
export const PACE_TONE = {
	TOO_EARLY: { color: tokens.ink.muted, bg: tokens.surface.muted },
	ON_TRACK: { color: tokens.status.success.text, bg: tokens.status.success.tint },
	WATCH: { color: tokens.status.warning.text, bg: tokens.status.warning.tintAlt },
	WILL_EXCEED: { color: tokens.status.error.text, bg: tokens.status.error.tint },
	REACHED: { color: tokens.status.error.text, bg: tokens.status.error.tint },
	UNMETERED: { color: tokens.ink.muted, bg: tokens.surface.muted },
};

/** The status shown for a meter: the server's forecast, or a local fallback when it is missing (older API). */
export const paceStatus = (feature, forecast) => {
	if (forecast?.status) return forecast.status;
	if (feature?.limit == null) return 'UNMETERED';
	return feature.consumed >= feature.limit ? 'REACHED' : null;
};
