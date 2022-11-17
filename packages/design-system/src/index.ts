import { getSizeClass } from './utils/sizeClasses.js'
import './utils/webFontLoader.js'

import * as components from './components'
import * as directives from './directives'

const initializeCustomProps = (tokens = [], prefix) => {
  for (const param in tokens) {
    ;(document.querySelector(':root') as HTMLElement).style.setProperty(
      '--oc-' + prefix + param,
      tokens[param]
    )
  }
}

export default {
  install(Vue, options: any = {}) {
    const themeOptions = options.tokens
    initializeCustomProps(themeOptions?.breakpoints, 'breakpoint-')
    initializeCustomProps(themeOptions?.colorPalette, 'color-')
    initializeCustomProps(themeOptions?.fontSizes, 'font-size-')
    initializeCustomProps(themeOptions?.sizes, 'size-')
    initializeCustomProps(themeOptions?.spacing, 'space-')

    Object.values(components).forEach((c) => Vue.component(c.name, c))
    Object.values(directives).forEach((d) => Vue.directive(d.name, d))
  }
}

export const utils = { getSizeClass }
export * as components from './components'
export * as composables from './composables'
export * as directives from './directives'
export * as helpers from './helpers'
export * as mixins from './mixins'
