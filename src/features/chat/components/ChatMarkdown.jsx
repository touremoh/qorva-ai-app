import PropTypes from 'prop-types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Box, Typography } from '@mui/material';
import { fontFamilyMono } from '../../../theme/tokens.js';
import * as tokens from '../../../theme/tokens.js';
import { alpha } from '@mui/material/styles';

// Assistant replies are Markdown (headings, bullets, blockquoted questions, small tables).
// Everything is mapped onto the bubble's typography so a structured answer reads like the
// rest of the chat instead of like a document. react-markdown never renders raw HTML, so
// model output cannot inject markup, and images are never loaded (see `img`).

const text = { fontSize: '0.85rem', color: tokens.ink.strong, lineHeight: 1.55, wordBreak: 'break-word' };

const Heading = ({ children }) => (
	<Typography component="div" sx={{ ...text, fontWeight: 700, fontSize: '0.86rem', mt: 1.25, mb: 0.5, '&:first-of-type': { mt: 0 } }}>
		{children}
	</Typography>
);
Heading.propTypes = { children: PropTypes.node };

const components = {
	h1: Heading, h2: Heading, h3: Heading, h4: Heading, h5: Heading, h6: Heading,
	p: ({ children }) => <Typography component="p" sx={{ ...text, m: 0, mb: 0.75, '&:last-child': { mb: 0 } }}>{children}</Typography>,
	ul: ({ children }) => <Box component="ul" sx={{ ...text, pl: 2.5, my: 0.5, '& ul, & ol': { my: 0.25 } }}>{children}</Box>,
	ol: ({ children }) => <Box component="ol" sx={{ ...text, pl: 2.5, my: 0.5, '& ul, & ol': { my: 0.25 } }}>{children}</Box>,
	li: ({ children }) => <Box component="li" sx={{ mb: 0.35, '& p': { m: 0 } }}>{children}</Box>,
	strong: ({ children }) => <Box component="strong" sx={{ fontWeight: 700 }}>{children}</Box>,
	blockquote: ({ children }) => (
		<Box component="blockquote" sx={{
			m: 0, my: 0.75, pl: 1.5, py: 0.25,
			borderLeft: `3px solid ${tokens.brand.main}`, backgroundColor: alpha(tokens.brand.main, 0.06), borderRadius: '0 6px 6px 0',
			fontStyle: 'italic', color: tokens.ink.body,
			'& p': { mb: 0 },
		}}>
			{children}
		</Box>
	),
	table: ({ children }) => (
		<Box sx={{ overflowX: 'auto', my: 0.75 }}>
			<Box component="table" sx={{
				borderCollapse: 'collapse', width: '100%', fontSize: '0.8rem',
				'& th, & td': { border: `1px solid ${tokens.line.main}`, px: 1, py: 0.5, textAlign: 'left', verticalAlign: 'top' },
				'& th': { backgroundColor: tokens.surface.subtle, fontWeight: 700 },
			}}>
				{children}
			</Box>
		</Box>
	),
	// react-markdown v9 has no `inline` flag: every code node gets the chip style and the pre
	// wrapper below strips it again for fenced blocks.
	code: ({ children }) => <Box component="code" sx={{ fontFamily: fontFamilyMono, fontSize: '0.78rem', backgroundColor: tokens.surface.muted, px: 0.5, borderRadius: 0.5 }}>{children}</Box>,
	pre: ({ children }) => <Box component="pre" sx={{ m: 0, my: 0.75, p: 1.25, backgroundColor: tokens.surface.muted, borderRadius: 1.5, overflowX: 'auto', '& code': { backgroundColor: 'transparent', px: 0 } }}>{children}</Box>,
	hr: () => <Box component="hr" sx={{ border: 0, borderTop: `1px solid ${tokens.line.main}`, my: 1.25 }} />,
	a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: tokens.brand.text }}>{children}</a>,
	// Never fetch images named by model output: a reply steered by text planted in a resume could
	// otherwise leak chat content to any host through the image URL. The alt text is kept.
	img: ({ alt }) => (alt ? <span>{alt}</span> : null),
};

export default function ChatMarkdown({ content }) {
	return (
		<Box className="chat-markdown" sx={{ textAlign: 'left', '& *': { textAlign: 'left' } }}>
			<ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
				{content || ''}
			</ReactMarkdown>
		</Box>
	);
}

ChatMarkdown.propTypes = { content: PropTypes.string };
