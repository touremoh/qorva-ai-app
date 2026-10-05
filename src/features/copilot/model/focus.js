/**
 * The candidate and job a Copilot conversation is about. Opened from a report (candidate + job) or a CV
 * (candidate only, which becomes an @mention); the API keeps it on the conversation once its first request starts.
 */

/** Link that opens Copilot about a candidate, for a job when given. */
export const copilotLink = ({ cvId, jobPostId } = {}) => {
	const params = new URLSearchParams({ tab: 'chat' });
	if (cvId) params.set('cvId', cvId);
	if (jobPostId) params.set('jobPostId', jobPostId);
	return `/app/copilot?${params}`;
};

/** { cvId, jobPostId } from the page's URL, or null when it names no candidate. */
export const focusFromParams = (params) => {
	const cvId = params?.get('cvId');
	return cvId ? { cvId, jobPostId: params.get('jobPostId') || null } : null;
};

/** The focus of a conversation's runs: the most recent run that has one. */
export const conversationFocus = (runs = []) => [...runs].reverse().find((r) => r?.focus)?.focus ?? null;

/** What POST /agent/runs takes: a candidate and a job, or nothing. */
export const toWireFocus = (focus) => (focus?.cvId && focus?.jobPostId
	? { cvId: focus.cvId, jobPostId: focus.jobPostId } : undefined);
