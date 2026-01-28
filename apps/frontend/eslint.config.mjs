// @ts-check
import js from '@eslint/js';
import nextVitals from 'eslint-config-next/core-web-vitals';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/**
 * PATCH NEXT.JS
 * eslint-config-next définit le plugin "@typescript-eslint".
 * tseslint.configs définit AUSSI le plugin "@typescript-eslint".
 * ESLint 9 interdit la redéfinition.
 *
 * Solution : On retire le plugin de la config Next.js pour laisser
 * la priorité à notre config TypeScript stricte.
 */
const patchedNextVitals = nextVitals.map((config) => {
  if (config.plugins?.['@typescript-eslint']) {
    const { '@typescript-eslint': _, ...rest } = config.plugins;
    return { ...config, plugins: rest };
  }
  return config;
});

export default tseslint.config(
  js.configs.recommended,
  ...patchedNextVitals,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        projectService: {
          allowDefaultProject: ['eslint.config.mjs'],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-console': ['warn', { allow: ['warn', 'error'] }],

      '@typescript-eslint/explicit-function-return-type': 'off',
      'react/display-name': 'off',
      '@typescript-eslint/no-misused-promises': [
        'error',
        {
          checksVoidReturn: {
            attributes: false,
          },
        },
      ],
    },
  },
  {
    ignores: [
      '.next/**',
      'out/**',
      'build/**',
      'dist/**',
      'node_modules/**',
      'next-env.d.ts',
      'postcss.config.mjs',
      'tailwind.config.ts',
    ],
  },
  {
    files: ['eslint.config.mjs'],
    rules: {
      '@typescript-eslint/no-deprecated': 'off',
    },
  },
);
