import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { getClearLibraryPreflight, clearLibrary } from '../api/cvService.js';
import { notifyQualityChanged } from '../../library-quality/api/libraryQualityService.js';

/**
 * Clear-library: the most destructive action in the product — preflight counts in the
 * dialog, and the user must type DELETE before the button arms. `onCleared` runs after a
 * successful clear.
 */
export default function useClearLibrary(onCleared) {
	const { t } = useTranslation();
	const [clearDialogOpen, setClearDialogOpen] = useState(false);
	const [clearPreflight, setClearPreflight] = useState(null);
	const [clearConfirmText, setClearConfirmText] = useState('');
	const [clearing, setClearing] = useState(false);

	const handleOpenClearDialog = async () => {
		setClearConfirmText('');
		setClearPreflight(null);
		setClearDialogOpen(true);
		try {
			const resp = await getClearLibraryPreflight();
			setClearPreflight(resp.data);
		} catch (error) {
			console.error('Clear-library preflight failed:', error);
		}
	};

	const handleClearLibrary = async () => {
		try {
			setClearing(true);
			const resp = await clearLibrary();
			const result = resp.data;
			toast.success(t('appCVContent.clearLibrary.done', 'Library cleared — {{cvs}} resumes, {{reports}} reports and {{chats}} chats removed.', {
				cvs: result?.cvs ?? 0, reports: result?.reports ?? 0, chats: result?.chats ?? 0 }));
			setClearDialogOpen(false);
			onCleared();
			notifyQualityChanged();
		} catch (error) {
			console.error('Clear library failed:', error);
		} finally {
			setClearing(false);
		}
	};

	return {
		clearDialogOpen, setClearDialogOpen, clearPreflight, clearConfirmText, setClearConfirmText, clearing,
		handleOpenClearDialog, handleClearLibrary,
	};
}
