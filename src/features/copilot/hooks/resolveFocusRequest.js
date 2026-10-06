import { getCVById } from '../../cv/api/cvService.js';
import { getJobById } from '../../jobs/api/jobService.js';

const body = (res) => res?.data?.data ?? res?.data ?? null;

/**
 * Names the candidate (and job) a link opened Copilot about: with a job it is the conversation's focus, without one
 * the candidate becomes an @mention. A record that can't be read keeps its id; the API checks it again.
 */
export default async function resolveFocusRequest({ cvId, jobPostId }) {
	const [cv, job] = await Promise.all([
		getCVById(cvId).then(body).catch(() => null),
		jobPostId ? getJobById(jobPostId).then(body).catch(() => null) : Promise.resolve(null),
	]);
	const cvName = cv?.personalInformation?.name ?? null;
	if (!jobPostId) return { mention: { type: 'candidate', id: cvId, name: cvName ?? '' } };
	return { focus: { cvId, jobPostId, cvName, jobTitle: job?.title ?? null } };
}
