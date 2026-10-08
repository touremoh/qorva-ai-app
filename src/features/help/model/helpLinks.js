/**
 * The in-app pages Qorva Help may send the user to. Same keys as the API's HelpLinks.ALLOWED: the model only
 * names a key, and only a key listed here becomes a button.
 */
export const HELP_LINKS = {
	'dashboard': '/app/dashboard',
	'cvs': '/app/cvs',
	'library-quality': '/app/library-quality',
	'jobs': '/app/jobs',
	'reports': '/app/reports',
	'pipeline': '/app/pipeline',
	'usage': '/app/usage',
	'copilot': '/app/copilot?tab=chat',
	'copilot.activity': '/app/copilot?tab=activity',
	'copilot.rules': '/app/copilot?tab=rules',
	'configuration.email-templates': '/app/configuration?section=email-templates',
	'settings.profile': '/app/settings?tab=profile',
	'settings.company': '/app/settings?tab=company',
	'settings.users': '/app/settings?tab=users',
	'settings.integrations': '/app/settings?tab=integrations',
	'settings.billing': '/app/settings?tab=billing',
};

export const helpLinkPath = (key) => (Object.hasOwn(HELP_LINKS, key) ? HELP_LINKS[key] : null);

/** i18n key of a link's button label. */
export const helpLinkLabelKey = (key) => `help.links.${key.replace(/[.-]/g, '_')}`;

/** The help-page key of where the user is, sent with each question so answers can start from it. */
export const pageKeyFor = (pathname = '', search = '') => {
	const tab = pathname.match(/^\/app\/([^/?#]+)/)?.[1];
	if (!tab) return pathname === '/' ? 'dashboard' : null;
	const params = new URLSearchParams(search);
	if (tab === 'settings') {
		const sub = params.get('tab') || 'profile';
		return helpLinkPath(`settings.${sub}`) ? `settings.${sub}` : 'settings.profile';
	}
	if (tab === 'copilot') {
		const sub = params.get('tab');
		return sub === 'activity' || sub === 'rules' ? `copilot.${sub}` : 'copilot';
	}
	if (tab === 'configuration') return 'configuration.email-templates';
	return helpLinkPath(tab) ? tab : null;
};

const STARTERS = ['connectAts', 'automate', 'createRule', 'runMatching', 'inviteUser', 'usage'];

const PAGE_STARTER = {
	'settings.integrations': 'connectAts',
	'copilot.rules': 'createRule',
	'copilot': 'automate',
	'reports': 'runMatching',
	'jobs': 'runMatching',
	'settings.users': 'inviteUser',
	'usage': 'usage',
	'settings.billing': 'usage',
	'cvs': 'uploadCvs',
	'library-quality': 'dataHealth',
	'pipeline': 'pipeline',
};

/**
 * Up to four starter questions (i18n ids under help.starters), the current page's first. The rules question is
 * left out when standing rules are off.
 */
export const startersFor = (pageKey, { rulesEnabled = false } = {}) => {
	const allowed = (id) => rulesEnabled || id !== 'createRule';
	const first = PAGE_STARTER[pageKey];
	const list = [first, ...STARTERS].filter((id) => id && allowed(id));
	return [...new Set(list)].slice(0, 4);
};
