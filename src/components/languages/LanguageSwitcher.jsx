// eslint-disable-next-line no-unused-vars
import React, { useState } from 'react';
import { Select, MenuItem, FormControl } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { FlagIcon } from 'react-flag-kit';

// eslint-disable-next-line react/prop-types
const LanguageSwitcher = ({textColor = 'black'}) => {
	const { i18n } = useTranslation();
	const [language, setLanguage] = useState(i18n.language);

	const handleLanguageChange = (event) => {
		const newLanguage = event.target.value;
		console.log(newLanguage);
		setLanguage(newLanguage);
		i18n.changeLanguage(newLanguage);
	};

	return (
		<FormControl fullWidth sx={{ mt: 2, maxWidth: '200px', margin: '0 auto' }}>
			<Select
				value={language}
				onChange={handleLanguageChange}
				variant="outlined"
				sx={{
					display: 'flex',
					alignItems: 'center',
					color: textColor,
					'& .MuiSvgIcon-root': {
						color: textColor // Set arrow icon color to white
					},
					'& .MuiOutlinedInput-notchedOutline': {
						border: 'none'
					},
				}}
			>
				<MenuItem value="en">
					<FlagIcon code="GB" size={20} style={{ marginRight: 8 }} />English
				</MenuItem>
				<MenuItem value="fr">
					<FlagIcon code="FR" size={20} style={{ marginRight: 8 }} />Français
				</MenuItem>
				<MenuItem value="de">
					<FlagIcon code="DE" size={20} style={{ marginRight: 8 }} />Deutsch
				</MenuItem>
				<MenuItem value="es">
					<FlagIcon code="ES" size={20} style={{ marginRight: 8 }} />Español
				</MenuItem>
				<MenuItem value="pt">
					<FlagIcon code="PT" size={20} style={{ marginRight: 8 }} />Português
				</MenuItem>
				<MenuItem value="it">
					<FlagIcon code="IT" size={20} style={{ marginRight: 8 }} />Italiano
				</MenuItem>
				<MenuItem value="nl">
					<FlagIcon code="NL" size={20} style={{ marginRight: 8 }} />Nederlands
				</MenuItem>
			</Select>
		</FormControl>
	);
};

export default LanguageSwitcher;
