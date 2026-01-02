import js from '@eslint/js';
import vue from 'eslint-plugin-vue';
import { FlatCompat } from '@eslint/eslintrc';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import prettierConfig from 'eslint-config-prettier';

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
});

export default [
  js.configs.recommended,
  ...vue.configs['flat/recommended'],
  ...compat.config(prettierConfig),
  {
    files: ['**/*.vue', '**/*.js', '**/*.mjs'],
    plugins: {
      vue,
    },
    languageOptions: {
      globals: {
        // Allow global in test files
        global: 'readonly',
      },
    },
    rules: {
      // Disable Vue rules that conflict with Prettier
      'vue/max-len': 'off',
      'vue/html-self-closing': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/multiline-html-element-content-newline': 'off',
      'vue/html-closing-bracket-spacing': 'off',
      'vue/html-indent': 'off',
      'vue/max-attributes-per-line': 'off',
      'vue/first-attribute-linebreak': 'off',
      'vue/html-closing-bracket-newline': 'off',
      // Allow single-word component names (for PrimeVue components)
      'vue/multi-word-component-names': ['error', {
        ignores: ['Button', 'Card', 'Password', 'Toast', 'Menubar', 'Avatar', 'Message', 'Textarea', 'Accordion', 'Panel', 'ConfirmDialog'],
      }],
      // Allow reserved component names (PrimeVue uses some reserved names)
      'vue/no-reserved-component-names': 'off',
      // Allow v-html with warning (common for rich text content)
      'vue/no-v-html': 'warn',
      // Make prop rules warnings instead of errors
      'vue/require-default-prop': 'warn',
      'vue/require-prop-types': 'warn',
      // Allow unused vars that start with underscore
      'no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      }],
      // Allow empty catch blocks (sometimes needed)
      'no-empty': ['error', { allowEmptyCatch: true }],
      // Fix auto-fixable issues
      'no-useless-escape': 'error',
    },
  },
  {
    // Test files configuration
    files: ['**/*.test.js', '**/tests/**/*.js', '**/test/**/*.js', '**/setup.js'],
    languageOptions: {
      globals: {
        global: 'readonly',
        expect: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      }],
      // Allow multiple components in test files
      'vue/one-component-per-file': 'off',
    },
  },
  {
    ignores: ['node_modules/**', 'dist/**', 'coverage/**'],
  },
];
