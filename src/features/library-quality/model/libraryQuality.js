import { scoreColorsFor } from '../../../shared/lib/score.js';

// Freshness issues offer criteria-level "archive all" — the only bulk that scales to thousands of hits.
export const ARCHIVABLE_ISSUES = new Set(['OUTDATED', 'UNKNOWN_FRESHNESS']);

// Parse-quality issues can be fixed by re-running AI extraction from the stored source text.
export const REANALYZABLE_ISSUES = new Set([
	'MISSING_EMAIL', 'MISSING_PHONE', 'MISSING_CONTACT',
	'NO_WORK_EXPERIENCE', 'NO_SKILLS', 'MISSING_SUMMARY',
	'LOW_PARSE_CONFIDENCE', 'UNKNOWN_FRESHNESS',
]);

export const ACTIVE_JOB_STATUSES = new Set(['PENDING', 'RUNNING']);

export const initialReport = {
	totalCVs: 0,
	overallScore: null,
	completeness: { score: 0, metrics: [] },
	freshness: { score: 0, metrics: [] },
	uniqueness: { score: 0, metrics: [] },
	parseConfidence: { score: 0, metrics: [] },
	issues: [],
};

export const scoreColor = (score) => {
	const tone = scoreColorsFor(score);
	return { color: tone.text, bg: tone.tint, accent: tone.accent };
};

export const SEVERITY_CHIP = {
	CRITICAL: { color: '#991b1b', bg: '#fee2e2' },
	HIGH: { color: '#854d0e', bg: '#fef9c3' },
	MEDIUM: { color: '#475569', bg: '#f1f5f9' },
};

export const FRESHNESS_COLORS = {
	UP_TO_DATE: '#629C44',
	REVIEW_SUGGESTED: '#f59e0b',
	OUTDATED: '#dc2626',
	UNKNOWN: '#94a3b8',
};

export const COMPLETENESS_GROUPS = [
	{ key: 'critical', fields: ['email', 'phone', 'name', 'role'] },
	{ key: 'important', fields: ['workExperience', 'keySkills', 'careerStartYear', 'education'] },
	{ key: 'enrichment', fields: ['languages', 'certifications', 'salaryExpectation', 'linkedin', 'summary'] },
];

export const FIELD_LABELS = {
	email: 'Email', phone: 'Phone', name: 'Name', role: 'Role',
	workExperience: 'Work Experience', keySkills: 'Key Skills', careerStartYear: 'Career Start Year',
	education: 'Education', languages: 'Languages', certifications: 'Certifications',
	salaryExpectation: 'Salary Expectation', linkedin: 'LinkedIn', summary: 'Summary',
};

/** One-line verdict: the overall rating, and the dimension dragging it down when one clearly is. */
export function healthVerdict(report, t) {
	const overall = report.overallScore ?? 0;
	const dimensions = [
		{ key: 'completeness', score: report.completeness.score },
		{ key: 'freshness', score: report.freshness.score },
		{ key: 'uniqueness', score: report.uniqueness.score },
		{ key: 'parseConfidence', score: report.parseConfidence.score },
	];
	const weakest = dimensions.reduce((a, b) => (b.score < a.score ? b : a));
	const rating = t(`libraryQuality.verdict.${overall >= 85 ? 'excellent' : overall >= 70 ? 'good' : overall >= 40 ? 'fair' : 'poor'}`);
	return weakest.score < 70 && weakest.score <= overall - 10
		? t('libraryQuality.verdict.drag', '{{rating}} — {{dimension}} is dragging your score down.', {
			rating, dimension: t(`libraryQuality.dimensions.${weakest.key}`) })
		: t('libraryQuality.verdict.healthy', '{{rating}} — all dimensions look healthy.', { rating });
}
