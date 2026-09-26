import PropTypes from 'prop-types';
import { Box, IconButton, Typography, Tooltip, Switch, Tabs, Tab } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import JobScoringView from '../JobScoringView.jsx';
import JobPostReadView from '../JobPostReadView.jsx';
import { THEME_GREEN, tabsSx } from '../../model/jobForm.js';
import { useTranslation } from 'react-i18next';

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
					px: 2.5, py: 1.25, backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', flexShrink: 0,
				}}>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
						<Typography sx={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500, display: { xs: 'none', sm: 'block' } }}>
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
										sx={{ border: '1px solid #e2e8f0', borderRadius: 1.5, color: '#64748b', '&:hover': { backgroundColor: '#f1f5f9' } }}>
										<EditOutlinedIcon sx={{ fontSize: 16 }} />
									</IconButton>
								</Tooltip>
								<Tooltip title={t('jobContent.deleteJobTitle')}>
									<IconButton size="small" onClick={() => setDeleteDialogOpen(true)}
										sx={{ border: '1px solid #fecaca', borderRadius: 1.5, color: '#ef4444', '&:hover': { backgroundColor: '#fef2f2' } }}>
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
