const tinyColor = require('tinycolor2')
const path = require('path')
const { color } = require('style-value-types')
const { contrast, generateContrastColors } = require('@adobe/leonardo-contrast-colors')
const getContrast = (color, on) =>
  contrast(
    Object.values(tinyColor(color).toRgb()),
    Object.values(tinyColor(on).toRgb()),
    undefined
  ).toFixed(2)

exports.checkContrast = ({
  givenColor,
  givenBackground = 'rgb(255, 255, 255)',
  ratio = 3.5,
  colorspace = 'CAM02',
  output = 'RGB'
}) => {
  givenColor = tinyColor(givenColor)
  givenBackground = tinyColor(givenBackground)
  const recommendedColor = tinyColor(
    generateContrastColors({
      colorKeys: [givenColor.toRgbString()],
      base: givenBackground.toRgbString(),
      ratios: [ratio + 0.1],
      colorspace,
      output
    })[0]
  )

  return {
    givenColor,
    givenBackground,
    givenRatio: {
      value: getContrast(givenColor.toRgbString(), givenBackground.toRgbString()),
      get valid() {
        return this.value >= ratio
      }
    },
    recommendedColor,
    recommendedRatio: {
      value: getContrast(recommendedColor.toRgbString(), givenBackground.toRgbString()),
      get valid() {
        return this.value >= ratio
      }
    }
  }
}

exports.getPropType = (prop) => {
  const { type } = prop.arguments | {}

  if (type) {
    return type
  } else if (color.test(prop.value)) {
    return 'color'
  } else if (!isNaN(parseInt(prop.value)) || !isNaN(parseFloat(prop.value))) {
    return 'number'
  }

  return '...'
}

exports.getPropCategory = (prop) => path.parse(prop.filePath).name

exports.sortProps = (props) => {
  return props.sort((a, b) => {
    if (a.name < b.name) {
      return -1
    }
    if (a.name > b.name) {
      return 1
    }

    return 0
  })
}
