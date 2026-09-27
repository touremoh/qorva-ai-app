// Sequential status messages shown while the register call runs (account creation also
// provisions the workspace and seeds the sample resume library, so it takes a while).
export const PROGRESS_STEPS = [
	{ key: 'registration.progress.creatingAccount', fallback: 'Creating your account…' },
	{ key: 'registration.progress.settingUpWorkspace', fallback: 'Setting up your workspace…' },
	{ key: 'registration.progress.preparingLibrary', fallback: 'Loading sample resumes into your library…' },
	{ key: 'registration.progress.almostDone', fallback: 'Almost done…' },
];
