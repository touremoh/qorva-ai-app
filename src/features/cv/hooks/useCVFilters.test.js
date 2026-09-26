import { describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import useCVFilters, { countActiveFilters, DEFAULT_SORT, EMPTY_FILTERS, toQueryParams } from './useCVFilters.js';
import { TENANT_ID } from '../../../constants.js';

describe('toQueryParams', () => {
	it('drops unset filters, joins arrays and trims values', () => {
		const params = toQueryParams({
			...EMPTY_FILTERS,
			seniority: ['senior', 'lead'],
			skills: ['Java'],
			minYearsOfExperience: ' 3 ',
			createdAfter: '',
		}, DEFAULT_SORT);

		expect(params).toEqual({ seniority: 'senior,lead', skills: 'Java', minYearsOfExperience: '3' });
	});

	it('sends the quick search as q and omits the default sort', () => {
		expect(toQueryParams(EMPTY_FILTERS, DEFAULT_SORT, '  jane ')).toEqual({ q: 'jane' });
		expect(toQueryParams(EMPTY_FILTERS, 'name,asc', '')).toEqual({ sort: 'name,asc' });
	});

	it('keeps the backend parameter names as keys (they are the API contract)', () => {
		expect(Object.keys(EMPTY_FILTERS)).toEqual([
			'seniority', 'leadership', 'availability', 'skillDepth', 'industries', 'locations', 'skills',
			'tags', 'source', 'minYearsOfExperience', 'maxYearsOfExperience', 'createdAfter', 'updatedAfter',
		]);
	});
});

describe('countActiveFilters', () => {
	it('counts only groups that are set', () => {
		expect(countActiveFilters(EMPTY_FILTERS)).toBe(0);
		expect(countActiveFilters({ ...EMPTY_FILTERS, tags: ['a'], maxYearsOfExperience: '10' })).toBe(2);
	});
});

describe('useCVFilters persistence', () => {
	it('persists per tenant in sessionStorage and restores on the next mount', () => {
		localStorage.setItem(TENANT_ID, 'tenant-1');
		const first = renderHook(() => useCVFilters());
		act(() => {
			first.result.current.setFilter('skills', ['Go']);
			first.result.current.setQuickSearch('kube');
			first.result.current.setSort('name,asc');
		});
		first.unmount();

		expect(JSON.parse(sessionStorage.getItem('cvFilters:tenant-1'))).toMatchObject({
			filters: { skills: ['Go'] }, sort: 'name,asc', quickSearch: 'kube',
		});

		const second = renderHook(() => useCVFilters());
		expect(second.result.current.filters.skills).toEqual(['Go']);
		expect(second.result.current.quickSearch).toBe('kube');
		expect(second.result.current.activeCount).toBe(1);
	});

	it('migrates the legacy name filter into the quick search', () => {
		localStorage.setItem(TENANT_ID, 'tenant-2');
		sessionStorage.setItem('cvFilters:tenant-2', JSON.stringify({ filters: { name: 'Ada' }, sort: DEFAULT_SORT }));

		const { result } = renderHook(() => useCVFilters());

		expect(result.current.quickSearch).toBe('Ada');
		expect(result.current.filters).not.toHaveProperty('name');
	});
});
