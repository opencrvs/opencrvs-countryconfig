module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'cypress'],
  extends: [
    'eslint:recommended',
    'plugin:prettier/recommended',
    'plugin:cypress/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'prettier'
  ],
  rules: {
    'no-console': 'warn',
    'no-unused-vars': 'warn',
    'no-undef': 'warn'
  },
  globals: {
    NodeJS: true,
    fhir: true
  },
  env: {
    node: true,
    jest: true
  }
}
