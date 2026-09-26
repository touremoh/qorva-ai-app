import PropTypes from 'prop-types';
import { Autocomplete, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, InputAdornment, InputLabel, MenuItem, Select, Stack, TextField, Tooltip, Typography } from '@mui/material';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import AddCommentOutlinedIcon from '@mui/icons-material/AddCommentOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import CheckIcon from '@mui/icons-material/Check';
import { useTranslation } from 'react-i18next';
import * as tokens from '../../../theme/tokens.js';

/** Starts a chat about a resume, optionally against a job post. */
const CreateChatDialog = ({ loadingResumeMatch, closeCreateChatModal, copiedJobRef, creatingChat, customTitle, cvOptionKey, cvOptions, cvSearch, handleCopyJobRef, handleCreateChat, handleSearchChange, jobs, openCreateModal, resumeMatch, selectedCV, selectedJob, setCustomTitle, setSelectedCV, setSelectedJob, userLang }) => {
	const { t } = useTranslation();
	return (
		<>
		<Dialog
			open={openCreateModal}
			onClose={closeCreateChatModal}
			fullWidth
			maxWidth="sm"
			slotProps={{
				paper: {
					elevation: 0,
					sx: { borderRadius: 3, border: `1px solid ${tokens.line.main}` },
				},
			}}
		>
			<DialogTitle sx={{ pb: 1 }}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
					<AutoAwesomeOutlinedIcon sx={{ fontSize: tokens.iconSize.lg, color: tokens.brand.text }} />
					<Typography sx={{ fontWeight: 700, fontSize: tokens.fontSize.body, color: tokens.ink.strong }}>
						{t('appAIResumeChat.createChatTitle')}
					</Typography>
				</Box>
				<Typography sx={{ fontSize: tokens.fontSize.small, color: tokens.ink.muted, mt: 0.5, fontWeight: 400 }}>
					{t('appAIResumeChat.createChatHelp')}
				</Typography>
			</DialogTitle>

			<Divider sx={{ borderColor: tokens.surface.muted }} />

			<DialogContent sx={{ pt: 2.5 }}>
				<Stack spacing={2}>
					<Autocomplete
						options={cvOptions}
						value={selectedCV}
						onChange={(_, v) => setSelectedCV(v || null)}
						inputValue={cvSearch}
						onInputChange={(_, val) => handleSearchChange(val)}
						getOptionLabel={(cv) => cv?.personalInformation?.name || 'Unknown'}
						renderOption={(props, option) => (
							<li {...props} key={cvOptionKey(option)}>
								{option?.personalInformation?.name || option?.id}
							</li>
						)}
						isOptionEqualToValue={(opt, val) => (opt?.id ?? opt?._id) === (val?.id ?? val?._id)}
						noOptionsText={t('appAIResumeChat.noCVFound')}
						renderInput={(params) => (
							<TextField
								{...params}
								size="small"
								label={t('appAIResumeChat.cvSearch')}
								placeholder={t('appAIResumeChat.cvSearchPlaceholder')}
								sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
								InputProps={{
									...params.InputProps,
									startAdornment: (
										<>
											<InputAdornment position="start">
												<SearchOutlinedIcon sx={{ fontSize: tokens.iconSize.md, color: tokens.ink.subtle }} />
											</InputAdornment>
											{params.InputProps.startAdornment}
										</>
									),
								}}
							/>
						)}
					/>

					<FormControl fullWidth size="small">
						<InputLabel sx={{ fontSize: tokens.fontSize.body2 }}>{t('appAIResumeChat.jobPost')}</InputLabel>
						<Select
							label={t('appAIResumeChat.jobPost')}
							value={selectedJob?.id || ''}
							onChange={(e) => setSelectedJob(jobs.find(x => x.id === e.target.value) || null)}
							sx={{ borderRadius: 2, fontSize: tokens.fontSize.body2 }}
						>
							{jobs.map(j => (
								<MenuItem key={j.id} value={j.id} sx={{ fontSize: tokens.fontSize.body2, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
									<Typography sx={{ fontSize: tokens.fontSize.body2, color: tokens.ink.strong }}>{j.title || j.jobPostTitle || j.id}</Typography>
									{j.jobReference && (
										<Tooltip title={copiedJobRef === j.jobReference ? t('appAIResumeChat.copied') : t('appAIResumeChat.copyReference')} placement="right">
											<Box
												onClick={(e) => handleCopyJobRef(j.jobReference, e)}
												sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.4, cursor: 'pointer', '&:hover': { opacity: 0.75 } }}
											>
												<Typography sx={{ fontSize: tokens.fontSize.caption, color: copiedJobRef === j.jobReference ? `${tokens.brand.main}` : `${tokens.ink.subtle}` }}>
													{j.jobReference}
												</Typography>
												{copiedJobRef === j.jobReference
													? <CheckIcon sx={{ fontSize: tokens.iconSize.xs, color: tokens.brand.text }} />
													: <ContentCopyOutlinedIcon sx={{ fontSize: tokens.iconSize.xs, color: tokens.ink.subtle }} />
												}
											</Box>
										</Tooltip>
									)}
								</MenuItem>
							))}
						</Select>
					</FormControl>

					{/* Matching report */}
					<Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: tokens.surface.subtle, border: `1px solid ${tokens.line.main}` }}>
						<Typography sx={{ fontSize: tokens.fontSize.caption, fontWeight: 700, color: tokens.ink.muted, textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1 }}>
							{t('appAIResumeChat.relatedMatchingReport')}
						</Typography>
						{!selectedCV || !selectedJob ? (
							<Typography sx={{ fontSize: tokens.fontSize.small, color: tokens.ink.subtle }}>
								{t('appAIResumeChat.resumeMatchHint')}
							</Typography>
						) : loadingResumeMatch ? (
							<Stack direction="row" spacing={1} alignItems="center">
								<CircularProgress size={14} sx={{ color: tokens.brand.text }} />
								<Typography sx={{ fontSize: tokens.fontSize.small, color: tokens.ink.muted }}>{t('appAIResumeChat.searching')}</Typography>
							</Stack>
						) : resumeMatch ? (
							<Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
								{resumeMatch.jobPostTitle && (
									<Chip size="small" label={resumeMatch.jobPostTitle} sx={{ fontSize: tokens.fontSize.caption, backgroundColor: tokens.surface.muted, color: tokens.ink.body }} />
								)}
								{resumeMatch?.matchingReportDetails?.decisionSummary?.finalScore != null && (
									<Chip
										size="small"
										label={`${t('appAIResumeChat.score')}: ${Math.round(resumeMatch.matchingReportDetails.decisionSummary.finalScore)}%`}
										sx={{ fontSize: tokens.fontSize.caption, backgroundColor: tokens.status.success.tint, color: tokens.status.success.text, fontWeight: 600 }}
									/>
								)}
							</Stack>
						) : (
							<Typography sx={{ fontSize: tokens.fontSize.small, color: tokens.ink.subtle }}>
								{t('appAIResumeChat.noResumeMatch')}
							</Typography>
						)}
					</Box>

					<TextField
						fullWidth size="small"
						label={t('appAIResumeChat.chatTitle')}
						value={customTitle}
						onChange={(e) => setCustomTitle(e.target.value)}
						helperText={t('appAIResumeChat.chatTitleHelp2')}
						sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
					/>

					<Chip
						size="small"
						label={`${t('appAIResumeChat.language')}: ${userLang || 'en'}`}
						sx={{ width: 'fit-content', fontSize: tokens.fontSize.caption, backgroundColor: tokens.surface.muted, color: tokens.ink.body }}
					/>
				</Stack>
			</DialogContent>

			<Divider sx={{ borderColor: tokens.surface.muted }} />

			<DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
				<Button
					onClick={closeCreateChatModal}
					disabled={creatingChat}
					sx={{ borderRadius: 2, fontSize: tokens.fontSize.body2, textTransform: 'none', color: tokens.ink.muted }}
				>
					{t('appAIResumeChat.cancel')}
				</Button>
				<Tooltip title={!selectedCV || !selectedJob ? t('appAIResumeChat.selectCvAndJob') : ''}>
				<span>
				<Button
					onClick={handleCreateChat}
					variant="contained"
					disabled={creatingChat || !selectedCV || !selectedJob}
					startIcon={creatingChat ? <CircularProgress size={14} color="inherit" /> : <AddCommentOutlinedIcon sx={{ fontSize: tokens.iconSize.md }} />}
					sx={{
						backgroundColor: tokens.brand.main, borderRadius: 2, fontSize: tokens.fontSize.body2,
						textTransform: 'none', fontWeight: 600, boxShadow: 'none',
						'&:hover': { backgroundColor: tokens.brand.pressed, boxShadow: 'none' },
					}}
				>
					{t('appAIResumeChat.create')}
				</Button>
				</span>
				</Tooltip>
			</DialogActions>
		</Dialog>
		</>
	);
};

CreateChatDialog.propTypes = {
	loadingResumeMatch: PropTypes.bool,
	closeCreateChatModal: PropTypes.func,
	copiedJobRef: PropTypes.any,
	creatingChat: PropTypes.any,
	customTitle: PropTypes.any,
	cvOptionKey: PropTypes.any,
	cvOptions: PropTypes.any,
	cvSearch: PropTypes.any,
	handleCopyJobRef: PropTypes.func,
	handleCreateChat: PropTypes.func,
	handleSearchChange: PropTypes.func,
	jobs: PropTypes.any,
	openCreateModal: PropTypes.func,
	resumeMatch: PropTypes.any,
	selectedCV: PropTypes.any,
	selectedJob: PropTypes.any,
	setCustomTitle: PropTypes.func,
	setSelectedCV: PropTypes.func,
	setSelectedJob: PropTypes.func,
	userLang: PropTypes.any,
};

export default CreateChatDialog;
