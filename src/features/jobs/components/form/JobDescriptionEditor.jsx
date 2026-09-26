import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { default as ReactQuill } from 'react-quill';

/** Rich-text job description editor (Quill), styled like the other inputs. */
const JobDescriptionEditor = ({ jobDescription, setJobDescription }) => {
	return (
		<>
		<Box sx={{
			'.ql-container': { borderRadius: '0 0 8px 8px', fontSize: '0.88rem' },
			'.ql-toolbar': { borderRadius: '8px 8px 0 0', borderColor: '#e2e8f0', transition: 'border-color 0.2s, box-shadow 0.2s' },
			'.ql-container.ql-snow': { borderColor: '#e2e8f0', minHeight: 300, transition: 'border-color 0.2s, box-shadow 0.2s' },
			// Mirror the title TextField's states (inputSx): hover darkens, focus turns green
			// with a 1.5px-feel ring (box-shadow instead of border-width to avoid layout shift).
			'&:hover .ql-toolbar, &:hover .ql-container.ql-snow': { borderColor: '#cbd5e1' },
			'&:focus-within .ql-toolbar': { borderColor: '#629C44', boxShadow: 'inset 0 0 0 0.5px #629C44' },
			'&:focus-within .ql-container.ql-snow': { borderColor: '#629C44', boxShadow: 'inset 0 0 0 0.5px #629C44' },
		}}>
			<ReactQuill theme="snow" value={jobDescription} onChange={setJobDescription} style={{ color: '#0f172a' }} />
		</Box>
		</>
	);
};

JobDescriptionEditor.propTypes = {
	jobDescription: PropTypes.any,
	setJobDescription: PropTypes.func,
};

export default JobDescriptionEditor;
