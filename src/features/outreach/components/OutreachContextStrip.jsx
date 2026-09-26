import PropTypes from 'prop-types';
import dayjs from '../../../shared/lib/dayjs.js';
import { Box, Typography } from '@mui/material';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import { USER_EMAIL } from '../../../constants.js';
import { useTranslation } from 'react-i18next';

/** Job the message is about, and when the candidate was last contacted. */
const OutreachContextStrip = ({ lastContact, locale, target }) => {
	const { t } = useTranslation();
	return (
		<>
		{(target?.jobTitle || lastContact) && (
			<Box sx={{ px: 2, py: 1, backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
				{target?.jobTitle && (
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
						<WorkOutlineOutlinedIcon sx={{ fontSize: 14, color: '#94a3b8' }} />
						<Typography sx={{ fontSize: '0.75rem', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
							{target.jobTitle}{target.score != null ? ` · ${Math.round(target.score)}%` : ''}
						</Typography>
					</Box>
				)}
				{lastContact && (
					<Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
						{t('candidateOutreach.lastContacted', {
							when: dayjs(lastContact.createdAt).locale(locale).fromNow(),
							who: lastContact.senderEmail === (localStorage.getItem(USER_EMAIL) || '') ? t('candidateOutreach.you') : (lastContact.senderName || lastContact.senderEmail),
						})}
					</Typography>
				)}
			</Box>
		)}
		</>
	);
};

OutreachContextStrip.propTypes = {
	lastContact: PropTypes.any,
	locale: PropTypes.any,
	target: PropTypes.any,
};

export default OutreachContextStrip;
