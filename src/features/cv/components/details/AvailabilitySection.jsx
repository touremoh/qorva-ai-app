import PropTypes from 'prop-types';
import SectionHeader from '../../../../shared/ui/SectionHeader.jsx';
import { Box, Button, CircularProgress, Typography, Chip, FormControlLabel, Grid2, MenuItem, Select, Switch, TextField } from '@mui/material';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import EditSectionButton from './EditSectionButton.jsx';
import Card from './Card.jsx';
import { softSkillChipSx, availLabelSx, availValueSx, availabilityStatusChipSx } from '../../model/cvDetailsStyles.js';
import { useTranslation } from 'react-i18next';
import * as tokens from '../../../../theme/tokens.js';
import { alpha } from '@mui/material/styles';

/** Availability, notice period and salary expectation, editable inline. */
const AvailabilitySection = ({ draft, editingSection, handleCancelEdit, handleEdit, handleSave, isSaving, pi, setDraft }) => {
	const { t } = useTranslation();
	return (
		<>
		{(pi.availability || editingSection === 'availability') && (
			<Card sx={{ mb: 2 }}>
				<SectionHeader tone="document"
					icon={AccessTimeOutlinedIcon}
					label={t('appCVContent.availability.title')}
				 action={<EditSectionButton onClick={editingSection !== 'availability' ? () => handleEdit('availability') : undefined} />}
				/>
				{editingSection === 'availability' ? (
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
						{/* Status */}
						<Box>
							<Typography sx={availLabelSx}>{t('appCVContent.availability.status', 'Status')}</Typography>
							<Select
								size="small"
								value={draft.status ?? ''}
								onChange={e => setDraft(d => ({ ...d, status: e.target.value }))}
								displayEmpty
								sx={{ fontSize: tokens.fontSize.body2, minWidth: 200 }}
							>
								<MenuItem value="" sx={{ fontSize: tokens.fontSize.body2 }}><em>—</em></MenuItem>
								{['activelyLooking', 'openButNotSearching', 'notAvailable', 'freelanceOnly'].map(s => (
									<MenuItem key={s} value={s} sx={{ fontSize: tokens.fontSize.body2 }}>
										{t(`appCVContent.availability.statusValue.${s}`, s)}
									</MenuItem>
								))}
							</Select>
						</Box>
						{/* Toggles */}
						<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
							{[
								{ key: 'openToWork',        label: t('appCVContent.availability.openToWork', 'Open to work') },
								{ key: 'remoteOnly',        label: t('appCVContent.availability.remoteOnly', 'Remote only') },
								{ key: 'willingToRelocate', label: t('appCVContent.availability.willingToRelocate', 'Willing to relocate') },
							].map(({ key, label }) => (
								<FormControlLabel
									key={key}
									label={<Typography sx={{ fontSize: tokens.fontSize.small, color: tokens.ink.body }}>{label}</Typography>}
									control={
										<Switch
											size="small"
											checked={!!draft[key]}
											onChange={e => setDraft(d => ({ ...d, [key]: e.target.checked }))}
											sx={{ '& .MuiSwitch-thumb': { width: 12, height: 12 }, '& .MuiSwitch-track': { borderRadius: 6 } }}
										/>
									}
									sx={{ mr: 1 }}
								/>
							))}
						</Box>
						{/* Dates & notice */}
						<Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
							<Box>
								<Typography sx={availLabelSx}>{t('appCVContent.availability.availableFrom', 'Available from')}</Typography>
								<TextField
									size="small"
									type="date"
									value={draft.availableFrom ?? ''}
									onChange={e => setDraft(d => ({ ...d, availableFrom: e.target.value }))}
									InputProps={{ sx: { fontSize: tokens.fontSize.body2 } }}
									InputLabelProps={{ shrink: true }}
								/>
							</Box>
							<Box>
								<Typography sx={availLabelSx}>{t('appCVContent.availability.noticePeriod', 'Notice period (days)')}</Typography>
								<TextField
									size="small"
									type="number"
									value={draft.noticePeriodDays ?? ''}
									onChange={e => setDraft(d => ({ ...d, noticePeriodDays: e.target.value === '' ? null : Number(e.target.value) }))}
									inputProps={{ min: 0 }}
									sx={{ width: 100 }}
									InputProps={{ sx: { fontSize: tokens.fontSize.body2 } }}
								/>
							</Box>
						</Box>
						{/* Save / Cancel */}
						<Box sx={{ display: 'flex', gap: 1, pt: 0.5 }}>
							<Button
								size="small"
								variant="contained"
								disabled={isSaving}
								onClick={handleSave}
								startIcon={isSaving ? <CircularProgress size={12} color="inherit" /> : null}
								sx={{ textTransform: 'none', fontSize: tokens.fontSize.small, backgroundColor: tokens.brand.main, '&:hover': { backgroundColor: tokens.brand.hover }, borderRadius: 1.5, boxShadow: 'none', fontWeight: 600 }}
							>
								{t('appCVContent.save', 'Save')}
							</Button>
							<Button
								size="small"
								onClick={handleCancelEdit}
								sx={{ textTransform: 'none', fontSize: tokens.fontSize.small, color: tokens.ink.muted, borderRadius: 1.5 }}
							>
								{t('appCVContent.cancel')}
							</Button>
						</Box>
					</Box>
				) : (
				<Grid2 container spacing={2}>
					<Grid2 size={{ xs: 12 }}>
						<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, alignItems: 'center' }}>
							{pi.availability.status && (
								<Chip
									label={t(`appCVContent.availability.statusValue.${pi.availability.status}`, pi.availability.status)}
									size="small"
									sx={availabilityStatusChipSx(pi.availability.status)}
								/>
							)}
							{pi.availability.openToWork != null && (
								<Chip
									label={pi.availability.openToWork
										? t('appCVContent.availability.openToWork')
										: t('appCVContent.availability.notOpenToWork')}
									size="small"
									sx={{
										fontSize: tokens.fontSize.caption, height: 22, fontWeight: 600, borderRadius: 0.75,
										...(pi.availability.openToWork
											? { backgroundColor: alpha(tokens.brand.main, 0.10), color: tokens.brand.dark }
											: { backgroundColor: tokens.status.error.tint, color: tokens.status.error.text }),
									}}
								/>
							)}
							{pi.availability.remoteOnly && (
								<Chip label={t('appCVContent.availability.remoteOnly')} size="small"
									sx={{ fontSize: tokens.fontSize.caption, height: 22, borderRadius: 0.75, fontWeight: 600, backgroundColor: 'rgba(139,92,246,0.08)', color: tokens.status.accent.deep }} />
							)}
							{pi.availability.willingToRelocate != null && (
								<Chip
									label={pi.availability.willingToRelocate
										? t('appCVContent.availability.willingToRelocate')
										: t('appCVContent.availability.notWillingToRelocate')}
									size="small"
									sx={{
										fontSize: tokens.fontSize.caption, height: 22, borderRadius: 0.75, fontWeight: 500,
										...(pi.availability.willingToRelocate
											? { backgroundColor: 'rgba(59,130,246,0.08)', color: tokens.status.info.navy }
											: { backgroundColor: tokens.surface.muted, color: tokens.ink.muted }),
									}}
								/>
							)}
						</Box>
					</Grid2>

					{(pi.availability.availableFrom || pi.availability.noticePeriodDays != null) && (
						<Grid2 size={{ xs: 12, sm: 6 }}>
							<Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
								{pi.availability.availableFrom && (
									<Box>
										<Typography sx={availLabelSx}>{t('appCVContent.availability.availableFrom')}</Typography>
										<Typography sx={availValueSx}>{pi.availability.availableFrom}</Typography>
									</Box>
								)}
								{pi.availability.noticePeriodDays != null && (
									<Box>
										<Typography sx={availLabelSx}>{t('appCVContent.availability.noticePeriod')}</Typography>
										<Typography sx={availValueSx}>
											{pi.availability.noticePeriodDays} {t('appCVContent.availability.days')}
										</Typography>
									</Box>
								)}
							</Box>
						</Grid2>
					)}

					{pi.availability.preferredWorkTypes?.length > 0 && (
						<Grid2 size={{ xs: 12, sm: 6 }}>
							<Typography sx={availLabelSx}>{t('appCVContent.availability.preferredWorkTypes')}</Typography>
							<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
								{pi.availability.preferredWorkTypes.map((type, i) => (
									<Chip key={i} label={type} size="small" sx={softSkillChipSx} />
								))}
							</Box>
						</Grid2>
					)}

					{pi.availability.preferredContractTypes?.length > 0 && (
						<Grid2 size={{ xs: 12, sm: 6 }}>
							<Typography sx={availLabelSx}>{t('appCVContent.availability.preferredContractTypes')}</Typography>
							<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
								{pi.availability.preferredContractTypes.map((type, i) => (
									<Chip key={i} label={type} size="small" sx={softSkillChipSx} />
								))}
							</Box>
						</Grid2>
					)}

					{pi.availability.interviewAvailability?.length > 0 && (
						<Grid2 size={{ xs: 12 }}>
							<Typography sx={availLabelSx}>{t('appCVContent.availability.interviews')}</Typography>
							<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
								{pi.availability.interviewAvailability.map((slot, i) => (
									<Chip key={i} label={slot} size="small"
										sx={{ fontSize: tokens.fontSize.caption, height: 22, backgroundColor: tokens.surface.muted, color: tokens.ink.soft, borderRadius: 0.75 }} />
								))}
							</Box>
						</Grid2>
					)}
				</Grid2>
			)}
			</Card>
		)}
		</>
	);
};

AvailabilitySection.propTypes = {
	draft: PropTypes.any,
	editingSection: PropTypes.any,
	handleCancelEdit: PropTypes.func,
	handleEdit: PropTypes.func,
	handleSave: PropTypes.func,
	isSaving: PropTypes.bool,
	pi: PropTypes.any,
	setDraft: PropTypes.func,
};

export default AvailabilitySection;
