import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  resolvePluginsRelativeTo: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  {
    ignores: ['projects/**/*', 'dist/**/*', 'frontend/generated/**/*', 'src/generated/**/*'],
  },
  ...compat.config({
    overrides: [
      {
        files: ['**/*.ts'],
        extends: [
          'eslint:recommended',
          'plugin:@typescript-eslint/recommended',
          'plugin:@angular-eslint/recommended',
          'plugin:prettier/recommended',
        ],
        parser: '@typescript-eslint/parser',
        parserOptions: {
          project: ['./tsconfig.app.json'],
          createDefaultProgram: true,
        },
        rules: {
          '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
          'no-console': 'warn',

        },
      },
      {
        files: ['**/*.html'],
        extends: ['plugin:@angular-eslint/template/recommended'],
      },
    ],
  }),
];
