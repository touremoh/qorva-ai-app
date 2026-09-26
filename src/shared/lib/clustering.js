// Colours for the talent-clustering traits (skill depth, seniority, leadership, learning velocity),
// shared by the resume view and the match report.

// skillDepth: generalist | specialist | tShaped | hybrid | unknown
export const SKILL_DEPTH_STYLE = {
	specialist: { color: '#7c3aed', bg: 'rgba(124,58,237,0.08)', bdr: 'rgba(124,58,237,0.2)' },
	generalist: { color: '#2563eb', bg: 'rgba(37,99,235,0.08)',  bdr: 'rgba(37,99,235,0.2)'  },
	tShaped:    { color: '#0891b2', bg: 'rgba(8,145,178,0.08)',  bdr: 'rgba(8,145,178,0.2)'  },
	hybrid:     { color: '#6366f1', bg: 'rgba(99,102,241,0.08)', bdr: 'rgba(99,102,241,0.2)' },
};

export const STYLE_UNKNOWN    = { color: '#94a3b8', bg: 'rgba(148,163,184,0.08)', bdr: 'rgba(148,163,184,0.2)' };

export const STYLE_GREEN      = { color: '#629C44', bg: 'rgba(98,156,68,0.08)',   bdr: 'rgba(98,156,68,0.2)'   };

export const STYLE_AMBER      = { color: '#d97706', bg: 'rgba(245,158,11,0.08)',  bdr: 'rgba(245,158,11,0.2)'  };

export const STYLE_SLATE      = { color: '#64748b', bg: 'rgba(100,116,139,0.08)', bdr: 'rgba(100,116,139,0.2)' };

// seniorityLevel: junior | midLevel | senior | lead | principal | manager | director | executive | unknown
export const SENIORITY_HIGH = new Set(['senior', 'lead', 'principal', 'manager', 'director', 'executive']);

export const getSeniorityStyle = (v) => {
	const lower = (v || '').toLowerCase();
	if (SENIORITY_HIGH.has(lower)) return STYLE_GREEN;
	if (lower === 'midlevel')      return STYLE_AMBER;
	return STYLE_SLATE;
};

// leadershipAndInfluence: none | individualContributor | teamLead | crossFunctionalLeader | strategicLeader | executiveInfluence | unknown
export const LEADERSHIP_HIGH = new Set(['crossfunctionalleader', 'strategicleader', 'executiveinfluence']);

export const getLeadershipStyle = (v) => {
	const lower = (v || '').toLowerCase();
	if (LEADERSHIP_HIGH.has(lower)) return STYLE_GREEN;
	if (lower === 'teamlead')       return STYLE_AMBER;
	return STYLE_SLATE;
};

// learningVelocity: low | medium | high | veryHigh | unknown
export const getVelocityStyle = (v) => {
	const lower = (v || '').toLowerCase();
	if (lower === 'veryhigh') return { color: '#16a34a', bg: 'rgba(22,163,74,0.10)', bdr: 'rgba(22,163,74,0.3)' };
	if (lower === 'high')     return { color: '#629C44', bg: 'rgba(98,156,68,0.10)', bdr: 'rgba(98,156,68,0.3)' };
	if (lower === 'medium')   return STYLE_AMBER;
	if (lower === 'low')      return { color: '#dc2626', bg: 'rgba(220,38,38,0.10)', bdr: 'rgba(220,38,38,0.3)' };
	return STYLE_UNKNOWN;
};
