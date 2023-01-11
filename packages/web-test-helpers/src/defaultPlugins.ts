import DesignSystem from '@ownclouders/design-system'
import GetTextPlugin from 'vue-gettext'
import Vue from 'vue'
;(window as any).Vue = Vue

export interface DefaultPluginsOptions {
  designSystem?: boolean
  gettext?: boolean
}

export const defaultPlugins = ({
  designSystem = true,
  gettext = true
}: DefaultPluginsOptions = {}) => {
  const plugins = []

  if (designSystem) {
    plugins.push(DesignSystem)
  }

  if (gettext) {
    plugins.push({
      install(app) {
        Vue.use(GetTextPlugin as any, {
          translations: 'does-not-matter.json',
          silent: true
        })
        ;(Vue.config as any).language = 'en'
        app.config.globalProperties.$language = { current: 'en' }
        app.config.globalProperties.$gettext = Vue.prototype.$gettext
        app.config.globalProperties.$gettextInterpolate = Vue.prototype.$gettextInterpolate
        app.config.globalProperties.$ngettext = Vue.prototype.$ngettext
        app.config.globalProperties.$pgettext = Vue.prototype.$pgettext
      }
    })
  } else {
    plugins.push({
      install(app) {
        // mock `v-translate` directive
        app.directive('translate', {
          inserted: () => undefined
        })
      }
    })
  }

  return plugins
}
