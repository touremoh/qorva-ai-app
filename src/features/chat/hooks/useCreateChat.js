import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createChat } from '../api/chatService.js';
import { getCVs, searchCVs } from '../../cv/api/cvService.js';
import { getJobs } from '../../jobs/api/jobService.js';
import { findReportByCriteria } from '../../reports/api/reportService.js';
import { buildChatTitle, getCandidateIdFromCV } from '../model/chat.js';

/**
 * The "new chat" dialog: resume search, job list, the matching report of the chosen pair (looked
 * up as soon as both are picked), and creating the chat. `onCreated` receives the new chat.
 */
export default function useCreateChat({ userLang, onCreated }) {
	const { t, i18n } = useTranslation();
	const onCreatedRef = useRef(onCreated);
	useEffect(() => { onCreatedRef.current = onCreated; });
	const [openCreateModal, setOpenCreateModal] = useState(false);

	const [creatingChat, setCreatingChat] = useState(false);

	const [cvList, setCvList] = useState([]);

	const [jobs, setJobs] = useState([]);

	const [selectedCV, setSelectedCV] = useState(null);

	const [selectedJob, setSelectedJob] = useState(null);

	const [customTitle, setCustomTitle] = useState('');

	const [resumeMatch, setResumeMatch] = useState(null);

	const [selectedResumeMatchId, setSelectedResumeMatchId] = useState('');

	const [loadingResumeMatch, setLoadingResumeMatch] = useState(false);

	const [cvSearch, setCvSearch] = useState('');

	const [copiedJobRef, setCopiedJobRef] = useState(null);

	const handleCopyJobRef = (ref, e) => {
		e.stopPropagation();
		navigator.clipboard.writeText(ref).catch(() => {});
		setCopiedJobRef(ref);
		setTimeout(() => setCopiedJobRef(null), 1500);
	};

	const getAllCVEntries = async () => getCVs({ pageNumber: 0, pageSize: 10 });

	const searchCVEntriesByCriteria = async (searchTerm) =>
		searchCVs({ pageNumber: 0, pageSize: 10, searchTerms: searchTerm.trim() });

	const handleSearchChange = async (value) => {
		setCvSearch(value);
		try {
			let response;
			if (!value || value.length === 0) {
				response = await getAllCVEntries();
			} else {
				response = await searchCVEntriesByCriteria(value);
			}
			setCvList(response?.data?.data?.content ?? response?.data?.content ?? []);
		} catch (error) {
			console.error('Error during search:', error);
		}
	};

	const loadModalData = async () => {
		try {
			const cvResp = await getAllCVEntries();
			setCvList(cvResp?.data?.data?.content ?? cvResp?.data?.content ?? []);
		} catch { setCvList([]); }
		try {
			const jobsResp = await getJobs({ pageSize: 10, pageNumber: 0 });
			setJobs(jobsResp?.data?.data?.content ?? jobsResp?.data?.content ?? []);
		} catch { setJobs([]); }
	};

	const openCreateChatModal = async () => {
		setSelectedCV(null); setSelectedJob(null);
		setResumeMatch(null); setSelectedResumeMatchId('');
		setCustomTitle(''); setCvSearch('');
		setOpenCreateModal(true);
		await loadModalData();
	};

	const closeCreateChatModal = () => { if (!creatingChat) setOpenCreateModal(false); };

	useEffect(() => {
		const candidateId = getCandidateIdFromCV(selectedCV);
		if (!openCreateModal || !selectedCV || !selectedJob || !candidateId) {
			setResumeMatch(null); setSelectedResumeMatchId(''); return;
		}
		let cancelled = false;
		const search = async () => {
			try {
				setLoadingResumeMatch(true);
				const resp = await findReportByCriteria({ jobPostId: selectedJob.id, candidateInfo: { candidateId } });
				if (cancelled) return;
				const found = resp?.data?.data || null;
				setResumeMatch(found);
				setSelectedResumeMatchId(found?.id || '');
				if (!customTitle && selectedCV && selectedJob) setCustomTitle(buildChatTitle(selectedCV, selectedJob));
			} catch {
				if (!cancelled) { setResumeMatch(null); setSelectedResumeMatchId(''); }
			} finally {
				if (!cancelled) setLoadingResumeMatch(false);
			}
		};
		search();
		return () => { cancelled = true; };
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [openCreateModal, selectedCV, selectedJob]);

	const handleCreateChat = async () => {
		if (!selectedCV || !selectedJob) {
			alert(t('appAIResumeChat.selectCvAndJob'));
			return;
		}
		try {
			setCreatingChat(true);
			const locale = userLang || i18n.language || 'en';
			const title = buildChatTitle(selectedCV, selectedJob) || customTitle?.trim();
			const body = {
				title, cvId: selectedCV.id, jobPostId: selectedJob.id,
				...(selectedResumeMatchId ? { matchingReportId: selectedResumeMatchId } : {}),
				participants: [{ role: 'OWNER' }],
				language: locale,
			};
			const resp = await createChat(body);
			const created = resp?.data;
			await onCreatedRef.current?.(created);
			setOpenCreateModal(false);
		} catch (e) {
			console.error('Error creating chat:', e);
		} finally {
			setCreatingChat(false);
		}
	};

	const cvOptionKey = (cv) => cv?.id ?? `${cv?.personalInformation?.name ?? 'cv'}-${cv?.createdAt ?? ''}`;

	const cvOptions = useMemo(() => {
		const seen = new Set();
		return (cvList || []).filter(cv => {
			const k = cvOptionKey(cv);
			if (seen.has(k)) return false;
			seen.add(k); return true;
		});
	}, [cvList]);

	// A resume edited elsewhere (context panel): keep the picker's copy in sync.
	const syncCv = (updated) => setCvList(prev => prev.map(c => (c.id === updated.id ? updated : c)));

	return {
		syncCv,
		openCreateModal, creatingChat, jobs, selectedCV, setSelectedCV, selectedJob, setSelectedJob, customTitle, setCustomTitle, resumeMatch, loadingResumeMatch, cvSearch, copiedJobRef, handleCopyJobRef, handleSearchChange, openCreateChatModal, closeCreateChatModal, handleCreateChat, cvOptionKey, cvOptions,
	};
}
