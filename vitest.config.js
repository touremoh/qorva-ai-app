// Unit and component tests (Vitest + Testing Library). Browser end-to-end tests live in e2e/ (Playwright).
import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config.js';

export default defineConfig((env) => mergeConfig(viteConfig(env), {
	test: {
		environment: 'jsdom',
		setupFiles: ['./src/test/setup.js'],
		include: ['src/**/*.test.{js,jsx}'],
		restoreMocks: true,
		coverage: {
			provider: 'v8',
			include: ['src/**/*.{js,jsx}'],
			exclude: ['src/**/*.test.{js,jsx}', 'src/test/**', 'src/locales/**'],
		},
	},
}));
