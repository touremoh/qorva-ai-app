import PropTypes from 'prop-types';
import { Box, Link, Typography } from '@mui/material';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import { GREEN } from '../../model/integrations.js';
import * as tokens from '../../../../theme/tokens.js';

/**
 * Numbered setup steps for one provider, optionally preceded by an intro line and followed
 * by a caution. Steps are plain strings in the locale files so translators can reword a
 * whole procedure without touching this component.
 */
const GuideSteps = ({ title, intro, steps, note, docsUrl, docsLabel }) => {
	if (!steps.length && !note) return null;
	return (
		<Box sx={{ borderRadius: 2, backgroundColor: tokens.surface.subtle, border: `1px solid ${tokens.surface.coolPale}`, p: 1.5 }}>
			<Typography sx={{
				fontSize: '0.7rem', color: tokens.ink.muted, fontWeight: 700,
				textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.75,
			}}>
				{title}
			</Typography>
			{intro && (
				<Typography sx={{ fontSize: '0.76rem', color: tokens.ink.soft, mb: 1 }}>{intro}</Typography>
			)}
			{steps.length > 0 && (
				<Box component="ol" sx={{ m: 0, pl: 2.25, display: 'flex', flexDirection: 'column', gap: 0.6 }}>
					{steps.map((step, index) => (
						<Typography key={index} component="li" sx={{ fontSize: '0.76rem', color: tokens.ink.soft, lineHeight: 1.5 }}>
							{step}
						</Typography>
					))}
				</Box>
			)}
			{note && (
				<Typography sx={{ fontSize: '0.74rem', color: tokens.status.warning.text, mt: 1 }}>{note}</Typography>
			)}
			{docsUrl && (
				<Link href={docsUrl} target="_blank" rel="noopener noreferrer"
					sx={{ fontSize: '0.74rem', color: GREEN, display: 'inline-flex', alignItems: 'center', gap: 0.4, mt: 1 }}>
					{docsLabel}
					<OpenInNewOutlinedIcon sx={{ fontSize: 12 }} />
				</Link>
			)}
		</Box>
	);
};
GuideSteps.propTypes = {
	title: PropTypes.node,
	intro: PropTypes.node,
	steps: PropTypes.arrayOf(PropTypes.node).isRequired,
	note: PropTypes.node,
	docsUrl: PropTypes.string,
	docsLabel: PropTypes.node,
};

export default GuideSteps;
