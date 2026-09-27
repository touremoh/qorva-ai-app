/** Mention parsing for the insight composer: `@` mentions a candidate, `#` a job. */

const MAX_QUERY_LENGTH = 50;

const TRIGGER_TO_KIND = { '@': 'candidate', '#': 'job' };
const KIND_TO_TRIGGER = { candidate: '@', job: '#' };

export const mentionKey = (m) => `${m.type}:${m.id}`;
export const mentionPrefix = (type) => KIND_TO_TRIGGER[type] ?? '@';

const isCompletedMentionAt = (text, atPos, triggerChar, attachedMentions) => {
    if (!attachedMentions?.length) return false;
    const kind = TRIGGER_TO_KIND[triggerChar];
    if (!kind) return false;
    const scoped = attachedMentions.filter((m) => m.type === kind);
    const sorted = [...scoped].sort((a, b) => (b.name?.length ?? 0) - (a.name?.length ?? 0));
    for (const m of sorted) {
        if (!m.name) continue;
        const marker = `${triggerChar}${m.name}`;
        if (text.startsWith(marker, atPos)) {
            const nextChar = text[atPos + marker.length];
            if (nextChar === undefined || /\s/.test(nextChar)) return true;
        }
    }
    return false;
};

export const findActiveMention = (text, caret, attachedMentions = []) => {
    if (caret == null || caret < 0) return null;
    let start = caret - 1;
    while (start >= 0) {
        const ch = text[start];
        if (ch === '\n') return null;
        if (ch === '@' || ch === '#') {
            const prev = start > 0 ? text[start - 1] : '';
            const atWordBoundary = prev === '' || /\s/.test(prev);
            if (!atWordBoundary) return null;
            if (isCompletedMentionAt(text, start, ch, attachedMentions)) {
                start -= 1;
                continue;
            }
            const query = text.slice(start + 1, caret);
            if (query.length > MAX_QUERY_LENGTH) return null;
            return { start, query, trigger: ch, kind: TRIGGER_TO_KIND[ch] };
        }
        start -= 1;
    }
    return null;
};
