module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { react: { version: '18.2' } },
  plugins: ['react-refresh'],
  rules: {
    'react/jsx-no-target-blank': 'off',
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true, allowExportNames: ['useTheme'] },
    ],
  },
  overrides: [
    {
      // Generated shadcn/ui primitives forward props to Radix and export variant helpers
      files: ['src/components/ui/**'],
      rules: {
        'react/prop-types': 'off',
        'react-refresh/only-export-components': 'off',
      },
    },
    {
      // The router file declares lazy page components alongside the router
      files: ['src/routes/Routes.jsx'],
      rules: { 'react-refresh/only-export-components': 'off' },
    },
    {
      files: ['*.config.js'],
      env: { node: true },
    },
  ],
}
