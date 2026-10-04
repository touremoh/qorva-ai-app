import { useState } from 'react';
import { deleteReport } from '../api/reportService.js';

/**
 * One report's row menu and its deletion behind a confirmation. `onDeleted(report)` updates the page (list,
 * selection, outdated count) once the server has deleted it.
 */
export default function useReportDeletion({ onDeleted }) {
	const [anchorEl, setAnchorEl] = useState(null);
	const [menuReport, setMenuReport] = useState(null);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [deleting, setDeleting] = useState(false);

	const openMenu = (event, report) => {
		event.stopPropagation();
		setAnchorEl(event.currentTarget);
		setMenuReport(report);
	};
	const closeMenu = () => { setAnchorEl(null); };

	const askToDelete = () => {
		setAnchorEl(null);
		setDialogOpen(true);
	};

	const confirm = async () => {
		if (!menuReport) return;
		try {
			setDeleting(true);
			await deleteReport(menuReport.id);
			onDeleted(menuReport);
		} catch (error) {
			console.error('Error deleting report:', error);
		} finally {
			setDeleting(false);
			setDialogOpen(false);
			setMenuReport(null);
		}
	};

	const cancel = () => {
		setDialogOpen(false);
		setMenuReport(null);
	};

	return { anchorEl, menuReport, dialogOpen, deleting, openMenu, closeMenu, askToDelete, confirm, cancel };
}
