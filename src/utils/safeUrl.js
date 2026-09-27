// Links built from data Qorva does not control (CV contact links parsed from a candidate's resume,
// ATS imports, a tenant's website) are only rendered as http(s). A bare domain such as
// "linkedin.com/in/jane" gets https:// (it used to render as a broken relative link); any other
// scheme — javascript:, data:, vbscript:, file: … — yields null so the caller renders plain text.

const HTTP_SCHEME = /^https?:\/\//i;
const ANY_SCHEME = /^[a-z][a-z0-9+.-]*:/i;
const BARE_HOST = /^[a-z0-9-]+(\.[a-z0-9-]+)+(?::\d+)?(?:[/?#]|$)/i;

export const safeExternalUrl = (value) => {
	if (typeof value !== 'string') return null;
	// Browsers ignore embedded whitespace/control characters when parsing a scheme, so strip them first.
	// eslint-disable-next-line no-control-regex -- control characters are exactly what must go
	const url = value.replace(/[\u0000- \u007f]/g, '');
	if (!url) return null;
	if (HTTP_SCHEME.test(url)) return url;
	if (url.startsWith('//')) return `https:${url}`;
	if (ANY_SCHEME.test(url) && !BARE_HOST.test(url)) return null;
	return BARE_HOST.test(url) ? `https://${url}` : null;
};
