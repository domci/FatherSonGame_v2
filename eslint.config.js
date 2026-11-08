// Quality rules are enforced by tools, not only written down (lesson from V1).
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

const SIM_FORBIDDEN = [
  { group: ['three', 'three/*'], message: 'sim/content must not use Three.js.' },
  { group: ['**/render/**', '**/ui/**', '**/input/**', '**/platform/**'], message: 'sim/content must not depend on browser layers.' },
];

export default tseslint.config(
  { ignores: ['dist', 'coverage', 'node_modules', 'playwright-report', 'test-results'] },
  js.configs.recommended,
  ...tseslint.configs.strict,
  prettier,
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      'max-lines': ['error', { max: 200, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': ['error', { max: 40, skipBlankLines: true, skipComments: true }],
      complexity: ['error', 12],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      'no-console': ['error', { allow: ['warn', 'error', 'info'] }],
    },
  },
  {
    files: ['src/sim/**', 'src/content/**'],
    rules: { 'no-restricted-imports': ['error', { patterns: SIM_FORBIDDEN }] },
  },
  {
    files: ['src/render/**'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [{ group: ['**/sim/commands/**'], message: 'render only reads state; it never sends commands.' }] }],
    },
  },
  {
    files: ['**/*.test.ts', 'tests/**'],
    rules: { 'max-lines-per-function': 'off', '@typescript-eslint/no-non-null-assertion': 'off' },
  },
);
