// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect, useCallback } from 'react';
import ConfirmDialog from '../../../shared/ui/ConfirmDialog.jsx';
import {
	Box,
	Typography,
	useMediaQuery,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AppCVDetails from './AppCVDetails.jsx';
import AppCVEntries from './AppCVEntries.jsx';
import CVFilterRail from './CVFilterRail.jsx';
import useCvUpload from '../hooks/useCvUpload.js';
import useCVFilters from '../hooks/useCVFilters.js';
import useClearLibrary from '../hooks/useClearLibrary.js';
import useCvFilterOptions from '../hooks/useCvFilterOptions.js';
import { deleteCV } from '../api/cvService.js';
import { notifyQualityChanged, performQualityAction } from '../../library-quality/api/libraryQualityService.js';
import { CVS_CHANGED_EVENT } from '../../../contexts/BulkImportContext.jsx';
import { isDemoUser } from '../../../utils/demoMode.js';
import ClearLibraryDialog from './list/ClearLibraryDialog.jsx';
import CvToolbar from './list/CvToolbar.jsx';
import UploadDialog from './upload/UploadDialog.jsx';
import * as tokens from '../../../theme/tokens.js';

/** Resume library: toolbar, filter rail, list and details pane, plus the library dialogs. */
const AppCVContent = () => {
	const { t } = useTranslation();
	const demo = isDemoUser();
	const [cvEntries, setCvEntries] = useState([]);
	const [totalPages, setTotalPages] = useState(0);
	const [totalElements, setTotalElements] = useState(0);
	const [selectedCV, setSelectedCV] = useState(null);
	const [showArchived, setShowArchived] = useState(false);

	// Filter state is shared by the rail (edits) and the list (queries); bumping refreshKey
	// makes the list re-fetch with the current filters and the rail reload its option counts.
	const cvFilters = useCVFilters();
	const [refreshKey, setRefreshKey] = useState(0);
	const refreshList = useCallback(() => setRefreshKey(k => k + 1), []);
	const upload = useCvUpload(refreshList);
	const { filterOptions, filterOptionsLoading } = useCvFilterOptions(cvFilters.filtersOpen, showArchived, refreshKey);
	// Below this width a persistent third column would starve the details pane, so the rail overlays.
	const railPersistent = useMediaQuery('(min-width:1200px)');
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const clear = useClearLibrary(() => { setSelectedCV(null); refreshList(); });

	// Refresh the library whenever a bulk import finishes anywhere in the app.
	useEffect(() => {
		window.addEventListener(CVS_CHANGED_EVENT, refreshList);
		return () => window.removeEventListener(CVS_CHANGED_EVENT, refreshList);
	}, [refreshList]);

	const handleUnarchive = async (cvId) => {
		try {
			await performQualityAction('UNARCHIVE', { cvIds: [cvId] });
			setCvEntries(prev => prev.filter(cv => cv.id !== cvId));
			if (selectedCV?.id === cvId) setSelectedCV(null);
			refreshList();
			notifyQualityChanged();
		} catch (error) {
			console.error('Error unarchiving CV:', error);
		}
	};

	const handleDeleteCV = async () => {
		if (!selectedCV) return;
		try {
			await deleteCV(selectedCV.id);
			setCvEntries(cvEntries.filter(cv => cv.id !== selectedCV.id));
			setSelectedCV(null);
			setDeleteDialogOpen(false);
			refreshList();
		} catch (error) {
			console.error('Error deleting CV entry:', error);
		}
	};

	const showDetails = selectedCV !== null;
	const leftPanelWidth = 300;

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', overflow: 'hidden', backgroundColor: tokens.surface.subtle }}>
			{/* Toolbar */}
			<CvToolbar
				demo={demo}
				upload={upload}
				showArchived={showArchived}
				onToggleArchived={() => { setShowArchived(prev => !prev); setSelectedCV(null); }}
				onOpenClearLibrary={clear.handleOpenClearDialog}
			/>

			{/* Split pane */}
			<Box sx={{
				display: 'flex',
				flex: 1,
				overflow: 'hidden',
				borderRadius: 2,
				border: `1px solid ${tokens.line.main}`,
				backgroundColor: tokens.surface.paper,
			}}>
				{/* Filter rail — persistent column on wide screens, overlay drawer otherwise */}
				<CVFilterRail
					open={cvFilters.filtersOpen}
					onClose={() => cvFilters.setFiltersOpen(false)}
					persistent={railPersistent}
					filters={cvFilters.filters}
					setFilter={cvFilters.setFilter}
					onClearAll={cvFilters.clearFilters}
					activeCount={cvFilters.activeCount}
					sort={cvFilters.sort}
					setSort={cvFilters.setSort}
					options={filterOptions}
					loading={filterOptionsLoading}
				/>

				{/* Left panel */}
				<Box sx={{
					width: leftPanelWidth,
					flexShrink: 0,
					borderRight: `1px solid ${tokens.line.main}`,
					overflow: 'hidden',
					display: 'flex',
					flexDirection: 'column',
				}}>
					<AppCVEntries
						cvEntries={cvEntries}
						setSelectedCV={setSelectedCV}
						setDeleteDialogOpen={setDeleteDialogOpen}
						setCVEntries={setCvEntries}
						selectedCV={selectedCV}
						totalPages={totalPages}
						setTotalPages={setTotalPages}
						totalElements={totalElements}
						setTotalElements={setTotalElements}
						showArchived={showArchived}
						onUnarchive={handleUnarchive}
						filters={cvFilters.filters}
						sort={cvFilters.sort}
						activeCount={cvFilters.activeCount}
						filtersOpen={cvFilters.filtersOpen}
						onToggleFilters={() => cvFilters.setFiltersOpen(!cvFilters.filtersOpen)}
						onClearFilters={cvFilters.clearFilters}
						refreshKey={refreshKey}
						quickSearch={cvFilters.quickSearch}
						onQuickSearchChange={cvFilters.setQuickSearch}
					/>
				</Box>

				{/* Right panel */}
				<Box sx={{ flex: 1, overflow: 'auto', minWidth: 0, backgroundColor: tokens.surface.subtle }}>
						{showDetails ? (
							<AppCVDetails
								cv={selectedCV}
								onClose={() => setSelectedCV(null)}
								onUpdate={(updated) => {
									setSelectedCV(updated);
									setCvEntries(prev => prev.map(c => c.id === updated.id ? updated : c));
								}}
							/>
						) : (
							<Box sx={{
								height: '100%',
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
								justifyContent: 'center',
								textAlign: 'center',
								gap: 1.5,
							}}>
								<CloudUploadIcon sx={{ fontSize: 40, color: tokens.ink.faint }} />
								<Typography sx={{ fontSize: tokens.fontSize.body2, color: tokens.ink.subtle }}>
									{t('appCVContent.selectCVToSeeDetails')}
								</Typography>
							</Box>
						)}
				</Box>
			</Box>

			{/* Upload Dialog */}
			<UploadDialog
				upload={upload}
			/>

			{/* Clear-library confirmation — preflight counts + type-to-confirm */}
			<ClearLibraryDialog
				clearConfirmText={clear.clearConfirmText}
				clearDialogOpen={clear.clearDialogOpen}
				clearPreflight={clear.clearPreflight}
				clearing={clear.clearing}
				handleClearLibrary={clear.handleClearLibrary}
				setClearConfirmText={clear.setClearConfirmText}
				setClearDialogOpen={clear.setClearDialogOpen}
			/>

			{/* Delete Confirmation Dialog — used for normal CV list mode */}
			<ConfirmDialog
				open={deleteDialogOpen}
				title={t('appCVContent.deleteCVTitle')}
				cancelLabel={t('appCVContent.cancel')}
				confirmLabel={t('appCVContent.confirm')}
				onCancel={() => setDeleteDialogOpen(false)}
				onConfirm={handleDeleteCV}
				tone="danger"
			>
				{t('appCVContent.deleteConfirmation')}
			</ConfirmDialog>
		</Box>
	);
};

export default AppCVContent;
