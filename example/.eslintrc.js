module.exports = {
  root: true,
  extends: ['@react-native', 'prettier'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
    'react',
    'react-hooks',
    'react-native',
    'prettier',
  ],
  env: {
    'react-native/react-native': true,
    'es2022': true,
    'node': true,
  },
  rules: {
    // Prettier integration
    'prettier/prettier': [
      'error',
      {
        quoteProps: 'consistent',
        singleQuote: true,
        tabWidth: 2,
        trailingComma: 'es5',
        useTabs: false,
        printWidth: 80,
        semi: true,
        bracketSpacing: true,
        arrowParens: 'avoid',
        endOfLine: 'lf',
      },
    ],

    // React rules
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react/display-name': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // TypeScript rules (relaxed for example app)
    '@typescript-eslint/no-unused-vars': [
      'warn', // Changed from 'error' to 'warn'
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off', // Allow any in examples
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-shadow': 'off',

    // General code quality rules (relaxed)
    'no-console': 'off', // Allow console.log in examples
    'no-debugger': 'warn', // Changed from 'error' to 'warn'
    'no-var': 'error',
    'prefer-const': 'warn', // Changed from 'error' to 'warn'
    'prefer-template': 'off',
    'object-shorthand': 'off',
    'no-duplicate-imports': 'off', // Allow for demo purposes
    'no-useless-rename': 'off',
    'no-useless-computed-key': 'off',
    'no-unneeded-ternary': 'off',
    'yoda': 'off',

    // React Native specific rules (relaxed for examples)
    'react-native/no-unused-styles': 'off', // Allow unused styles in examples
    'react-native/split-platform-components': 'off',
    'react-native/no-inline-styles': 'off', // Allow inline styles for demos
    'react-native/no-color-literals': 'off', // Allow color literals in examples
    'react-native/no-raw-text': 'off',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  ignorePatterns: [
    'node_modules/',
    'android/build/',
    'ios/build/',
    'ios/Pods/',
    '*.bundle.js',
  ],
};
