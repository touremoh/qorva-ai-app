import { describe, expect, it } from 'vitest';
import { HELP_LINKS, helpLinkLabelKey, helpLinkPath, pageKeyFor, startersFor } from './helpLinks.js';
import en from '../../../locales/en/translation.json';

describe('helpLinks', () => {
	it('maps only known keys to in-app paths', () => {
		expect(helpLinkPath('settings.integrations')).toBe('/app/settings?tab=integrations');
		expect(helpLinkPath('https://evil.test')).toBeNull();
		expect(helpLinkPath('constructor')).toBeNull();
		for (const path of Object.values(HELP_LINKS)) expect(path.startsWith('/app/')).toBe(true);
	});

	it('has a label for every link', () => {
		for (const key of Object.keys(HELP_LINKS)) {
			const id = helpLinkLabelKey(key).split('.')[2];
			expect(en.help.links[id], key).toBeTruthy();
		}
	});

	it('works out the page the user is on', () => {
		expect(pageKeyFor('/app/settings', '?tab=integrations')).toBe('settings.integrations');
		expect(pageKeyFor('/app/settings', '')).toBe('settings.profile');
		expect(pageKeyFor('/app/settings', '?tab=nope')).toBe('settings.profile');
		expect(pageKeyFor('/app/copilot', '?tab=rules')).toBe('copilot.rules');
		expect(pageKeyFor('/app/copilot', '?cvId=1')).toBe('copilot');
		expect(pageKeyFor('/app/configuration', '?section=email-templates')).toBe('configuration.email-templates');
		expect(pageKeyFor('/app/pipeline', '')).toBe('pipeline');
		expect(pageKeyFor('/', '')).toBe('dashboard');
		expect(pageKeyFor('/app/unknown', '')).toBeNull();
	});

	it('puts the current page starter first and hides rules when they are off', () => {
		expect(startersFor('settings.integrations')).toEqual(['connectAts', 'automate', 'runMatching', 'inviteUser']);
		expect(startersFor('copilot.rules', { rulesEnabled: true })[0]).toBe('createRule');
		expect(startersFor('copilot.rules')).not.toContain('createRule');
		expect(startersFor(null, { rulesEnabled: true })).toEqual(['connectAts', 'automate', 'createRule', 'runMatching']);
		for (const id of [...startersFor('cvs'), ...startersFor('library-quality'), ...startersFor('pipeline'), 'createRule', 'usage']) {
			expect(en.help.starters[id], id).toBeTruthy();
		}
	});
});
