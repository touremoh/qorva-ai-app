// Compose-URL builders for the "open in my mail app" hand-off. The recruiter's own client sends the
// message, so it lands in their Sent folder with their identity; Qorva only records the hand-off.

// Conservative: many desktop clients truncate or refuse mailto: URLs beyond ~2 KB.
export const MAILTO_MAX_LENGTH = 1800;

const HANDOFF_CHOICE_KEY = 'qorva:outreach-handoff';

export const HANDOFF = Object.freeze({
	GMAIL: 'GMAIL',
	OUTLOOK_WEB: 'OUTLOOK_WEB',
	MAILTO: 'MAILTO',
});

const enc = (v) => encodeURIComponent(v ?? '');

// authuser steers multi-account Gmail users to the account matching their Qorva login; harmless otherwise.
export const gmailComposeUrl = ({ to, subject, body, authuser }) =>
	`https://mail.google.com/mail/?view=cm&fs=1&to=${enc(to)}&su=${enc(subject)}&body=${enc(body)}`
	+ (authuser ? `&authuser=${enc(authuser)}` : '');

export const outlookComposeUrl = ({ to, subject, body }) =>
	`https://outlook.office.com/mail/deeplink/compose?to=${enc(to)}&subject=${enc(subject)}&body=${enc(body)}`;

export const mailtoUrl = ({ to, subject, body }) =>
	`mailto:${enc(to)}?subject=${enc(subject)}&body=${enc((body ?? '').replace(/\r?\n/g, '\r\n'))}`;

export const buildHandoffUrl = (via, message) => {
	switch (via) {
		case HANDOFF.GMAIL: return gmailComposeUrl(message);
		case HANDOFF.OUTLOOK_WEB: return outlookComposeUrl(message);
		default: return mailtoUrl(message);
	}
};

// mailto: is the only one with a hard, client-dependent cap; web compose pages take far more.
export const isMailtoTooLong = (message) => mailtoUrl(message).length > MAILTO_MAX_LENGTH;

export const openExternal = (url) => {
	if (url.startsWith('mailto:')) {
		// A new tab for mailto: leaves a blank page behind in most browsers.
		window.location.assign(url);
		return;
	}
	window.open(url, '_blank', 'noopener');
};

// Per-browser convenience only: the split button's primary action becomes the last-used client.
export const rememberHandoffChoice = (via) => {
	try { localStorage.setItem(HANDOFF_CHOICE_KEY, via); } catch { /* storage unavailable */ }
};

export const lastHandoffChoice = () => {
	try {
		const v = localStorage.getItem(HANDOFF_CHOICE_KEY);
		return Object.values(HANDOFF).includes(v) ? v : null;
	} catch {
		return null;
	}
};
