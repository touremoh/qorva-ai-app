import { useState } from 'react';
import PropTypes from 'prop-types';
import { Chip, ListItemIcon, Menu, MenuItem, Tooltip } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CheckIcon from '@mui/icons-material/Check';
import { useTranslation } from 'react-i18next';
import { REPORT_STATUSES, statusChipSx, statusOf } from '../../model/reportStatus.js';
import * as tokens from '../../../../theme/tokens.js';

/**
 * Where the candidate stands on this job. With {@code onChange}, a click opens the pipeline to move them; without
 * it (demo users, no permission) the chip only shows the status.
 */
const ReportStatusChip = ({ report, onChange, size = 'small' }) => {
	const { t } = useTranslation();
	const [anchor, setAnchor] = useState(null);
	const status = statusOf(report);
	const editable = typeof onChange === 'function';
	const label = t(`reportStatus.values.${status}`);

	const open = (event) => {
		event.stopPropagation();
		setAnchor(event.currentTarget);
	};
	const choose = (event, next) => {
		event.stopPropagation();
		setAnchor(null);
		if (next !== status) onChange(report, next);
	};

	const chip = (
		<Chip
			label={label}
			size={size}
			onClick={editable ? open : undefined}
			onDelete={editable ? open : undefined}
			deleteIcon={editable ? <ArrowDropDownIcon aria-hidden /> : undefined}
			aria-label={editable ? t('reportStatus.change', { status: label }) : label}
			aria-haspopup={editable ? 'menu' : undefined}
			sx={{
				height: size === 'small' ? 20 : 26, fontSize: tokens.fontSize.caption, fontWeight: 600,
				...statusChipSx(status),
				'& .MuiChip-deleteIcon': { color: 'inherit', fontSize: tokens.iconSize.md, mr: 0.25 },
			}}
		/>
	);

	return (
		<>
			{editable ? chip : <Tooltip title={t('reportStatus.label')}>{chip}</Tooltip>}
			{editable && (
				<Menu anchorEl={anchor} open={Boolean(anchor)} onClose={(e) => { e?.stopPropagation?.(); setAnchor(null); }}
					onClick={(e) => e.stopPropagation()}>
					{REPORT_STATUSES.map((s) => (
						<MenuItem key={s} selected={s === status} onClick={(e) => choose(e, s)} sx={{ fontSize: tokens.fontSize.body2, minWidth: 180 }}>
							<ListItemIcon sx={{ minWidth: 28 }}>{s === status && <CheckIcon sx={{ fontSize: tokens.iconSize.md }} />}</ListItemIcon>
							{t(`reportStatus.values.${s}`)}
						</MenuItem>
					))}
				</Menu>
			)}
		</>
	);
};

ReportStatusChip.propTypes = {
	report: PropTypes.object.isRequired,
	onChange: PropTypes.func,
	size: PropTypes.oneOf(['small', 'medium']),
};

export default ReportStatusChip;
