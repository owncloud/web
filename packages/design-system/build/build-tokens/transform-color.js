const path = require('path')
const tinyColor = require('tinycolor2')

module.exports = {
  name: 'transform/ods/color',
  type: 'value',
  transitive: true,
  matcher: (prop) => [path.parse(prop.filePath).name].includes('color'),
  transformer: function ({ value, transform = {} }) {
    const { lighten, brighten, darken, desaturate, saturate } = transform
    const color = tinyColor(value)

    if (lighten) {
      color.lighten(parseInt(lighten))
    }
    if (brighten) {
      color.brighten(parseInt(brighten))
    }
    if (darken) {
      color.darken(parseInt(darken))
    }
    if (desaturate) {
      color.desaturate(parseInt(desaturate))
    }
    if (saturate) {
      color.saturate(parseInt(saturate))
    }

    return color.toRgbString()
  }
}
