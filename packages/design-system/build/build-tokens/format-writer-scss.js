import { sortProps } from './utils'

export default {
  name: 'format/ods/scss',
  formatter: (dictionary) => {
    const props = sortProps(dictionary.allProperties)
    const data = [
      ...props.map((p) => `$${p.name}: ${p.value};`),
      '',
      ':host, :root {',
      ...props.map((p) => `  --${p.name}: #{$${p.name}};`),
      '}',
      ''
    ].join('\n')

    return data
  }
}
