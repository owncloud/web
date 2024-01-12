const path = require('path')
const baseConfig = require('../build/webpack.base.conf.js')
const packageConfig = require('../package.json')
const chalk = require('chalk')

module.exports = {
  /**
   * Name of your design system. Changes both page title and sidebar logo.
   */
  title: 'ownCloud Design System',
  webpackConfig: baseConfig,
  /**
   * Most of the styles are defined in /docs/docs.styles.scss
   */
  version: packageConfig.version,
  theme: {
    maxWidth: '100%',
    sidebarWidth: 240,
    fontFamily: {
      base: ['Inter', 'sans-serif'],
      monospace: ['Consolas', "'Liberation Mono'", 'Menlo', 'monospace']
    }
  },
  /**
   * Define a custom code highlighting theme.
   */
  editorConfig: {
    theme: 'night'
  },
  simpleEditor: false,
  /**
   * Path to static assets directory
   */
  assetsDir: path.join(__dirname, '../src/assets'),
  /**
   * Enabling the below option will break things in ownCloud Design System!
   */
  skipComponentsWithoutExample: false,
  renderRootJsx: '../docs/components/Preview.js',
  /**
   * We’re defining below JS and SCSS requires for the documentation.
   */
  require: [
    path.join(__dirname, '../docs/docs.styles.scss'),
    path.join(__dirname, '../docs/docs.helper.js')
  ],
  /**
   * Enabling the following option splits sections into separate views.
   */
  pagePerSection: true,
  sections: [
    {
      name: 'Getting Started',
      content: '../docs/getting-started.md',
      sectionDepth: 1,
      exampleMode: 'hide',
      usageMode: 'hide'
    },
    {
      name: 'Design Principles',
      content: '../docs/principles.md',
      sectionDepth: 1,
      exampleMode: 'hide',
      usageMode: 'hide'
    },
    {
      name: 'Interface Guidelines',
      content: '../docs/guidelines.md',
      sectionDepth: 1,
      exampleMode: 'hide',
      usageMode: 'hide'
    },
    {
      name: 'Voice & Tone',
      content: '../docs/voice-and-tone.md',
      sectionDepth: 1,
      exampleMode: 'hide',
      usageMode: 'hide'
    },
    {
      name: 'Design Tokens',
      content: '../docs/tokens.md',
      sectionDepth: 1,
      exampleMode: 'hide',
      usageMode: 'hide',
      sections: [
        {
          name: 'Icons',
          content: '../docs/icons.md',
          exampleMode: 'hide',
          usageMode: 'hide'
        }
      ]
    },
    {
      name: 'oC Components',
      content: '../docs/components.md',
      components: '../src/components/**/[A-Z]*.vue',
      exampleMode: 'expand',
      usageMode: 'expand',
      sectionDepth: 2
    },
    {
      name: 'Utilities',
      content: '../docs/utilities.md',
      exampleMode: 'hide',
      usageMode: 'expand',
      sectionDepth: 2,
      sections: [
        {
          name: 'Margin',
          content: '../docs/margins.md',
          description: 'Utility classes to assign a margin to elements'
        },
        {
          name: 'Padding',
          content: '../docs/paddings.md',
          description: 'Utility classes to assign a padding to elements'
        },
        {
          name: 'Visibility',
          content: '../docs/visibility.md',
          description: 'Utility classes to hide/display from a certain screen width'
        },
        {
          name: 'Text',
          content: '../docs/text.md',
          description: 'Utility classes to change the way text is displayed'
        }
      ]
    },
    {
      name: 'Animations',
      content: '../docs/animations.md',
      exampleMode: 'hide',
      usageMode: 'hide',
      sectionDepth: 1
    },
    {
      name: 'Use of ARIA',
      content: '../docs/use-of-aria.md',
      exampleMode: 'hide',
      usageMode: 'hide',
      sectionDepth: 1
    },
    {
      name: 'Internationalization',
      content: '../docs/i18n.md',
      exampleMode: 'hide',
      usageMode: 'hide',
      sectionDepth: 1
    },
    {
      name: 'Downloads',
      content: '../docs/downloads.md',
      exampleMode: 'hide',
      usageMode: 'hide',
      sectionDepth: 1
    },
    {
      name: 'Versioning & Release',
      content: '../docs/versioning-and-release.md',
      exampleMode: 'hide',
      usageMode: 'hide',
      sectionDepth: 1
    },
    {
      /**
       * Private components have to be loaded into the documentation as well,
       * otherwise anything using them will be broken. We’re loading them in
       * their own section, which then gets hidden in docs/docs.styles.scss
       */
      name: 'Private Components',
      exampleMode: 'hide',
      usageMode: 'hide',
      components: '../src/**/[_]*.vue'
    }
  ],
  /**
   * Custom wrapper template for the documentation.
   */
  template: {
    title: 'Example — ownCloud Design System',
    lang: 'en',
    trimWhitespace: true,
    head: {
      meta: [
        {
          name: 'viewport',
          content: 'width=device-width,initial-scale=1.0'
        },
        {
          name: 'format-detection',
          content: 'telephone=no'
        }
      ]
    }
  },
  /**
   * Ignore app.vue, tests, and example component.
   */
  ignore: [
    '**/App.vue',
    '**/__tests__/**',
    '**/*.test.js',
    '**/*.test.jsx',
    '**/*.spec.js',
    '**/*.spec.jsx'
  ],
  styleguideDir: '../dist/docs',
  printServerInstructions() {},
  printBuildInstructions(config) {
    console.log(chalk.cyan('\n  Design System Docs build finished succesfully!\n'))
    console.log(
      chalk.yellow(
        '  Tip: You can now deploy the docs as a static website.\n' +
          '  Copy the build files from ' +
          `${config.styleguideDir}\n`
      )
    )
  }
  /**
   * Configure docs server to redirect asset queries
   */
  // configureServer(app) {
  //   // `app` is the instance of the express server running the docs
  //   app.get("/assets/:file", (req, res) => {
  //     res.redirect(req.params.file)
  //   })
  // },
}
