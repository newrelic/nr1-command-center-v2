module.exports = {
  env: { browser: true, node: true, es2022: true, jest: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:prettier/recommended'
  ],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: { jsx: true }
  },
  settings: { react: { version: 'detect' } },
  globals: { Atomics: 'readonly', SharedArrayBuffer: 'readonly' },
  rules: { 'prettier/prettier': 'error' }
};
