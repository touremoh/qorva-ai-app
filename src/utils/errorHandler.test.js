import { beforeAll, describe, expect, it } from 'vitest';
import i18n from '../i18n';
import { resolveError } from './errorHandler.js';

describe('resolveError', () => {
	beforeAll(async () => {
		await i18n.changeLanguage('en');
	});

	it('translates a known backend errorCode', () => {
		const error = { response: { status: 401, data: { errorCode: 'error.auth.authentication_failed' } } };
		expect(resolveError(error)).toBe(i18n.t('error.auth.authentication_failed'));
		expect(resolveError(error)).not.toBe('error.auth.authentication_failed');
	});

	it('falls back to the server message when the code is unknown to the app', () => {
		const error = { response: { status: 400, data: { errorCode: 'error.not.in.locales', message: 'Server says no' } } };
		expect(resolveError(error)).toBe('Server says no');
	});

	it('falls back to the HTTP status, then server error, then network error', () => {
		expect(resolveError({ response: { status: 404, data: {} } })).toBe(i18n.t('error.http.not_found'));
		expect(resolveError({ response: { status: 503, data: {} } })).toBe(i18n.t('errors.server'));
		expect(resolveError(new Error('offline'))).toBe(i18n.t('errors.network'));
	});
});
