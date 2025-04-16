import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import stylisticTs from '@stylistic/eslint-plugin-ts';

export default tseslint.config(
    eslint.configs.recommended,
    tseslint.configs.recommended,
    tseslint.configs.recommendedTypeChecked,

    {
        files: ["**/*.ts"],
        languageOptions: {
            ecmaVersion: 14,
            parser: tsParser,
            parserOptions: {
                ecmaVersion: 14,
                sourceType: "module",
                project: true
            }
        },
        plugins: {
            "@typescript-eslint": tsPlugin,
            "@stylistic/ts": stylisticTs
        },
        extends: [
            eslint.configs.recommended,
            tseslint.configs.recommended,
            tseslint.configs.recommendedTypeChecked
        ],
        rules: {
            "arrow-parens": ["warn", "always"],
            "brace-style": ["warn", "1tbs"],
            "camelcase": ["warn", {
                "properties": "never",
                "ignoreImports": true
            }],
            "comma-dangle": ["error", "never"],
            "comma-spacing": ["warn", {
                "after": true,
                "before": false
            }],
            "comma-style": ["warn", "last"],
            "curly": ["error", "all"],
            "default-case": 1,
            "eol-last": ["warn", "always"],
            "eqeqeq": ["error", "smart"],
            "indent": ["warn", 4, {
                "SwitchCase": 1
            }],
            "key-spacing": ["warn", {
                "mode": "strict"
            }],
            "keyword-spacing": ["warn", {
                "after": true,
                "before": true
            }],
            "lines-between-class-members": ["warn", "always"],
            "no-multi-spaces": 1,
            "no-multiple-empty-lines": ["warn", { 
                "max": 1
            }],
            "no-trailing-spaces": 1,
            "no-unused-vars": 1,
            "no-useless-escape": 0,
            "object-curly-spacing": ["error", "always", { 
                "objectsInObjects": true,
                "arraysInObjects": true
            }],
            "object-shorthand": ["warn", "consistent"],
            "quotes": ["warn", "double", {
                "avoidEscape": false
            }],
            "semi": "error",
            "semi-style": ["warn", "last"],
            "sort-imports": ["warn", {
                "ignoreCase": false,
                "ignoreDeclarationSort": true
            }],
            "@typescript-eslint/naming-convention": [ "warn", 
                {
                    "selector": "default",
                    "format": ["camelCase"]
                },
                {
                    "selector": "classProperty",
                    "modifiers": ["private"],
                    "format": ["camelCase"],
                    "leadingUnderscore": "require"
                },
                {
                    "selector": "property",
                    "format": null
                },
                {
                    "selector": "import",
                    "format": ["camelCase", "PascalCase"]
                },
                {
                    "selector": "memberLike",
                    "format": ["camelCase"]
                },
                {
                    "selector": "variableLike",
                    "format": ["camelCase"]
                },
                {
                    "selector": "typeLike",
                    "format": ["PascalCase"]
                }
            ],
            "@typescript-eslint/explicit-function-return-type": ["warn", {
                "allowExpressions": true
            }],
            "@stylistic/ts/member-delimiter-style": ["warn", {
                "multiline": {
                  "delimiter": "semi",
                  "requireLast": true
                },
                "singleline": {
                  "delimiter": "semi",
                  "requireLast": false
                },
                "multilineDetection": "brackets"
            }],
            "@typescript-eslint/no-unnecessary-condition": 2,
            "@typescript-eslint/no-unused-expressions": 0,
            "@typescript-eslint/no-require-imports": 2,
            "@typescript-eslint/no-var-requires": 1
        },
        ignores: [
            "node_modules",
            "dist"
        ]
    }
);
