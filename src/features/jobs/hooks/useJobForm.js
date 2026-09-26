import { useState } from 'react';
import { suggestScoringRules } from '../api/jobService.js';
import { descriptionToHtml, jdTextToHtml, sanitizeDescription } from '../../../utils/jobDescription.js';
import { emptyScoringConfig, loadScoringConfig } from '../model/scoringConfig.js';

/**
 * The job post form shared by create and edit: title, description, scoring rules, and the AI
 * helpers (a drafted post from the JD builder, a scoring-rules pre-fill when entering step 2).
 */
export default function useJobForm() {
	const [jobTitle, setJobTitle] = useState('');
	const [jobDescription, setJobDescription] = useState('');
	const [scoringConfig, setScoringConfig] = useState(emptyScoringConfig());
	// AI pre-fill of scoring rules (create mode only). lastSuggestedFor guards against
	// re-billing an LLM call when the user bounces Back/Next without changing the description.
	const [aiPrefillBusy, setAiPrefillBusy] = useState(false);
	const [aiPrefillApplied, setAiPrefillApplied] = useState(false);
	const [lastSuggestedFor, setLastSuggestedFor] = useState(null);

	const resetForm = () => {
		setJobTitle(''); setJobDescription('');
		setAiPrefillApplied(false); setAiPrefillBusy(false); setLastSuggestedFor(null);
	};

	/** Shows a saved job's title and description in the form. */
	const loadJob = (job) => {
		setJobTitle(job.title);
		setJobDescription(descriptionToHtml(job.description));
	};

	// Applies an AI draft: title, description, and the scoring rules the backend suggested with it.
	const handleJdDraft = (draft) => {
		const html = jdTextToHtml(draft.description);
		if (draft.title) setJobTitle(draft.title);
		setJobDescription(html);
		// The backend already suggested scoring rules for this draft (free) — apply
		// them and mark the draft as suggested so step 2 skips the metered re-suggest.
		if (draft.scoringRules) {
			setScoringConfig(loadScoringConfig({ scoringRules: draft.scoringRules }));
			setAiPrefillApplied(true);
			setLastSuggestedFor(`${draft.title || jobTitle}::${html}`);
		}
	};

	/**
	 * Lets AI draft the scoring rules — only when the form is still untouched and the description
	 * changed since the last suggestion. Failures fall back silently to the empty form
	 * (accelerator, not blocker).
	 */
	const prefillScoringRules = async () => {
		const descriptionKey = `${jobTitle}::${jobDescription}`;
		const formUntouched = JSON.stringify(scoringConfig) === JSON.stringify(emptyScoringConfig()) || aiPrefillApplied;
		if (!jobDescription || !formUntouched || descriptionKey === lastSuggestedFor) return;
		setAiPrefillBusy(true);
		try {
			const res = await suggestScoringRules(jobTitle, sanitizeDescription(jobDescription));
			const suggestion = res.data?.data ?? res.data;
			if (suggestion) {
				setScoringConfig(loadScoringConfig({ scoringRules: suggestion }));
				setAiPrefillApplied(true);
				setLastSuggestedFor(descriptionKey);
			}
		} catch (error) {
			console.error('Scoring rules pre-fill failed (falling back to manual setup):', error);
		} finally {
			setAiPrefillBusy(false);
		}
	};

	return {
		jobTitle, setJobTitle, jobDescription, setJobDescription, scoringConfig, setScoringConfig,
		aiPrefillBusy, aiPrefillApplied, resetForm, loadJob, handleJdDraft, prefillScoringRules,
	};
}
