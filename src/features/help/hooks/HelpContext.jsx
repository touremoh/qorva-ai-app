import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { getHelpAvailability } from '../api/helpService.js';

// Qorva Help panel state, above AppContent so the conversation survives panel switches. Anything can open it with
// openHelp() or, outside React, by dispatching the window event below (e.g. a "contact support" text).

export const OPEN_HELP_EVENT = 'qorva:open-help';

const HelpContext = createContext({ enabled: false, open: false, openHelp: () => {}, closeHelp: () => {} });

// eslint-disable-next-line react-refresh/only-export-components
export const useHelpPanel = () => useContext(HelpContext);

export const HelpProvider = ({ children }) => {
	const [enabled, setEnabled] = useState(false);
	const [open, setOpen] = useState(false);
	const [openTicket, setOpenTicket] = useState(false);

	useEffect(() => {
		let cancelled = false;
		getHelpAvailability()
			.then((res) => { if (!cancelled) setEnabled(!!res.data?.enabled); })
			// An API without Qorva Help (404) or any error: no button.
			.catch(() => { if (!cancelled) setEnabled(false); });
		return () => { cancelled = true; };
	}, []);

	const openHelp = useCallback(({ ticket = false } = {}) => {
		setOpen(true);
		setOpenTicket(ticket);
	}, []);
	const closeHelp = useCallback(() => setOpen(false), []);
	const ticketOpened = useCallback(() => setOpenTicket(false), []);

	useEffect(() => {
		const onOpen = (e) => openHelp({ ticket: !!e.detail?.ticket });
		window.addEventListener(OPEN_HELP_EVENT, onOpen);
		return () => window.removeEventListener(OPEN_HELP_EVENT, onOpen);
	}, [openHelp]);

	const value = useMemo(() => ({ enabled, open, openTicket, openHelp, closeHelp, ticketOpened }),
		[enabled, open, openTicket, openHelp, closeHelp, ticketOpened]);
	return <HelpContext.Provider value={value}>{children}</HelpContext.Provider>;
};

HelpProvider.propTypes = { children: PropTypes.node };
