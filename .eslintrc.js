module.exports = {
    "globals": {
      angular: true,
      debug: false,
      R: false,
      $: true,
      debug: false,
      process: false,
      Buffer: false,
    },
    "env": {
        "browser": true,
        "commonjs": true,
        "es6": true,
        jquery: true
    },
    "extends": "eslint:recommended",
    "rules": {
        "block-scoped-var" : 'error',
        "space-in-parens": ["error", "never"],
        "no-shadow": "warn",
        "no-unused-vars": [
          "warn", {
             "vars": "all",
             "args": "all"
          }
        ],
        "no-console": [
          "warn"
        ],
        "indent": [
            "warn",
            2
        ],
        camelcase: ["warn", {properties: "always"}],
        complexity: ["error", 3],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "no-var": "error",
        "prefer-spread": "error",
        "dot-location": ["error", "property"],
        "no-implicit-coercion": "error",
        "no-magic-numbers": "warn",
        "no-multi-spaces": ["error", { exceptions: { "VariableDeclarator": true } }],
        "no-useless-escape": "error",
        "prefer-arrow-callback": "warn",
        // "no-useless-return": "error",
        "callback-return": "error",
        "no-use-before-define": "warn",
        'curly': ["error", "multi-or-nest"],
        "quotes": [
            "off",
            "double"

        ],
        "semi": [
            "warn",
            "never"
        ],
    }
};
