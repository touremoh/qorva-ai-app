import PropTypes from 'prop-types';
import { Alert, Box, Chip, TextField, Typography } from '@mui/material';
import { fontFamilyMono } from '../../../theme/tokens.js';
import { useTranslation } from 'react-i18next';

// Tokens the backend replaces when the email is sent.
const PLACEHOLDERS = ['candidate_name', 'company_name'];

/** Name, subject and body of the selected template, with placeholder chips. */
const TemplateEditor = ({ bodyRef, error, form, insertPlaceholder, notice, preview, setForm }) => {
	const { t } = useTranslation();
	return (
		<>
		<Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5, minWidth: 0, pt: 0.5, overflowY: 'auto' }}>
			{error && <Alert severity="error" sx={{ py: 0 }}>{error}</Alert>}
			{notice && <Alert severity="success" sx={{ py: 0 }}>{notice}</Alert>}
			<TextField
				label={t('emailTemplates.name', 'Template name')}
				value={form.name}
				onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
				size="small" fullWidth inputProps={{ maxLength: 80 }}
			/>
			<TextField
				label={t('emailTemplates.subject', 'Subject')}
				value={form.subject}
				onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
				size="small" fullWidth inputProps={{ maxLength: 150 }}
			/>
			<TextField
				label={t('emailTemplates.body', 'Message')}
				value={form.bodyText}
				onChange={(e) => setForm((f) => ({ ...f, bodyText: e.target.value }))}
				inputRef={bodyRef}
				multiline minRows={6} size="small" fullWidth inputProps={{ maxLength: 4000 }}
				helperText={t('emailTemplates.bodyHint', 'Plain text. Blank lines start a new paragraph. The greeting, action button, your signature (name and company), and unsubscribe link are added automatically.')}
			/>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
				<Typography sx={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>
					{t('emailTemplates.placeholders', 'Insert:')}
				</Typography>
				{PLACEHOLDERS.map((token) => (
					<Chip
						key={token} label={`{{${token}}}`} size="small" onClick={() => insertPlaceholder(token)}
						sx={{ fontSize: '0.66rem', fontFamily: fontFamilyMono, height: 22, cursor: 'pointer' }}
					/>
				))}
			</Box>

			{preview && (
				<Box sx={{ border: '1px solid #e2e8f0', borderRadius: 2, overflow: 'hidden', flexShrink: 0 }}>
					<Box sx={{ px: 1.5, py: 0.75, backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
						<Typography sx={{ fontSize: '0.72rem', color: '#334155', fontWeight: 700 }}>
							{preview.subject}
						</Typography>
					</Box>
					{/* Server-rendered from escaped plain text — safe to inject. */}
					<Box sx={{ p: 1.5, maxHeight: 260, overflow: 'auto' }} dangerouslySetInnerHTML={{ __html: preview.html }} />
				</Box>
			)}
		</Box>
		</>
	);
};

TemplateEditor.propTypes = {
	bodyRef: PropTypes.any,
	error: PropTypes.any,
	form: PropTypes.any,
	insertPlaceholder: PropTypes.any,
	notice: PropTypes.any,
	preview: PropTypes.any,
	setForm: PropTypes.func,
};

export default TemplateEditor;
