module.exports = {
  root: true,
  env:  {
    browser: true,
    node:    true
  },
  parser:        'vue-eslint-parser',
  parserOptions: {
    parser:     'babel-eslint',
    sourceType: 'module',
  },
  extends: [
    'standard',
    'eslint:recommended',
    'plugin:vue/recommended',
    '@nuxtjs',
    'plugin:nuxt/recommended',
  ],
  // add your custom rules here
  rules: {
    'dot-notation':             'off',
    'generator-star-spacing':   'off',
    'guard-for-in':             'off',
    'linebreak-style':          'off',
    'new-cap':                  'off',
    'no-empty':                 'off',
    'no-extra-boolean-cast':    'off',
    'no-new':                   'off',
    'no-plusplus':              'off',
    'no-useless-escape':        'off',
    'nuxt/no-cjs-in-config':    'off',
    'semi-spacing':             'off',
    'space-in-parens':          'off',
    strict:                     'off',
    'unicorn/no-new-buffer':    'off',
    'vue/html-self-closing':    'off',
    'vue/no-unused-components': 'warn',
    'vue/no-v-html':            'off',
    'wrap-iife':                'off',

    'array-bracket-spacing':          'warn',
    'arrow-parens':                   'warn',
    'arrow-spacing':                  ['warn', { before: true, after: true }],
    'block-spacing':                  ['warn', 'always'],
    'brace-style':                    ['warn', '1tbs'],
    'comma-dangle':                   ['warn', 'only-multiline'],
    'comma-spacing':                  'warn',
    curly:                           'warn',
    eqeqeq:                          'warn',
    'func-call-spacing':              ['warn', 'never'],
    'implicit-arrow-linebreak':       'warn',
    indent:                          ['warn', 2],
    'keyword-spacing':                'warn',
    'lines-between-class-members':    ['warn', 'always', { exceptAfterSingleLine: true }],
    'multiline-ternary':              ['warn', 'never'],
    'newline-per-chained-call':       ['warn', { ignoreChainWithDepth: 4 }],
    'no-caller':                      'warn',
    'no-cond-assign':                 ['warn', 'except-parens'],
    'no-console':                     'warn',
    'no-debugger':                    'warn',
    'no-eq-null':                     'warn',
    'no-eval':                        'warn',
    'no-trailing-spaces':             'warn',
    'no-undef':                       'warn',
    'no-unused-vars':                 'warn',
    'no-whitespace-before-property':  'warn',
    'object-curly-spacing':           ['warn', 'always'],
    'object-property-newline':        'warn',
    'object-shorthand':               'warn',
    'padded-blocks':                  ['warn', 'never'],
    'prefer-arrow-callback':          'warn',
    'prefer-template':                'warn',
    'quote-props':                    'warn',
    'rest-spread-spacing':            'warn',
    semi:                            ['warn', 'always'],
    'space-before-function-paren':    ['warn', 'never'],
    'space-infix-ops':                'warn',
    'spaced-comment':                 'warn',
    'switch-colon-spacing':           'warn',
    'template-curly-spacing':         ['warn', 'always'],
    'yield-star-spacing':             ['warn', 'both'],

    'key-spacing':              ['warn', {
      align: {
        beforeColon: false,
        afterColon:  true,
        on:          'value',
        mode:        'minimum'
      },
      multiLine: {
        beforeColon: false,
        afterColon:  true
      },
    }],

    'object-curly-newline':          ['warn', {
      ObjectExpression:  {
        multiline:     true,
        minProperties: 3
      },
      ObjectPattern:     {
        multiline:     true,
        minProperties: 4
      },
      ImportDeclaration: {
        multiline:     true,
        minProperties: 5
      },
      ExportDeclaration: {
        multiline:     true,
        minProperties: 3
      }
    }],

    'padding-line-between-statements': [
      'warn',
      {
        blankLine: 'always',
        prev:      '*',
        next:      'return',
      },
      {
        blankLine: 'always',
        prev:      'function',
        next:      'function',
      },
      // This configuration would require blank lines after every sequence of variable declarations
      {
        blankLine: 'always',
        prev:      ['const', 'let', 'var'],
        next:      '*'
      },
      {
        blankLine: 'any',
        prev:      ['const', 'let', 'var'],
        next:      ['const', 'let', 'var']
      }
    ],

    quotes: [
      'warn',
      'single',
      {
        avoidEscape:           true,
        allowTemplateLiterals: true
      },
    ],

    'space-unary-ops': [
      'warn',
      {
        words:    true,
        nonwords: false,
      }
    ],
  }
};

// Desktop additions
module.exports.parserOptions.parser = '@typescript-eslint/parser';
module.exports.plugins = ['@typescript-eslint'];
// Insert the TypeScript recommended changes, but do it right after the default
// ESLint one so that Nuxt things can still override it.
module.exports.extends.splice(
  module.exports.extends.indexOf('eslint:recommended') + 1,
  0,
  'plugin:@typescript-eslint/recommended');

Object.assign(module.exports.rules, {
  // Allow console.log &c.
  'no-console':                   'off',
  // Allow throw with non-error
  'no-throw-literal':             'off',
  // Allow rejection with non-error
  'prefer-promise-reject-errors': 'off',

  // These rules aren't enabled in dashboard (probably due to version differences
  // of the linter presets).
  'array-callback-return':                'off',
  'vue/component-definition-name-casing': 'off',

  // Disable the normal no-unsed-vars, because it doesn't deal with TypeScript
  // correctly (it marks exported enums); there's a TypeScript version,
  // '@typescript-eslint/no-unused-vars', that is enabled by
  // plugin:@typescript-eslint/recommended.
  'no-unused-vars': 'off',

  // Disable TypeScript rules that our code doesn't follow (yet).
  '@typescript-eslint/explicit-module-boundary-types': 'off',
  '@typescript-eslint/no-var-requires':                'off',
  '@typescript-eslint/no-unused-vars':                 'off',
  '@typescript-eslint/no-this-alias':                  'off',
  '@typescript-eslint/no-empty-function':              'off',
  // Allow using `any` in TypeScript, until the whole project is converted.
  '@typescript-eslint/no-explicit-any':                'off',
});