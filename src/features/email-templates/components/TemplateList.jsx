import PropTypes from 'prop-types';
import { Box, Button, List, ListItemButton, ListItemText, Tooltip, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { useTranslation } from 'react-i18next';

/** The tenant's templates for the chosen language, plus a New button. */
const TemplateList = ({ atPlanLimit, selectTemplate, selectedId, templateLimit, templates }) => {
	const { t } = useTranslation();
	return (
		<>
		<Box sx={{ width: 220, flexShrink: 0, borderRight: '1px solid #f1f5f9', pr: 1.5, overflowY: 'auto' }}>
			<Tooltip title={atPlanLimit
				? t('emailTemplates.limitReached', 'Plan limit reached — delete a template or upgrade to create more.')
				: ''}>
				<span>
					<Button
						fullWidth size="small" startIcon={<AddRoundedIcon sx={{ fontSize: 15 }} />}
						disabled={atPlanLimit}
						onClick={() => selectTemplate(null)}
						sx={{ justifyContent: 'flex-start', textTransform: 'none', fontSize: '0.75rem', fontWeight: 600, color: '#629C44', mb: 0.5 }}>
						{t('emailTemplates.new', 'New template')}
					</Button>
				</span>
			</Tooltip>
			{templateLimit !== null && (
				<Typography sx={{ fontSize: '0.66rem', color: atPlanLimit ? '#dc2626' : '#94a3b8', px: 1, mb: 0.5 }}>
					{t('emailTemplates.limitNote', '{{count}} of {{limit}} templates used', { count: templates.length, limit: templateLimit })}
				</Typography>
			)}
			<List dense disablePadding>
				{templates.map((template) => (
					<ListItemButton
						key={template.id}
						selected={template.id === selectedId}
						onClick={() => selectTemplate(template)}
						sx={{ borderRadius: 1.5, '&.Mui-selected': { backgroundColor: 'rgba(98,156,68,0.10)' } }}>
						<ListItemText
							primary={template.name}
							primaryTypographyProps={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155', noWrap: true }}
						/>
					</ListItemButton>
				))}
				{templates.length === 0 && (
					<Typography sx={{ fontSize: '0.72rem', color: '#94a3b8', px: 1, py: 0.5 }}>
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
