import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import react from 'eslint-plugin-react'

export default [
  { ignores: ['dist', 'dev-dist'] },
  js.configs.recommended,
  reactHooks.configs.flat.recommended,
  {
    files: ['**/*.{js,jsx}'],
    plugins: { react },
    settings: { react: { version: 'detect' } },
    rules: { 'react/jsx-uses-vars': 'error' },
  },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2024,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: { 'react-refresh': reactRefresh },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]|^Icon$' }],
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
]