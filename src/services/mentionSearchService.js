import { getCVs, searchCVs } from './cvService.js';
import { getJobs } from './jobService.js';

const PAGE_SIZE = 8;

const truncate = (text, max = 80) => {
    if (!text) return '';
    return text.length > max ? `${text.slice(0, max).trim()}…` : text;
};

const extractContent = (res) =>
    res?.data?.data?.content ?? res?.data?.content ?? res?.data?.data ?? res?.data ?? [];

const mapCandidates = (raw) =>
    (Array.isArray(raw) ? raw : []).map((cv) => {
        const name = cv?.personalInformation?.name || 'Unknown';
        const latestExperience = Array.isArray(cv?.workExperience) ? cv.workExperience[0] : null;
        const subtitle = latestExperience?.title || latestExperience?.company || cv?.personalInformation?.email || '';
        return { type: 'candidate', id: cv?.id ?? cv?._id, name, subtitle };
    }).filter((m) => m.id);

const mapJobs = (raw) =>
    (Array.isArray(raw) ? raw : []).map((job) => {
        const name = job?.title || 'Untitled job';
        const subtitle = job?.jobReference || truncate(job?.description);
        return { type: 'job', id: job?.id ?? job?._id, name, subtitle };
    }).filter((m) => m.id);

const searchCandidates = async (term) => {
    const request = term
        ? searchCVs({ pageNumber: 0, pageSize: PAGE_SIZE, searchTerms: term })
        : getCVs({ pageNumber: 0, pageSize: PAGE_SIZE });
    try {
        const res = await request;
        return mapCandidates(extractContent(res));
    } catch {
        return [];
    }
};

const searchJobs = async (term) => {
    const params = { pageNumber: 0, pageSize: PAGE_SIZE };
    if (term) {
        params.title = term;
        params.description = term;
    }
    try {
        const res = await getJobs(params);
        return mapJobs(extractContent(res));
    } catch {
        return [];
    }
};

export const searchMentions = async (query, kind) => {
    const term = (query ?? '').trim();
    if (kind === 'job') return searchJobs(term);
    return searchCandidates(term);
};
