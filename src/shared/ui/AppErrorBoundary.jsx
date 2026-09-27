import { Component } from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Typography } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import i18n from '../../i18n.js';

/**
 * Last line of defence: a render error anywhere below shows a recoverable screen instead of a
 * blank page. The error is logged for the console and error tracking; the user can reload.
 */
export default class AppErrorBoundary extends Component {
	constructor(props) {
		super(props);
		this.state = { failed: false };
	}

	static getDerivedStateFromError() {
		return { failed: true };
	}

	componentDidCatch(error, info) {
		console.error('Unhandled render error', error, info?.componentStack);
	}

	render() {
		if (!this.state.failed) return this.props.children;
		return (
			<Box role="alert" sx={{
				minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center',
				justifyContent: 'center', gap: 2, p: 3, textAlign: 'center', backgroundColor: 'surface.subtle',
			}}>
				<ErrorOutlineIcon sx={{ fontSize: 44, color: 'status.error.main' }} />
				<Typography variant="h5" sx={{ color: 'ink.strong' }}>
					{i18n.t('errors.boundaryTitle')}
				</Typography>
				<Typography sx={{ color: 'ink.body', maxWidth: 420 }}>
					{i18n.t('errors.boundaryBody')}
				</Typography>
				<Button variant="contained" onClick={() => window.location.reload()}>
					{i18n.t('errors.boundaryReload')}
				</Button>
			</Box>
		);
	}
}

AppErrorBoundary.propTypes = { children: PropTypes.node };
