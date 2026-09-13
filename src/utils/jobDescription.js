import DOMPurify from 'dompurify';

// Descriptions authored in the app are Quill HTML, but seeded/imported jobs
// may carry plain text with newline paragraph breaks — normalise those to
// paragraph-only HTML (Quill's normal form, so edit round-trips are stable).
// Everything is sanitised before reaching dangerouslySetInnerHTML or Quill.
// dir="auto" lets each paragraph pick its direction for RTL scripts.
export const escapeHtml = (s) =>
	s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export const HTML_DESCRIPTION_REGEX = /<(p|div|br|ul|ol|li|strong|em|b|i|u|s|a|h[1-6]|span|blockquote|pre)[\s/>]/i;
export const descriptionToHtml = (desc = '') => {
	if (!desc.trim()) return '';
	// Quill paste artifact: plain text pasted into the editor lands in a single
	// <pre class="ql-syntax"> block, often with literal "\n" sequences. A <pre>
	// doesn't wrap, so the whole description overflows off-screen and looks empty.
	// Unwrap it back to plain text and let the paragraph path below format it.
	let source = desc;
	const quillPre = /^\s*<pre class="ql-syntax"[^>]*>([\s\S]*)<\/pre>\s*$/i.exec(source);
	if (quillPre) {
		source = quillPre[1]
			.replace(/\\n/g, '\n')
			.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
	}
	const html = quillPre == null && HTML_DESCRIPTION_REGEX.test(source)
		? source
		: source.split(/\r?\n+/)
			.map(p => p.trim())
			.filter(Boolean)
			.map(p => `<p dir="auto">${escapeHtml(p)}</p>`)
			.join('');
	return DOMPurify.sanitize(html);
};
