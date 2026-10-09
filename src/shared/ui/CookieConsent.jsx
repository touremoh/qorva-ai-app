import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Button, Link, Slide, Typography } from '@mui/material';
import { CONSENT_ALL, CONSENT_ESSENTIAL, readStoredConsent, writeConsent } from '../../utils/consent.js';
import { denyConsent, grantConsent } from '../../utils/tracking.js';
import { COOKIE_SETTINGS_HASH, isBannerPath } from '../lib/cookieBanner.js';
import * as tokens from '../../theme/tokens.js';

/** Port of the landing page banner (qorva-ai-lp/src/components/CookieConsent.jsx); one choice for both sites. */
const CookieConsent = () => {
	const { t } = useTranslation();
	const { pathname, hash } = useLocation();
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		if (!isBannerPath(pathname)) {
			setVisible(false);
		} else if (hash === COOKIE_SETTINGS_HASH || !readStoredConsent()) {
			setVisible(true);
		}
	}, [pathname, hash]);

	const close = () => {
		setVisible(false);
		if (window.location.hash === COOKIE_SETTINGS_HASH) {
			window.history.replaceState(null, '', window.location.pathname + window.location.search);
		}
	};

	const handleAcceptAll = () => {
		writeConsent(CONSENT_ALL);
		grantConsent();
		close();
	};

	const handleEssentialOnly = () => {
		writeConsent(CONSENT_ESSENTIAL);
		denyConsent();
		close();
	};

	return (
		<Slide direction="up" in={visible} mountOnEnter unmountOnExit>
			<Box
				role="region"
				aria-label={t('cookieConsent.title')}
				sx={{
					position: 'fixed',
					bottom: 0,
					left: 0,
					right: 0,
					zIndex: 9999,
					backgroundColor: tokens.ink.navyDeep,
					color: tokens.ink.inverse,
					px: { xs: 2, md: 4 },
					py: { xs: 2.5, md: 2 },
					boxShadow: '0 -4px 24px rgba(0,0,0,0.3)',
					borderTop: `1px solid ${tokens.brand.border}`,
				}}
			>
				<Box
					sx={{
						maxWidth: 'lg',
						mx: 'auto',
						display: 'flex',
						flexDirection: { xs: 'column', md: 'row' },
						alignItems: { xs: 'flex-start', md: 'center' },
						gap: { xs: 2, md: 3 },
					}}
				>
					<Box sx={{ flex: 1 }}>
						<Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, color: tokens.ink.inverse }}>
							{t('cookieConsent.title')}
						</Typography>
						<Typography variant="body2" sx={{ color: tokens.onDark.subtle, lineHeight: 1.5 }}>
							{t('cookieConsent.description')}{' '}
							<Link
								href="https://www.qorva.ai/privacy-policy"
								target="_blank"
								rel="noopener"
								sx={{ color: tokens.brand.pale, '&:hover': { color: tokens.brand.main } }}
							>
								{t('cookieConsent.learnMore')}
							</Link>
						</Typography>
					</Box>
					<Box sx={{ display: 'flex', gap: 1.5, flexShrink: 0, flexWrap: 'wrap' }}>
						<Button
							variant="outlined"
							size="small"
							onClick={handleEssentialOnly}
							sx={{
								borderColor: tokens.onDark.muted,
								color: tokens.onDark.faintest,
								'&:hover': { borderColor: tokens.ink.inverse, color: tokens.ink.inverse, backgroundColor: 'rgba(255,255,255,0.08)' },
								textTransform: 'none',
								fontWeight: 600,
								px: 2,
							}}
						>
							{t('cookieConsent.essentialOnly')}
						</Button>
						<Button
							variant="contained"
							size="small"
							onClick={handleAcceptAll}
							sx={{
								backgroundColor: tokens.brand.main,
								color: tokens.brand.contrastText,
								fontWeight: 700,
								px: 2,
								'&:hover': { backgroundColor: tokens.brand.hover },
							}}
						>
							{t('cookieConsent.acceptAll')}
						</Button>
					</Box>
				</Box>
			</Box>
		</Slide>
	);
};

export default CookieConsent;
