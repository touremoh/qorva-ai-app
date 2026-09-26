
// Sent for the "Not analysed" bucket; the backend maps it to a null match (CVSpecifications.fieldIn).
export const UNSET = '_unset';

export const DRAWER_WIDTH = 280;

export const GREEN = '#629C44';

export const SORT_OPTIONS = [
	{ value: 'lastUpdatedAt,desc', key: 'lastUpdated' },
	{ value: 'createdAt,desc', key: 'newest' },
	{ value: 'name,asc', key: 'name' },
	{ value: 'experience,desc', key: 'experience' },
];

// Chip groups read their labels from i18n by value; sources use the ATS display names.
export const ENUM_GROUPS = ['seniority', 'leadership', 'availability', 'skillDepth'];

export const VALUE_GROUPS = ['industries', 'locations', 'skills', 'tags'];

export const labelSx = {
	fontSize: '0.68rem',
	fontWeight: 700,
	color: '#64748b',
	textTransform: 'uppercase',
	letterSpacing: '0.05em',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'space-between',
	mb: 0.5,
};

export const inputSx = {
	fontSize: '0.78rem',
	borderRadius: 1,
	backgroundColor: '#ffffff',
	'& input': { py: '5px', px: '8px', fontSize: '0.78rem' },
};
