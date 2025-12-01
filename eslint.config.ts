import { defineConfig } from "eslint/config";
import eslint from "@eslint/js";
import tseslint, { parser, plugin } from "typescript-eslint";
import stylistic from "@stylistic/eslint-plugin";

export default defineConfig(
    {
        files: ["**/*.ts"],
        languageOptions: {
            ecmaVersion: 15,
            parser: parser,
            parserOptions: {
                ecmaVersion: 15,
                sourceType: "module",
                project: true
            }
        },
        plugins: {
            "@typescript-eslint": plugin,
            "@stylistic": stylistic
        },
        extends: [
            eslint.configs.recommended,
            tseslint.configs.recommended,
            tseslint.configs.recommendedTypeChecked
        ],
        rules: {
            "camelcase": ["warn", {
                "properties": "never",
                "ignoreImports": true
            }],
            "curly": ["error", "all"],
            "default-case": 1,
            "eqeqeq": ["error", "smart"],
            "no-unreachable": 2,
            "no-useless-escape": 0,
            "sort-imports": ["warn", {
                "ignoreCase": false,
                "ignoreDeclarationSort": true
            }],
            "@stylistic/arrow-parens": ["warn", "always"],
            "@stylistic/brace-style": ["warn", "1tbs"],
            "@stylistic/comma-dangle": ["error", "never"],
            "@stylistic/comma-spacing": ["warn", {
                "after": true,
                "before": false
            }],
            "@stylistic/comma-style": ["warn", "last"],
            "@stylistic/eol-last": ["warn", "always"],
            "@stylistic/indent": ["warn", 4, {
                "SwitchCase": 1
            }],
            "@stylistic/key-spacing": ["warn", {
                "mode": "strict"
            }],
            "@stylistic/keyword-spacing": ["warn", {
                "after": true,
                "before": true
            }],
            "@stylistic/lines-between-class-members": ["warn", "always"],
            "@stylistic/no-extra-semi": 2,
            "@stylistic/no-multi-spaces": 1,
            "@stylistic/no-multiple-empty-lines": ["warn", {
                "max": 1
            }],
            "@stylistic/no-tabs": 1,
            "@stylistic/no-trailing-spaces": 1,
            "@stylistic/object-curly-spacing": ["error", "always", {
                "arraysInObjects": true,
                "objectsInObjects": true
            }],
            "@stylistic/quotes": ["warn", "double", {
                "avoidEscape": false
            }],
            "@stylistic/semi": 2,
            "@stylistic/semi-style": ["warn", "last"],
            "@stylistic/member-delimiter-style": ["warn", {
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
            "@typescript-eslint/naming-convention": ["warn",
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
            "@typescript-eslint/no-unnecessary-condition": 2,
            "@typescript-eslint/no-unused-expressions": 0,
            "@typescript-eslint/no-unused-vars": 2,
            "@typescript-eslint/no-require-imports": 2,
            "@typescript-eslint/no-var-requires": 1
        }
    },
    {
        ignores: [
            "node_modules",
            "dist"
        ]
    }
);
