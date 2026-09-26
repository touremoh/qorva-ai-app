import PropTypes from 'prop-types';
import SectionHeader from '../../../../shared/ui/SectionHeader.jsx';
import { Box, Button, CircularProgress, Typography, Chip, TextField } from '@mui/material';
import LabelIcon from '@mui/icons-material/Label';
import EditSectionButton from './EditSectionButton.jsx';
import Card from './Card.jsx';
import { techSkillChipSx } from '../../model/cvDetailsStyles.js';
import { useTranslation } from 'react-i18next';

/** The resume's tags, editable inline. */
const TagsSection = ({ draft, editingSection, handleAddTag, handleCancelEdit, handleEdit, handleRemoveTag, handleSave, isSaving, setTagInput, tagInput, tags }) => {
	const { t } = useTranslation();
	return (
		<>
		<Card sx={{ mb: 2 }}>
			<SectionHeader tone="document"
				icon={LabelIcon}
				label={t('appCVContent.tags')}
			 action={<EditSectionButton onClick={editingSection !== 'tags' ? () => handleEdit('tags') : undefined} />}
			/>
			{editingSection === 'tags' ? (
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
					{/* Current tags as removable chips */}
					{draft.tags?.length > 0 && (
						<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
							{draft.tags.map((tag, i) => (
								<Chip
									key={i}
									label={tag}
									size="small"
									onDelete={() => handleRemoveTag(tag)}
									sx={{ ...techSkillChipSx, '& .MuiChip-deleteIcon': { fontSize: 13, color: '#629C44' } }}
								/>
							))}
						</Box>
					)}
					{/* Add new tag */}
					<Box sx={{ display: 'flex', gap: 1 }}>
						<TextField
							size="small"
							placeholder={t('appCVContent.addTag', 'Add a tag…')}
							value={tagInput}
							onChange={e => setTagInput(e.target.value)}
							onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
							InputProps={{ sx: { fontSize: '0.82rem', borderRadius: 1.5 } }}
							sx={{ flex: 1 }}
						/>
						<Button
							size="small"
							variant="outlined"
							onClick={handleAddTag}
							disabled={!tagInput.trim()}
							sx={{ textTransform: 'none', fontSize: '0.78rem', borderRadius: 1.5, borderColor: '#629C44', color: '#629C44', '&:hover': { borderColor: '#528035', backgroundColor: 'rgba(98,156,68,0.05)' } }}
						>
							+
						</Button>
					</Box>
					{/* Save / Cancel */}
					<Box sx={{ display: 'flex', gap: 1 }}>
						<Button
							size="small"
							variant="contained"
							disabled={isSaving}
							onClick={handleSave}
							startIcon={isSaving ? <CircularProgress size={12} color="inherit" /> : null}
							sx={{ textTransform: 'none', fontSize: '0.78rem', backgroundColor: '#629C44', '&:hover': { backgroundColor: '#528035' }, borderRadius: 1.5, boxShadow: 'none', fontWeight: 600 }}
						>
							{t('appCVContent.save', 'Save')}
						</Button>
						<Button
							size="small"
							onClick={handleCancelEdit}
							sx={{ textTransform: 'none', fontSize: '0.78rem', color: '#64748b', borderRadius: 1.5 }}
						>
							{t('appCVContent.cancel')}
						</Button>
					</Box>
				</Box>
			) : (
				<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
					{tags.length === 0 ? (
						<Typography sx={{ fontSize: '0.78rem', color: '#cbd5e1', fontStyle: 'italic' }}>
							{t('appCVContent.noTags', 'No tags yet — click edit to add some.')}
						</Typography>
					) : tags.map((tag, i) => (
						<Chip key={i} label={tag} size="small" sx={techSkillChipSx} />
					))}
				</Box>
			)}
		</Card>
		</>
	);
};

TagsSection.propTypes = {
	draft: PropTypes.any,
	editingSection: PropTypes.any,
	handleAddTag: PropTypes.func,
	handleCancelEdit: PropTypes.func,
	handleEdit: PropTypes.func,
	handleRemoveTag: PropTypes.func,
	handleSave: PropTypes.func,
	isSaving: PropTypes.bool,
	setTagInput: PropTypes.func,
	tagInput: PropTypes.any,
	tags: PropTypes.any,
};

export default TagsSection;
