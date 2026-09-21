// eslint-disable-next-line no-unused-vars
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { getOutreachContext } from '../services/candidateOutreachService.js';

// App-level state of the candidate outreach composer (the Gmail-style dock, bottom-right).
// One composer at a time; it lives above AppContent so switching panels never closes it.
// Entry points call openComposer({ cvId, ... }); the provider loads the backend context
// (candidate name/email, suppression, the caller's mailbox state, contact history).

const CandidateOutreachContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useCandidateOutreach = () => useContext(CandidateOutreachContext);

export const CandidateOutreachProvider = ({ children }) => {
	// target: { cvId, candidateName?, jobPostId?, matchingReportId?, jobTitle?, score? }
	const [target, setTarget] = useState(null);
	const [minimized, setMinimized] = useState(false);
	const [context, setContext] = useState(null);
	const [contextLoading, setContextLoading] = useState(false);
	const [contextError, setContextError] = useState(null);

	const loadContext = useCallback(async (cvId) => {
		setContextLoading(true);
		setContextError(null);
		try {
			const res = await getOutreachContext(cvId);
			setContext(res.data);
		} catch (err) {
			setContextError(err);
		} finally {
			setContextLoading(false);
		}
	}, []);

	const openComposer = useCallback((nextTarget) => {
		if (!nextTarget?.cvId) return;
		setTarget(nextTarget);
		setMinimized(false);
		setContext(null);
		loadContext(nextTarget.cvId);
	}, [loadContext]);

	const close = useCallback(() => {
		setTarget(null);
		setContext(null);
		setContextError(null);
		setMinimized(false);
	}, []);

	const minimize = useCallback(() => setMinimized(true), []);
	const restore = useCallback(() => setMinimized(false), []);

	// After a send or hand-off the dock prepends the new row itself — no refetch round-trip.
	const prependHistory = useCallback((entry) => {
		setContext(prev => prev ? { ...prev, history: [entry, ...(prev.history ?? [])] } : prev);
	}, []);

	const patchContext = useCallback((patch) => {
		setContext(prev => prev ? { ...prev, ...patch } : prev);
	}, []);

	const value = useMemo(() => ({
		target,
		isOpen: Boolean(target),
		minimized,
		context,
		contextLoading,
		contextError,
		openComposer,
		close,
		minimize,
		restore,
		reloadContext: () => target && loadContext(target.cvId),
		prependHistory,
		patchContext,
	}), [target, minimized, context, contextLoading, contextError, openComposer, close, minimize, restore, loadContext, prependHistory, patchContext]);

	return <CandidateOutreachContext.Provider value={value}>{children}</CandidateOutreachContext.Provider>;
};

CandidateOutreachProvider.propTypes = {
	children: PropTypes.node,
};
