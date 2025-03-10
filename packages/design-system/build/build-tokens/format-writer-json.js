import tinyColor from 'tinycolor2'
import { getPropType, sortProps, getPropCategory } from './utils'

export default {
  name: 'format/ods/json',
  formatter: (dictionary) => {
    const attributes = sortProps(dictionary.allProperties).reduce((acc, cur) => {
      const prop = {
        value: cur.value,
        name: cur.name,
        type: getPropType(cur),
        category: getPropCategory(cur),
        info: {}
      }

      if (prop.type === 'color') {
        const color = tinyColor(cur.value)
        prop.info.hex = color.toHexString()
        prop.info.rgb = color.toRgbString()
        prop.info.hsl = color.toHslString()
        prop.info.hsv = color.toHsvString()
      }

      acc[cur.name] = prop

      return acc
    }, {})
    const data = [
      '{',
      Object.keys(attributes)
        .map((k) => `  "${k}": ${JSON.stringify(attributes[k])}`)
        .join(',\n'),
      '}'
    ].join('\n')

    return data
  }
}
