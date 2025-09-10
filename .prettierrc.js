module.exports = {
  // Basic formatting
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  quoteProps: 'consistent',
  trailingComma: 'es5',
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'avoid',
  endOfLine: 'lf',

  // JSX specific
  jsxSingleQuote: true,

  // Prose wrapping
  proseWrap: 'preserve',

  // HTML whitespace sensitivity
  htmlWhitespaceSensitivity: 'css',

  // Vue files support (if needed in future)
  vueIndentScriptAndStyle: false,

  // Embedded language formatting
  embeddedLanguageFormatting: 'auto',

  // File overrides for specific file types
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 120,
        trailingComma: 'none',
      },
    },
    {
      files: '*.md',
      options: {
        printWidth: 100,
        proseWrap: 'always',
        semi: false,
        trailingComma: 'none',
      },
    },
    {
      files: '*.yaml',
      options: {
        printWidth: 120,
        singleQuote: false,
      },
    },
    {
      files: '*.yml',
      options: {
        printWidth: 120,
        singleQuote: false,
      },
    },
  ],
};
