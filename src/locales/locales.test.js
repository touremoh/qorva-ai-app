import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const dir = dirname(fileURLToPath(import.meta.url));
const flat = (obj, prefix = '') => Object.entries(obj).flatMap(([k, v]) =>
	(v && typeof v === 'object' ? flat(v, `${prefix}${k}.`) : [`${prefix}${k}`]));
const keysOf = (lang) => new Set(flat(JSON.parse(readFileSync(join(dir, lang, 'translation.json'), 'utf8'))));

describe('locales', () => {
	const en = keysOf('en');
	const langs = readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);

	it.each(langs.filter((l) => l !== 'en'))('%s has exactly the English keys', (lang) => {
		const keys = keysOf(lang);
		expect([...en].filter((k) => !keys.has(k))).toEqual([]);
		expect([...keys].filter((k) => !en.has(k))).toEqual([]);
	});
});
