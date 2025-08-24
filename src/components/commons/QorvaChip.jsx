// eslint-disable-next-line no-unused-vars
import React from 'react';
import {Chip} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {STATUS_MAP} from "../../constants.js";
import PropTypes from "prop-types";

const QorvaChip = ({ statusCode }) => {
	const { t } = useTranslation();

	const renderSubscriptionStatus = (statusCode) => {

		console.log(statusCode);
		if (!statusCode) return "—";
		const config = STATUS_MAP[statusCode];

		if (!config) {
			// Unknown / future code: show a safe, friendly fallback and keep the raw code in title for debugging if needed.
			const fallbackLabel = t("accountSettings.status.unknown", "Status unavailable");
			return (<Chip size="small" label={fallbackLabel} variant="outlined"></Chip>);
		}

		const label = t(config.key, config.fallback);
		return ( <Chip size="small" color={config.color} label={label} variant="filled"></Chip>);
	};

	return (
		<div>
			{renderSubscriptionStatus(statusCode)}
		</div>
	);
};

export default QorvaChip;

QorvaChip.propTypes = {
	statusCode: PropTypes.string.isRequired
}
