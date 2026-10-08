import { useState } from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import NoteAddOutlinedIcon from '@mui/icons-material/NoteAddOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useTranslation } from 'react-i18next';
import { saveAgentAnswerAsNote } from '../../api/agentService.js';
import { resolveError } from '../../../../utils/errorHandler.js';
import * as tokens from '../../../../theme/tokens.js';

/** "Save as note" under a candidate answer; once saved (by this button or by Copilot), says so instead. */
const SaveAnswerAsNote = ({ run, onRunUpdate }) => {
	const { t } = useTranslation();
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState(null);
	const saved = !!run.answerNoteId || run.steps?.some((s) => s.summaryKey === 'agent.step.ask_about_candidate_saved');

	if (saved) {
		return (
			<Typography data-testid="copilot-answer-saved" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: tokens.fontSize.micro, color: tokens.ink.subtle }}>
				<CheckCircleOutlineIcon sx={{ fontSize: tokens.iconSize.sm, color: tokens.brand.text }} />
				{t('copilot.answer.savedAsNote')}
			</Typography>
		);
	}
	if (!run.canSaveAnswerAsNote) return null;

	const save = async () => {
		setSaving(true);
		setError(null);
		try {
			const res = await saveAgentAnswerAsNote(run.id);
			onRunUpdate?.(res.data);
		} catch (e) {
			setError(resolveError(e));
		} finally {
			setSaving(false);
		}
	};

	return (
		<>
			<Button size="small" variant="text" onClick={save} disabled={saving} data-testid="copilot-answer-save-note"
				startIcon={<NoteAddOutlinedIcon sx={{ fontSize: tokens.iconSize.sm }} />}
				sx={{ alignSelf: 'flex-start', textTransform: 'none', fontSize: tokens.fontSize.caption, color: tokens.brand.text }}>
				{t('copilot.answer.saveAsNote')}
			</Button>
			{error && <Typography role="alert" sx={{ fontSize: tokens.fontSize.micro, color: tokens.status.error.text }}>{error}</Typography>}
		</>
	);
};

SaveAnswerAsNote.propTypes = {
	run: PropTypes.shape({
		id: PropTypes.string,
		steps: PropTypes.array,
		canSaveAnswerAsNote: PropTypes.bool,
		answerNoteId: PropTypes.string,
	}).isRequired,
	onRunUpdate: PropTypes.func,
};

export default SaveAnswerAsNote;
