/**
 * Up to two initials for an avatar. Takes a full name ("Ada Lovelace") or its parts
 * (["Ada", "Lovelace"], e.g. first and last name); extra spaces are ignored.
 * Returns `fallback` when there is nothing to take initials from.
 */
export function getInitials(name, fallback = '') {
	const parts = Array.isArray(name)
		? name.map((part) => String(part ?? '').trim())
		: String(name ?? '').split(/\s+/);
	const initials = parts.filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
	return initials || fallback;
}

/** "tShaped" / "individual_contributor" → "T Shaped" / "Individual contributor". */
export function toLabel(value = '') {
	return String(value ?? '')
		.replace(/([A-Z])/g, ' $1')
		.replace(/_/g, ' ')
		.trim()
		.replace(/^\w/, (c) => c.toUpperCase());
}
