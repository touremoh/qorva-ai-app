import { useCallback, useState } from 'react';
import { updateCV } from '../api/cvService.js';

/**
 * Inline editing of the resume's editable sections (availability, tags): one section at a
 * time, a draft, and a save that patches only that section. A tag still in the input when
 * Save is pressed is committed with the rest. `onUpdate` receives the saved resume.
 */
export default function useCvSectionEdit(cv, onUpdate) {
	const [editingSection, setEditingSection] = useState(null);
	const [draft, setDraft] = useState({});
	const [tagInput, setTagInput] = useState('');
	const [isSaving, setIsSaving] = useState(false);

	const handleEdit = useCallback((section) => {
		if (section === 'availability') {
			setDraft(cv?.personalInformation?.availability ?? {});
		} else if (section === 'tags') {
			setDraft({ tags: cv?.tags ?? [] });
		}
		setEditingSection(section);
	}, [cv]);

	const handleCancelEdit = useCallback(() => {
		setEditingSection(null);
		setDraft({});
		setTagInput('');
	}, []);

	const handleSave = useCallback(async () => {
		if (!cv?.id) return;
		setIsSaving(true);
		try {
			const pendingTag = tagInput.trim();
			const committedTags = editingSection === 'tags' && pendingTag && !draft.tags?.includes(pendingTag)
				? [...(draft.tags ?? []), pendingTag]
				: draft.tags;
			const patch = editingSection === 'availability'
				? { personalInformation: { availability: draft } }
				: { tags: committedTags };
			const res = await updateCV(cv.id, patch);
			const updated = res?.data?.data ?? { ...cv, ...patch };
			onUpdate?.(updated);
			setEditingSection(null);
			setDraft({});
			setTagInput('');
		} catch (err) {
			console.error('Failed to save CV:', err);
		} finally {
			setIsSaving(false);
		}
	}, [cv, draft, editingSection, tagInput, onUpdate]);

	const handleAddTag = useCallback(() => {
		const val = tagInput.trim();
		if (!val || draft.tags?.includes(val)) return;
		setDraft(d => ({ ...d, tags: [...(d.tags ?? []), val] }));
		setTagInput('');
	}, [tagInput, draft.tags]);

	const handleRemoveTag = useCallback((tag) => {
		setDraft(d => ({ ...d, tags: (d.tags ?? []).filter(t => t !== tag) }));
	}, []);

	return {
		editingSection, draft, setDraft, tagInput, setTagInput, isSaving,
		handleEdit, handleCancelEdit, handleSave, handleAddTag, handleRemoveTag,
	};
}
