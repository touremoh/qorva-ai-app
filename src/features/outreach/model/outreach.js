import { brandButtonSx, outlinedButtonSx } from '../../../shared/ui/buttonSx.js';

export const THEME_GREEN = '#629C44';

export const DOCK_WIDTH = 520;

export const LANGUAGES = ['en', 'fr', 'de', 'es', 'it', 'nl', 'pt'];

export const INTENTS = ['INTRO', 'INTERVIEW', 'FOLLOW_UP', 'KEEP_WARM', 'CUSTOM'];

export const TONES = ['', 'formal', 'friendly', 'short'];

export const SUBJECT_MAX = 200;

export const BODY_MAX = 8000;

export const SHORTER_CONTEXT_CHARS = 700;

export const primaryButtonSx = brandButtonSx('0.78rem');

export const neutralButtonSx = outlinedButtonSx('0.78rem');

export const inputSx = { fontSize: '0.82rem', borderRadius: 1.5, backgroundColor: '#fff' };

export const errorCodeOf = (err) => err?.response?.data?.errorCode;
