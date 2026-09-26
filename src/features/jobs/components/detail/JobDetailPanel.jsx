import PropTypes from 'prop-types';
import { Box, IconButton, Typography, Tooltip, Switch, Tabs, Tab } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import JobScoringView from '../JobScoringView.jsx';
import JobPostReadView from '../JobPostReadView.jsx';
import { THEME_GREEN, tabsSx } from '../../model/jobForm.js';
import { useTranslation } from 'react-i18next';
import * as tokens from '../../../../theme/tokens.js';

/** The selected job: title, actions, description and scoring tabs. */
const JobDetailPanel = ({ createMode, demo, detailTab, editMode, handleStartEdit, handleToggleStatus, selectedJob, setDeleteDialogOpen, setDetailTab }) => {
	const { t } = useTranslation();
	return (
		<>
		{!createMode && !editMode && selectedJob && (
			<Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
				{/* Header: status + actions */}
				<Box sx={{
					display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1,
					px: 2.5, py: 1.25, backgroundColor: tokens.surface.paper, borderBottom: `1px solid ${tokens.line.main}`, flexShrink: 0,
				}}>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
						<Typography sx={{ fontSize: '0.78rem', color: tokens.ink.muted, fontWeight: 500, display: { xs: 'none', sm: 'block' } }}>
							{selectedJob.status === 'open' ? 'Open' : 'Closed'}
						</Typography>
						<Switch checked={selectedJob.status === 'open'} onChange={handleToggleStatus} size="small"
							sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: THEME_GREEN }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: THEME_GREEN } }} />
					</Box>
					<Box sx={{ flexGrow: 1, minWidth: 4 }} />
					<Box sx={{ display: 'flex', gap: 1, flexShrink: 0, ml: 'auto' }}>
						{!demo && (
							<>
								<Tooltip title={t('jobContent.editJobPost')}>
									<IconButton size="small" onClick={handleStartEdit}
										sx={{ border: `1px solid ${tokens.line.main}`, borderRadius: 1.5, color: tokens.ink.muted, '&:hover': { backgroundColor: tokens.surface.muted } }}>
										<EditOutlinedIcon sx={{ fontSize: 16 }} />
									</IconButton>
								</Tooltip>
								<Tooltip title={t('jobContent.deleteJobTitle')}>
									<IconButton size="small" onClick={() => setDeleteDialogOpen(true)}
										sx={{ border: `1px solid ${tokens.status.error.border}`, borderRadius: 1.5, color: tokens.status.error.bright, '&:hover': { backgroundColor: tokens.status.error.pale } }}>
										<DeleteOutlineIcon sx={{ fontSize: 16 }} />
									</IconButton>
								</Tooltip>
							</>
						)}
					</Box>
				</Box>

				{/* Tabs */}
				<Tabs value={detailTab} onChange={(_, v) => setDetailTab(v)} sx={{ ...tabsSx, flexShrink: 0 }}>
					<Tab label={t('jobContent.tabDescription')} />
					<Tab label={t('jobContent.stepScoringRules')} />
				</Tabs>

				{/* Tab content */}
				<Box sx={{ flex: 1, overflowY: 'auto' }}>
					{detailTab === 0 && <JobPostReadView job={selectedJob} showScoringRules={false} />}
					{detailTab === 1 && <JobScoringView scoringRules={selectedJob.scoringRules} t={t} />}
				</Box>
			</Box>
		)}
		</>
	);
};

JobDetailPanel.propTypes = {
	createMode: PropTypes.any,
	demo: PropTypes.bool,
	detailTab: PropTypes.any,
	editMode: PropTypes.bool,
	handleStartEdit: PropTypes.func,
	handleToggleStatus: PropTypes.func,
	selectedJob: PropTypes.any,
	setDeleteDialogOpen: PropTypes.func,
	setDetailTab: PropTypes.func,
};

export default JobDetailPanel;
