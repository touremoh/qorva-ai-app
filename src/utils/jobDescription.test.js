import { describe, expect, it } from 'vitest';
import { jdTextToHtml, sanitizeDescription } from './jobDescription.js';

describe('jdTextToHtml', () => {
	it('turns lines into paragraphs and "- " lines into one list, escaping HTML', () => {
		expect(jdTextToHtml('Intro <b>\n- Java\n- Spring\nOutro')).toBe('<p>Intro &lt;b&gt;</p><ul><li>Java</li><li>Spring</li></ul><p>Outro</p>');
		expect(jdTextToHtml('')).toBe('');
	});
});

describe('sanitizeDescription', () => {
	it('trims empty paragraphs at the ends and collapses repeated ones', () => {
		expect(sanitizeDescription('<p><br></p><p>A</p><p><br></p><p><br></p><p>B</p><p></p>')).toBe('<p>A</p><p><br></p><p>B</p>');
	});
});
