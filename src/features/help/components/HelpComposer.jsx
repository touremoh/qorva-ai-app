import { useState } from 'react';
import PropTypes from 'prop-types';
import { Box, IconButton, InputBase, Typography } from '@mui/material';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import { useTranslation } from 'react-i18next';
import { MAX_MESSAGE_LENGTH } from '../hooks/useHelpConversation.js';
import * as tokens from '../../../theme/tokens.js';

/** Question box: Enter sends, Shift+Enter adds a line; capped at the API's length. */
const HelpComposer = ({ onSend, disabled }) => {
	const { t } = useTranslation();
	const [text, setText] = useState('');
	const tooLong = text.length > MAX_MESSAGE_LENGTH;
	const canSend = !disabled && text.trim().length > 0 && !tooLong;

	const send = () => {
		if (!canSend) return;
		onSend(text);
		setText('');
	};

	return (
		<Box sx={{ borderTop: `1px solid ${tokens.line.main}`, px: 1.5, py: 1.25 }}>
			<Box sx={{
				display: 'flex', alignItems: 'flex-end', gap: 0.5, border: `1px solid ${tokens.line.main}`, borderRadius: 2,
				px: 1.25, py: 0.75, backgroundColor: tokens.surface.paper, '&:focus-within': { borderColor: tokens.brand.border },
			}}>
				<InputBase
					multiline
					maxRows={6}
					fullWidth
					value={text}
					onChange={(e) => setText(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
							e.preventDefault();
							send();
						}
					}}
					placeholder={t('help.placeholder')}
					inputProps={{ 'aria-label': t('help.placeholder'), 'data-testid': 'help-input' }}
					sx={{ fontSize: tokens.fontSize.small, color: tokens.ink.strong }}
				/>
				<IconButton
					size="small"
					data-testid="help-send"
					aria-label={t('help.send')}
					disabled={!canSend}
					onClick={send}
					sx={{ color: tokens.brand.text }}
				>
					<SendRoundedIcon sx={{ fontSize: tokens.iconSize.lg }} />
				</IconButton>
			</Box>
			<Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5, px: 0.5 }}>
				<Typography sx={{ fontSize: tokens.fontSize.micro, color: tokens.ink.faintest }}>{t('help.disclaimer')}</Typography>
				{text.length > MAX_MESSAGE_LENGTH * 0.8 && (
					<Typography sx={{ fontSize: tokens.fontSize.micro, color: tooLong ? tokens.status.error.main : tokens.ink.faintest }}>
						{text.length}/{MAX_MESSAGE_LENGTH}
					</Typography>
				)}
			</Box>
		</Box>
	);
};

HelpComposer.propTypes = {
	onSend: PropTypes.func.isRequired,
	disabled: PropTypes.bool,
};

export default HelpComposer;
