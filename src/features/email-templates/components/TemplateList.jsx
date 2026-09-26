import PropTypes from 'prop-types';
import { Box, Button, List, ListItemButton, ListItemText, Tooltip, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { useTranslation } from 'react-i18next';
import * as tokens from '../../../theme/tokens.js';
import { alpha } from '@mui/material/styles';

/** The tenant's templates for the chosen language, plus a New button. */
const TemplateList = ({ atPlanLimit, selectTemplate, selectedId, templateLimit, templates }) => {
	const { t } = useTranslation();
	return (
		<>
		<Box sx={{ width: 220, flexShrink: 0, borderRight: `1px solid ${tokens.surface.muted}`, pr: 1.5, overflowY: 'auto' }}>
			<Tooltip title={atPlanLimit
				? t('emailTemplates.limitReached', 'Plan limit reached — delete a template or upgrade to create more.')
				: ''}>
				<span>
					<Button
						fullWidth size="small" startIcon={<AddRoundedIcon sx={{ fontSize: tokens.iconSize.sm }} />}
						disabled={atPlanLimit}
						onClick={() => selectTemplate(null)}
						sx={{ justifyContent: 'flex-start', textTransform: 'none', fontSize: tokens.fontSize.small, fontWeight: 600, color: tokens.brand.text, mb: 0.5 }}>
						{t('emailTemplates.new', 'New template')}
					</Button>
				</span>
			</Tooltip>
			{templateLimit !== null && (
				<Typography sx={{ fontSize: tokens.fontSize.caption, color: atPlanLimit ? `${tokens.status.error.main}` : `${tokens.ink.subtle}`, px: 1, mb: 0.5 }}>
					{t('emailTemplates.limitNote', '{{count}} of {{limit}} templates used', { count: templates.length, limit: templateLimit })}
				</Typography>
			)}
			<List dense disablePadding>
				{templates.map((template) => (
					<ListItemButton
						key={template.id}
						selected={template.id === selectedId}
						onClick={() => selectTemplate(template)}
						sx={{ borderRadius: 1.5, '&.Mui-selected': { backgroundColor: alpha(tokens.brand.main, 0.10) } }}>
						<ListItemText
							primary={template.name}
							primaryTypographyProps={{ fontSize: tokens.fontSize.small, fontWeight: 600, color: tokens.ink.body, noWrap: true }}
						/>
					</ListItemButton>
				))}
				{templates.length === 0 && (
					<Typography sx={{ fontSize: tokens.fontSize.caption, color: tokens.ink.subtle, px: 1, py: 0.5 }}>
						{t('emailTemplates.none', 'No templates yet — campaigns use the standard Qorva message.')}
					</Typography>
				)}
			</List>
		</Box>
		</>
	);
};

TemplateList.propTypes = {
	atPlanLimit: PropTypes.any,
	selectTemplate: PropTypes.any,
	selectedId: PropTypes.any,
	templateLimit: PropTypes.any,
	templates: PropTypes.any,
};

export default TemplateList;
