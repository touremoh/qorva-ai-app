import * as tokens from '../../../theme/tokens.js';

// Sent for the "Not analysed" bucket; the backend maps it to a null match (CVSpecifications.fieldIn).
export const UNSET = '_unset';

export const DRAWER_WIDTH = 280;

export const GREEN = tokens.brand.main;

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
	fontSize: tokens.fontSize.caption,
	fontWeight: 700,
	color: tokens.ink.muted,
	textTransform: 'uppercase',
	letterSpacing: '0.05em',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'space-between',
	mb: 0.5,
};

export const inputSx = {
	fontSize: tokens.fontSize.small,
	borderRadius: 1,
	backgroundColor: tokens.surface.paper,
	'& input': { py: '5px', px: '8px', fontSize: tokens.fontSize.small },
};
