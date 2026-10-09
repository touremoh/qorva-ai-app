/**
 * Who a note shows as written by: "You", the author's name, or — for a note Copilot wrote on someone's behalf —
 * "Copilot (for You / for Olivia)".
 */
export const noteAuthor = (t, note, own) => {
	const person = own ? t('notes.you', 'You') : (note.authorName || note.authorEmail);
	return note.source === 'COPILOT' ? t('notes.copilotAuthor', { name: person }) : person;
};
