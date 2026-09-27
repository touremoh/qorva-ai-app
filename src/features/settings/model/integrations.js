import { brandPillButtonSx } from '../../../shared/ui/buttonSx.js';
import * as tokens from '../../../theme/tokens.js';

export const GREEN = tokens.brand.main;

export const BTN_GREEN_SX = { ...brandPillButtonSx, fontSize: tokens.fontSize.body2 };
/**
 * Static provider metadata: display name, the credential fields the connect form asks for,
 * which of them are mandatory, and where the provider documents the setup.
 *
 * `fields` drives the form; `required` is what the Connect button waits for. Greenhouse is
 * the one provider that takes a client id and secret rather than a single key — Harvest v3
 * exchanges them for tokens — and its Greenhouse user id stays optional because it is only
 * needed to attribute score notes written back.
 *
 * `webhookGuide: false` marks a provider whose webhooks cannot be set up from the ATS UI, so
 * the card explains that scheduled syncing is the only option rather than listing steps
 * nobody can follow.
 */
export const PROVIDERS = {
	greenhouse: {
		label: 'Greenhouse',
		fields: ['clientId', 'clientSecret', 'onBehalfOfUserId'],
		required: ['clientId', 'clientSecret'],
		docsUrl: 'https://support.greenhouse.io/hc/en-us/articles/5888163769883',
		webhookGuide: true,
	},
	recruitee: {
		label: 'Recruitee',
		fields: ['apiKey', 'companyId'],
		required: ['apiKey', 'companyId'],
		docsUrl: 'https://docs.recruitee.com/reference/getting-started',
		webhookGuide: true,
	},
	workable: {
		label: 'Workable',
		fields: ['apiKey', 'subdomain'],
		required: ['apiKey', 'subdomain'],
		docsUrl: 'https://help.workable.com/hc/en-us/articles/115015785428',
		// No customer-facing webhook screen exists, so there is no manual fallback to offer.
		webhookGuide: false,
	},
	manatal: {
		label: 'Manatal',
		fields: ['apiKey'],
		required: ['apiKey'],
		docsUrl: 'https://support.manatal.com/docs/manatal-api',
		webhookGuide: true,
	},
	bamboohr: {
		label: 'BambooHR',
		fields: ['apiKey', 'subdomain'],
		required: ['apiKey', 'subdomain'],
		docsUrl: 'https://documentation.bamboohr.com/docs/getting-started',
		// BambooHR webhooks watch employee fields, not applicants — no use for recruiting.
		webhookGuide: false,
	},
	zoho_recruit: {
		label: 'Zoho Recruit',
		fields: [],
		required: [],
		docsUrl: 'https://www.zoho.com/recruit/developer-guide/apiv2/',
		webhookGuide: true,
	},
	lever: {
		label: 'Lever',
		// Lever picks the signing key itself. Qorva reads it back from the create call where
		// Lever returns it, and otherwise the tenant pastes the account signing token here —
		// without one, deliveries arrive but cannot be proven authentic.
		fields: ['apiKey', 'webhookSigningSecret'],
		required: ['apiKey'],
		docsUrl: 'https://help.lever.co/hc/en-us/articles/20087297592477',
		webhookGuide: false,
	},
	ashby: {
		label: 'Ashby',
		fields: ['apiKey'],
		required: ['apiKey'],
		docsUrl: 'https://developers.ashbyhq.com/docs/authentication',
		webhookGuide: true,
	},
};
/** Reads an i18n key that holds a list of steps, tolerating a provider that defines none. */
export const stepList = (t, key) => {
	const value = t(key, { returnObjects: true, defaultValue: [] });
	return Array.isArray(value) ? value : [];
};
/** Credential fields that must never be shown in the clear while being typed. */
export const SECRET_FIELDS = new Set(['apiKey', 'clientSecret', 'webhookSigningSecret']);
/** How often the card re-reads sync runs while one is still in flight. */
export const SYNC_POLL_MS = 3000;
/** Gives up polling eventually, so a job stuck RUNNING cannot poll for the life of the tab. */
export const SYNC_POLL_TIMEOUT_MS = 5 * 60 * 1000;
/**
 * True when an ATS could actually deliver to this address. A webhook URL built from a local
 * or private base — http://localhost:8080 is the development default — is one an ATS cannot
 * reach, and providers reject it outright rather than accepting a callback that never fires.
 */
export const isPubliclyReachable = (url) => {
	try {
		const { protocol, hostname } = new URL(url);
		if (protocol !== 'https:') return false;
		if (['localhost', '0.0.0.0', '127.0.0.1', '[::1]', '::1'].includes(hostname)) return false;
		if (hostname.endsWith('.local') || hostname.endsWith('.localhost')) return false;
		// RFC 1918 private ranges and link-local, which a provider cannot route to either.
		return !/^(10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/.test(hostname);
	} catch {
		// Not a URL we can parse — say nothing rather than warn about something we misread.
		return true;
	}
};
/** Zoho's sign-in domain for a datacenter key — Canada is the one that breaks the pattern. */
export const zohoDomain = (key) => (key === 'ca' ? 'zohocloud.ca' : `zoho.${key}`);
/**
 * "Europe — zoho.eu": the region name for recognition, the domain because that is what the
 * recruiter actually sees in their address bar. Keys like "com.au" are flattened for the
 * lookup since i18next reads a dot as a nesting separator.
 */
export const regionLabel = (key, t) => {
	const domain = zohoDomain(key);
	const name = t(`atsIntegrations.regions.${key.replace(/\./g, '_')}`, '');
	return name ? `${name} — ${domain}` : domain;
};
