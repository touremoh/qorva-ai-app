import { describe, expect, it } from 'vitest';
import { conversationFocus, copilotLink, focusFromParams, toWireFocus } from './focus.js';

describe('copilot focus', () => {
	it('links to the chat tab with the candidate and the job', () => {
		expect(copilotLink({ cvId: 'cv1', jobPostId: 'job1' })).toBe('/app/copilot?tab=chat&cvId=cv1&jobPostId=job1');
		expect(copilotLink({ cvId: 'cv1' })).toBe('/app/copilot?tab=chat&cvId=cv1');
	});

	it('reads the focus back from the URL', () => {
		expect(focusFromParams(new URLSearchParams('cvId=cv1&jobPostId=job1'))).toEqual({ cvId: 'cv1', jobPostId: 'job1' });
		expect(focusFromParams(new URLSearchParams('cvId=cv1'))).toEqual({ cvId: 'cv1', jobPostId: null });
		expect(focusFromParams(new URLSearchParams('tab=chat'))).toBeNull();
	});

	it('takes the newest run focus of a conversation', () => {
		const older = { focus: { cvId: 'a', jobPostId: 'j' } };
		const newer = { focus: { cvId: 'b', jobPostId: 'j' } };
		expect(conversationFocus([older, { focus: null }, newer])).toBe(newer.focus);
		expect(conversationFocus([])).toBeNull();
	});

	it('sends a focus only with both a candidate and a job', () => {
		expect(toWireFocus({ cvId: 'a', jobPostId: 'j', cvName: 'Ana' })).toEqual({ cvId: 'a', jobPostId: 'j' });
		expect(toWireFocus({ cvId: 'a', jobPostId: null })).toBeUndefined();
		expect(toWireFocus(null)).toBeUndefined();
	});
});
