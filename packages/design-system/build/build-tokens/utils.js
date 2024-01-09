const path = require('path')
const { color } = require('style-value-types')

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
