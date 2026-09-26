// Display formatting shared by several screens. Browser locale unless stated.

/** "12 March 2026" in the browser's locale, or an em dash when there is no date. */
export function formatLongDate(isoString) {
	if (!isoString) return '—';
	return new Date(isoString).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

/** A USD amount given in cents, e.g. 4900 → "$49.00", or an em dash when missing. */
export function formatUsdCents(cents) {
	if (cents == null) return '—';
	return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(cents / 100);
}
