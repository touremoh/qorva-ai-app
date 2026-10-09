// The cookie banner only appears where a visitor arrives from an ad: never inside the signed-in
// app, and never on the candidate self-update page (those visitors are our customers' candidates).
const BANNER_PATHS = [/^\/login$/, /^\/register$/, /^\/success$/, /^\/billing\//];

/** Any link to this hash reopens the banner. */
export const COOKIE_SETTINGS_HASH = '#cookie-settings';

export const isBannerPath = (pathname) => BANNER_PATHS.some((pattern) => pattern.test(pathname));
