module.exports = {
    extends: [
        "airbnb-base"
    ],
    plugins: ["import", "fp"],
    rules: {
        "comma-dangle": ["error", "never"],
        "no-confusing-arrow": "off",
        "class-methods-use-this": "off",
        "arrow-params": "off",
        "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
        quotes: [2, "double"],
        "quote-props": ["error", "as-needed", { numbers: true }],
        indent: ["error", 4],
        "fp/no-arguments": "error",
        "fp/no-delete": "error",
        "fp/no-get-set": "error",
        "fp/no-mutating-assign": "error",
        "fp/no-proxy": "error",
        "import/no-dynamic-require": "off",
        "import/no-extraneous-dependencies": [
            "error",
            { devDependencies: true }
        ]
    },
    env: {
        node: true
    }
};
