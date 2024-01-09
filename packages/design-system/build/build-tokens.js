const StyleDictionary = require('style-dictionary')
const path = require('path')
const yaml = require('yaml')

StyleDictionary.registerFormat(require('./build-tokens/format-writer-json'))
StyleDictionary.registerFormat(require('./build-tokens/format-writer-scss'))
StyleDictionary.registerTransform(require('./build-tokens/transform-namespace'))

StyleDictionary.extend({
  parsers: [
    {
      pattern: /\.yaml$/,
      parse: ({ contents }) => yaml.parse(contents)
    }
  ],
  source: [path.join(__dirname, '../src/tokens/**/*.yaml')],
  platforms: {
    default: {
      transforms: ['name/cti/kebab', 'transform/ods/namespace'],
      buildPath: 'src/assets/tokens/',
      files: [
        {
          destination: 'ods.scss',
          format: 'format/ods/scss',
          filter: ({ filePath }) => filePath.includes('/ods/')
        },
        {
          destination: 'ods.json',
          format: 'format/ods/json',
          filter: ({ filePath }) => filePath.includes('/ods/')
        },
        {
          destination: 'docs.scss',
          format: 'format/ods/scss',
          filter: ({ filePath }) => filePath.includes('/docs/')
        }
      ]
    }
  }
}).buildAllPlatforms()
