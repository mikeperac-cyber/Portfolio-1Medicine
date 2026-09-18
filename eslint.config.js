const js = require('@eslint/js');
const globals = require('globals');
module.exports = [
  { ignores: ['dist/**', '.vercel/**', 'node_modules/**'] },
  js.configs.recommended,
  { languageOptions: { globals: { ...globals.node, ...globals.browser, ...globals.serviceworker } },
    rules: { 'no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrors: 'none', varsIgnorePattern: '^(_|App$|validateHealthPrompt$|formatSafeResponse$)' }] } },
  { files: ['js/app.js'], languageOptions: { globals: { validateHealthPrompt: 'readonly' } } },
];
