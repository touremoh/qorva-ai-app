import { useCallback, useEffect, useState } from 'react';
import { toastError } from '../../../utils/errorHandler.js';
import {
	createAgentRule,
	deleteAgentRule,
	listAgentRules,
	pauseAgentRule,
	resumeAgentRule,
	updateAgentRule,
} from '../api/agentService.js';
import { toRuleRequest } from '../model/agentRule.js';

/** Rules tab: the user's rules (or the team's), and the dialog that creates or edits one. */
export default function useAgentRules() {
	const [scope, setScope] = useState('mine');
	const [rules, setRules] = useState([]);
	const [loading, setLoading] = useState(true);
	const [editing, setEditing] = useState(null);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [ruleToDelete, setRuleToDelete] = useState(null);
	const [busy, setBusy] = useState(false);

	const load = useCallback((quiet = false) => {
		if (!quiet) setLoading(true);
		return listAgentRules(scope)
			.then((res) => setRules(res.data ?? []))
			.catch((e) => { if (!quiet) toastError(e); })
			.finally(() => { if (!quiet) setLoading(false); });
	}, [scope]);

	useEffect(() => { load(); }, [load]);

	const replace = useCallback((rule) => setRules((current) => current.map((r) => (r.id === rule.id ? rule : r))), []);

	const openNew = useCallback(() => { setEditing(null); setDialogOpen(true); }, []);
	const openEdit = useCallback((rule) => { setEditing(rule); setDialogOpen(true); }, []);
	const closeDialog = useCallback(() => setDialogOpen(false), []);

	/** Saves the form; the dialog shows the error and stays open when the server refuses. */
	const save = useCallback(async (form) => {
		const request = toRuleRequest(form);
		const res = editing ? await updateAgentRule(editing.id, request) : await createAgentRule(request);
		setDialogOpen(false);
		if (editing) replace(res.data); else load(true);
		return res.data;
	}, [editing, load, replace]);

	const togglePause = useCallback(async (rule) => {
		try {
			const res = rule.status === 'PAUSED' ? await resumeAgentRule(rule.id) : await pauseAgentRule(rule.id);
			replace(res.data);
		} catch (e) {
			toastError(e);
		}
	}, [replace]);

	const confirmDelete = useCallback(async () => {
		if (!ruleToDelete) return;
		setBusy(true);
		try {
			await deleteAgentRule(ruleToDelete.id);
			setRules((current) => current.filter((r) => r.id !== ruleToDelete.id));
			setRuleToDelete(null);
		} catch (e) {
			toastError(e);
		} finally {
			setBusy(false);
		}
	}, [ruleToDelete]);

	const changeScope = useCallback((next) => { if (next) setScope(next); }, []);

	return {
		busy, changeScope, closeDialog, confirmDelete, dialogOpen, editing, loading, openEdit, openNew,
		ruleToDelete, rules, save, scope, setRuleToDelete, togglePause,
	};
}
