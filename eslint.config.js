import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { ignores: ['dist', 'playwright-report', 'test-results', 'coverage'] },
  {
    files: ['vite.config.js', 'vitest.config.js', 'playwright.config.js', 'e2e/**/*.js'],
    languageOptions: { globals: globals.node },
  },
  {
    // Colours and type sizes come from src/theme (readability rules, guide §5.2): no hex colours and
    // no font-size literals anywhere else. Large decorative icons (28px and up) may stay numeric.
    files: ['src/**/*.{js,jsx}'],
    ignores: ['src/theme/**', 'src/**/*.test.{js,jsx}', 'src/mocks.js'],
    rules: {
      'no-restricted-syntax': ['error',
        { selector: 'Literal[value=/#[0-9a-fA-F]{3,8}\\b/]', message: 'Use a colour token from src/theme/tokens.js instead of a hex literal.' },
        { selector: 'TemplateElement[value.raw=/#[0-9a-fA-F]{3,8}\\b/]', message: 'Use a colour token from src/theme/tokens.js instead of a hex literal.' },
        { selector: "Property[key.name='fontSize'] > Literal[value=/(rem|px|em)$/]", message: 'Use a size from tokens.fontSize / tokens.iconSize.' },
        { selector: "Property[key.name='fontSize'] > Literal[value<28]", message: 'Use a size from tokens.fontSize / tokens.iconSize.' },
      ],
    },
  },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: { react: { version: '18.3' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      'react/jsx-no-target-blank': 'off',
      'no-unused-vars': ['error', { ignoreRestSiblings: true }],
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
]
