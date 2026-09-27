import { useCallback, useEffect, useMemo, useState } from 'react';
import { TENANT_ID } from '../../../constants.js';

// Every value here is sent to GET /cvs as-is (arrays joined with commas), so the keys
// are the backend param names — see CVQueryBuilder.java.
export const EMPTY_FILTERS = {
	seniority: [],
	leadership: [],
	availability: [],
	skillDepth: [],
	industries: [],
	locations: [],
	skills: [],
	tags: [],
	source: [],
	minYearsOfExperience: '',
	maxYearsOfExperience: '',
	createdAfter: '',
	updatedAfter: '',
};

export const DEFAULT_SORT = 'lastUpdatedAt,desc';

const storageKey = () => `cvFilters:${localStorage.getItem(TENANT_ID) || 'anon'}`;

const isSet = (v) => Array.isArray(v) ? v.length > 0 : String(v ?? '').trim() !== '';

export const countActiveFilters = (filters) =>
	Object.values(filters).filter(isSet).length;

/** Turns the filter state (+ quick search + sort) into GET /cvs query params, dropping anything unset. */
export const toQueryParams = (filters, sort, quickSearch = '') => {
	const params = {};
	Object.entries(filters).forEach(([key, value]) => {
		if (!isSet(value)) return;
		params[key] = Array.isArray(value) ? value.join(',') : String(value).trim();
	});
	if (isSet(quickSearch)) params.q = quickSearch.trim();
	if (sort && sort !== DEFAULT_SORT) params.sort = sort;
	return params;
};

const load = () => {
	try {
		const raw = sessionStorage.getItem(storageKey());
		if (!raw) return null;
		const parsed = JSON.parse(raw);
		const { name, ...filters } = parsed.filters || {}; // `name` was a rail filter before the quick search existed
		return {
			filters: { ...EMPTY_FILTERS, ...filters },
			sort: parsed.sort || DEFAULT_SORT,
			open: Boolean(parsed.open),
			quickSearch: typeof parsed.quickSearch === 'string' ? parsed.quickSearch : (name || ''),
		};
	} catch {
		return null;
	}
};

/**
 * Filter state for the CV list, shared by the rail (edits it) and the list (queries with it).
 * Persisted per tenant in sessionStorage so leaving the tab and coming back keeps the filter.
 */
export default function useCVFilters() {
	const initial = useMemo(load, []);
	const [filters, setFilters] = useState(initial?.filters ?? EMPTY_FILTERS);
	const [sort, setSort] = useState(initial?.sort ?? DEFAULT_SORT);
	const [filtersOpen, setFiltersOpen] = useState(initial?.open ?? false);
	const [quickSearch, setQuickSearch] = useState(initial?.quickSearch ?? '');

	useEffect(() => {
		try {
			sessionStorage.setItem(storageKey(), JSON.stringify({ filters, sort, open: filtersOpen, quickSearch }));
		} catch {
			// storage unavailable (private mode, quota) — filters simply don't survive navigation
		}
	}, [filters, sort, filtersOpen, quickSearch]);

	const setFilter = useCallback((key, value) =>
		setFilters(prev => ({ ...prev, [key]: value })), []);

	const clearFilters = useCallback(() => setFilters(EMPTY_FILTERS), []);

	const activeCount = useMemo(() => countActiveFilters(filters), [filters]);

	return {
		filters, setFilter, clearFilters, activeCount,
		sort, setSort,
		filtersOpen, setFiltersOpen,
		quickSearch, setQuickSearch,
	};
}
