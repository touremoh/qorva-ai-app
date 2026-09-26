import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { default as ReactQuill } from 'react-quill';
import * as tokens from '../../../../theme/tokens.js';

/** Rich-text job description editor (Quill), styled like the other inputs. */
const JobDescriptionEditor = ({ jobDescription, setJobDescription }) => {
	return (
		<>
		<Box sx={{
			'.ql-container': { borderRadius: '0 0 8px 8px', fontSize: tokens.fontSize.body2 },
			'.ql-toolbar': { borderRadius: '8px 8px 0 0', borderColor: tokens.line.main, transition: 'border-color 0.2s, box-shadow 0.2s' },
			'.ql-container.ql-snow': { borderColor: tokens.line.main, minHeight: 300, transition: 'border-color 0.2s, box-shadow 0.2s' },
			// Mirror the title TextField's states (inputSx): hover darkens, focus turns green
			// with a 1.5px-feel ring (box-shadow instead of border-width to avoid layout shift).
			'&:hover .ql-toolbar, &:hover .ql-container.ql-snow': { borderColor: tokens.line.strong },
			'&:focus-within .ql-toolbar': { borderColor: tokens.brand.main, boxShadow: `inset 0 0 0 0.5px ${tokens.brand.main}` },
			'&:focus-within .ql-container.ql-snow': { borderColor: tokens.brand.main, boxShadow: `inset 0 0 0 0.5px ${tokens.brand.main}` },
		}}>
			<ReactQuill theme="snow" value={jobDescription} onChange={setJobDescription} style={{ color: tokens.ink.strong }} />
		</Box>
		</>
	);
};

JobDescriptionEditor.propTypes = {
	jobDescription: PropTypes.any,
	setJobDescription: PropTypes.func,
};

export default JobDescriptionEditor;
