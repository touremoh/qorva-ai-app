import { describe, expect, it } from 'vitest';
import { safeExternalUrl } from './safeUrl.js';
import { buildHandoffUrl, HANDOFF, isMailtoTooLong, lastHandoffChoice, MAILTO_MAX_LENGTH, rememberHandoffChoice } from './mailLinks.js';
import { descriptionToHtml } from './jobDescription.js';
import { isActionAllowed, isDemoUser } from './demoMode.js';
import { ACCOUNT_STATUS_DEMO, USER_ACCOUNT_STATUS, USER_AUTHORITIES } from '../constants.js';

describe('safeExternalUrl', () => {
	it.each([
		['https://linkedin.com/in/jane', 'https://linkedin.com/in/jane'],
		['linkedin.com/in/jane', 'https://linkedin.com/in/jane'],
		['//cdn.example.io/a', 'https://cdn.example.io/a'],
		['example.com:8080/x', 'https://example.com:8080/x'],
	])('keeps or upgrades %s', (input, expected) => {
		expect(safeExternalUrl(input)).toBe(expected);
	});

	it.each(['javascript:alert(1)', ' java\tscript:alert(1)', 'JaVaScRiPt:x', 'data:text/html,x', 'vbscript:x',
		'mailto:a@b.c', 'localhost:3000', 'jane', '', '   ', null, undefined, 42])('refuses %s', (input) => {
		expect(safeExternalUrl(input)).toBeNull();
	});
});

describe('mail hand-off links', () => {
	const message = { to: 'jane@example.com', subject: 'Hello & welcome', body: 'Line 1\nLine 2' };

	it('builds each provider compose URL with encoded fields', () => {
		expect(buildHandoffUrl(HANDOFF.GMAIL, { ...message, authuser: 'me@acme.test' })).toBe(
			'https://mail.google.com/mail/?view=cm&fs=1&to=jane%40example.com&su=Hello%20%26%20welcome&body=Line%201%0ALine%202&authuser=me%40acme.test');
		expect(buildHandoffUrl(HANDOFF.OUTLOOK_WEB, message)).toBe(
			'https://outlook.office.com/mail/deeplink/compose?to=jane%40example.com&subject=Hello%20%26%20welcome&body=Line%201%0ALine%202');
		expect(buildHandoffUrl(HANDOFF.MAILTO, message)).toBe(
			'mailto:jane%40example.com?subject=Hello%20%26%20welcome&body=Line%201%0D%0ALine%202');
	});

	it('flags mailto links past the length most clients accept', () => {
		expect(isMailtoTooLong(message)).toBe(false);
		expect(isMailtoTooLong({ ...message, body: 'x'.repeat(MAILTO_MAX_LENGTH) })).toBe(true);
	});

	it('remembers only known hand-off choices', () => {
		rememberHandoffChoice(HANDOFF.OUTLOOK_WEB);
		expect(lastHandoffChoice()).toBe(HANDOFF.OUTLOOK_WEB);
		rememberHandoffChoice('SOMETHING_ELSE');
		expect(lastHandoffChoice()).toBeNull();
	});
});

describe('descriptionToHtml', () => {
	it('turns plain text paragraphs into escaped HTML paragraphs', () => {
		expect(descriptionToHtml('First <line>\n\nSecond')).toBe('<p dir="auto">First &lt;line&gt;</p><p dir="auto">Second</p>');
	});

	it('keeps editor HTML but strips scripts and handlers', () => {
		const html = descriptionToHtml('<p>Hi <strong>there</strong></p><script>alert(1)</script><img src=x onerror="alert(1)">');
		expect(html).toContain('<p>Hi <strong>there</strong></p>');
		expect(html).not.toContain('script');
		expect(html).not.toContain('onerror');
	});

	it('unwraps a Quill paste artefact back into paragraphs', () => {
		expect(descriptionToHtml('<pre class="ql-syntax" spellcheck="false">One\\nTwo</pre>'))
			.toBe('<p dir="auto">One</p><p dir="auto">Two</p>');
	});

	it('returns nothing for blank input', () => {
		expect(descriptionToHtml('   ')).toBe('');
	});
});

describe('demo-mode gating', () => {
	it('allows everything for a regular account', () => {
		expect(isDemoUser()).toBe(false);
		expect(isActionAllowed('DELETE_CV')).toBe(true);
	});

	it('allows a demo account only what its authorities mark ALLOWED', () => {
		localStorage.setItem(USER_ACCOUNT_STATUS, ACCOUNT_STATUS_DEMO);
		localStorage.setItem(USER_AUTHORITIES, JSON.stringify([
			{ action: 'VIEW_CV', permission: 'ALLOWED' },
			{ action: 'MODIFY_CV', permission: 'DENIED' },
		]));

		expect(isDemoUser()).toBe(true);
		expect(isActionAllowed('VIEW_CV')).toBe(true);
		expect(isActionAllowed('MODIFY_CV')).toBe(false);
		expect(isActionAllowed('DELETE_CV')).toBe(false);
	});

	it('treats unreadable stored authorities as none', () => {
		localStorage.setItem(USER_ACCOUNT_STATUS, ACCOUNT_STATUS_DEMO);
		localStorage.setItem(USER_AUTHORITIES, '{not json');
		expect(isActionAllowed('VIEW_CV')).toBe(false);
	});
});
