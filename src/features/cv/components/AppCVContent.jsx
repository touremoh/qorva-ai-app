// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect, useRef, useCallback } from 'react';
import ConfirmDialog from '../../../shared/ui/ConfirmDialog.jsx';
import {
	Box,
	Button,
	Typography,
	CircularProgress,
	IconButton,
	Tooltip,
	useMediaQuery,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AppCVDetails from './AppCVDetails.jsx';
import AppCVEntries from './AppCVEntries.jsx';
import CVFilterRail from './CVFilterRail.jsx';
import useCvUpload from '../hooks/useCvUpload.js';
import useCVFilters from '../hooks/useCVFilters.js';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import { toast } from 'sonner';
import { deleteCV, getClearLibraryPreflight, clearLibrary, getCVFilterOptions } from '../api/cvService.js';
import { notifyQualityChanged, performQualityAction } from '../../library-quality/api/libraryQualityService.js';
import { CVS_CHANGED_EVENT } from '../../../contexts/BulkImportContext.jsx';
import { isDemoUser } from '../../../utils/demoMode.js';
import UpgradeButton from '../../../components/demo/UpgradeButton.jsx';
import ClearLibraryDialog from './list/ClearLibraryDialog.jsx';
import UploadDialog from './upload/UploadDialog.jsx';
import * as tokens from '../../../theme/tokens.js';
import { alpha } from '@mui/material/styles';

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
	const [filterOptions, setFilterOptions] = useState(null);
	const [filterOptionsLoading, setFilterOptionsLoading] = useState(false);
	const [railEverOpened, setRailEverOpened] = useState(false);
	// Below this width a persistent third column would starve the details pane, so the rail overlays.
	const railPersistent = useMediaQuery('(min-width:1200px)');
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	// Bulk-import state: plan cap, dropped-file notices, job lifecycle and summary.



	// Refresh the library whenever a bulk import finishes anywhere in the app.
	useEffect(() => {
		window.addEventListener(CVS_CHANGED_EVENT, refreshList);
		return () => window.removeEventListener(CVS_CHANGED_EVENT, refreshList);
	}, [refreshList]);

	// Facet options are fetched lazily the first time the rail opens, then kept in step with
	// the archived toggle and every library change (upload, delete, unarchive, clear).
	useEffect(() => {
		if (cvFilters.filtersOpen) setRailEverOpened(true);
	}, [cvFilters.filtersOpen]);
	useEffect(() => {
		if (!railEverOpened) return;
		let cancelled = false;
		setFilterOptionsLoading(true);
		getCVFilterOptions({ archived: showArchived })
			.then(resp => { if (!cancelled) setFilterOptions(resp.data); })
			.catch(error => console.error('Error loading CV filter options:', error))
			.finally(() => { if (!cancelled) setFilterOptionsLoading(false); });
		return () => { cancelled = true; };
	}, [railEverOpened, showArchived, refreshKey]);


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



	// Clear-library: the most destructive action in the product — preflight counts in
	// the dialog, and the user must type DELETE before the button arms.
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
			setSelectedCV(null);
			refreshList();
			notifyQualityChanged();
		} catch (error) {
			console.error('Clear library failed:', error);
		} finally {
			setClearing(false);
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
			<Box sx={{
				display: 'flex',
				alignItems: 'center',
				gap: 1.5,
				py: 1.5,
				backgroundColor: tokens.surface.paper,
				borderBottom: `1px solid ${tokens.line.main}`,
				borderRadius: 2,
				mb: 2,
				px: 2,
			}}>
				{demo ? (
					<UpgradeButton reason="cv-upload" variant="contained" size="medium" />
				) : (
					<Button
						startIcon={upload.isUploading ? <CircularProgress size={16} color="inherit" /> : <FileUploadIcon />}
						variant="contained"
						disabled={upload.isUploading}
						onClick={() => upload.setOpenUploadModal(true)}
						sx={{
							backgroundColor: tokens.brand.main,
							'&:hover': { backgroundColor: tokens.brand.hover },
							borderRadius: 1.5,
							textTransform: 'none',
							fontWeight: 600,
							fontSize: '0.84rem',
							boxShadow: 'none',
							px: 2,
						}}
					>
						{t('appCVContent.uploadCV')}
						<Box component="span" sx={{
							ml: 1, px: 0.75, py: 0.15,
							backgroundColor: 'rgba(255,255,255,0.22)',
							borderRadius: 0.75,
							fontSize: '0.72rem',
							fontWeight: 500,
							letterSpacing: '0.02em',
						}}>
							· up to {upload.bulkLimit}
						</Box>
					</Button>
				)}

				<Tooltip title={t('appCVContent.showArchivedTooltip', 'Show archived resumes')}>
					<Button
						startIcon={<Inventory2OutlinedIcon sx={{ fontSize: 16 }} />}
						variant="outlined"
						onClick={() => { setShowArchived(prev => !prev); setSelectedCV(null); }}
						sx={{
							borderColor: showArchived ? `${tokens.brand.main}` : `${tokens.line.main}`,
							color: showArchived ? `${tokens.brand.main}` : `${tokens.ink.muted}`,
							backgroundColor: showArchived ? alpha(tokens.brand.main, 0.06) : 'transparent',
							'&:hover': { borderColor: tokens.brand.main, color: tokens.brand.text, backgroundColor: alpha(tokens.brand.main, 0.04) },
							borderRadius: 1.5,
							textTransform: 'none',
							fontWeight: 600,
							fontSize: '0.8rem',
							boxShadow: 'none',
							px: 1.5,
						}}
					>
						{t('appCVContent.archived', 'Archived')}
					</Button>
				</Tooltip>

				{!demo && (
					<Tooltip title={t('appCVContent.clearLibrary.tooltip', 'Clear the whole library…')}>
						<IconButton
							size="small"
							onClick={handleOpenClearDialog}
							sx={{
								borderRadius: 1.5,
								color: tokens.ink.subtle,
								'&:hover': { color: tokens.status.error.main, backgroundColor: 'rgba(220,38,38,0.06)' },
							}}
						>
							<DeleteForeverOutlinedIcon sx={{ fontSize: 19 }} />
						</IconButton>
					</Tooltip>
				)}

				<Box sx={{ flexGrow: 1 }} />
			</Box>

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
								gap: 1.5,
							}}>
								<CloudUploadIcon sx={{ fontSize: 40, color: tokens.ink.faint }} />
								<Typography sx={{ fontSize: '0.88rem', color: tokens.ink.subtle }}>
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
				clearConfirmText={clearConfirmText}
				clearDialogOpen={clearDialogOpen}
				clearPreflight={clearPreflight}
				clearing={clearing}
				handleClearLibrary={handleClearLibrary}
				setClearConfirmText={setClearConfirmText}
				setClearDialogOpen={setClearDialogOpen}
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
