import { useEffect, useState } from 'react';
import { getCVFilterOptions } from '../api/cvService.js';

/**
 * Facet options for the filter rail, fetched lazily the first time the rail opens, then kept
 * in step with the archived toggle and every library change (`refreshKey`).
 */
export default function useCvFilterOptions(filtersOpen, showArchived, refreshKey) {
	const [filterOptions, setFilterOptions] = useState(null);
	const [filterOptionsLoading, setFilterOptionsLoading] = useState(false);
	const [railEverOpened, setRailEverOpened] = useState(false);

	useEffect(() => {
		if (filtersOpen) setRailEverOpened(true);
	}, [filtersOpen]);
	useEffect(() => {
		if (!railEverOpened) return;
		let cancelled = false;
		setFilterOptionsLoading(true);
		getCVFilterOptions({ archived: showArchived })
			.then(resp => { if (!cancelled) setFilterOptions(resp.data); })
			.catch(error => console.error('Error loading CV filter options:', error))
			.finally(() => { if (!cancelled) setFilterOptionsLoading(false); });
		return () => { cancelled = true; };
	}, [railEverOpened, showArchived, refreshKey]);

	return { filterOptions, filterOptionsLoading };
}
