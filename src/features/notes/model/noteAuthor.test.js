import { describe, expect, it } from 'vitest';
import { noteAuthor } from './noteAuthor.js';

const t = (key, params) => (params && typeof params === 'object' ? `${key} ${JSON.stringify(params)}` : key);

describe('noteAuthor', () => {
	it('names the person, or Copilot writing for them', () => {
		expect(noteAuthor(t, { authorName: 'Olivia' }, false)).toBe('Olivia');
		expect(noteAuthor(t, { authorEmail: 'o@a.test' }, false)).toBe('o@a.test');
		expect(noteAuthor(t, { authorName: 'Olivia' }, true)).toBe('notes.you');
		expect(noteAuthor(t, { authorName: 'Olivia', source: 'COPILOT' }, false)).toBe('notes.copilotAuthor {"name":"Olivia"}');
		expect(noteAuthor(t, { authorName: 'Olivia', source: 'COPILOT' }, true)).toBe('notes.copilotAuthor {"name":"notes.you"}');
	});
});
