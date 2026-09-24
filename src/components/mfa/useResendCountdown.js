import { useEffect, useState } from 'react';

/** Whole seconds left until `availableAt` (ISO string or null), ticking once a second; 0 when resend is allowed. */
const useResendCountdown = (availableAt) => {
	const target = availableAt ? new Date(availableAt).getTime() : 0;
	const [now, setNow] = useState(() => Date.now());

	useEffect(() => {
		if (!target) return undefined;
		setNow(Date.now());
		const id = setInterval(() => setNow(Date.now()), 1000);
		return () => clearInterval(id);
	}, [target]);

	return Math.max(0, Math.ceil((target - now) / 1000));
};

export default useResendCountdown;
