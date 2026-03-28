import stylistic from '@stylistic/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import globals from 'globals'

export default [
    {
        ignores: [
            '.next/**',
            'node_modules/**',
            'logs/**',
        ],
    },
    {
        files: ['**/*.{js,jsx,ts,tsx,mjs,cjs}'],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
                ecmaFeatures: {
                    jsx: true,
                },
            },
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
        plugins: {
            '@stylistic': stylistic,
        },
        rules: {
            semi: 'off',
            'no-tabs': 'off',
            '@stylistic/semi': ['error', 'never'],
            '@stylistic/indent': ['error', 4, { SwitchCase: 1 }],
            '@stylistic/jsx-indent': ['error', 4],
            '@stylistic/jsx-indent-props': ['error', 4],
        },
    },
]
