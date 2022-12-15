import Vuex from 'vuex'
import DesignSystem from '@ownclouders/design-system'
import GetTextPlugin from 'vue-gettext'
import AsyncComputed from 'vue-async-computed'

export interface DefaultPluginsOptions {
  designSystem?: boolean
  gettext?: boolean
  vuex?: boolean
  asyncComputed?: boolean
}

export const defaultPlugins = ({
  designSystem = true,
  gettext = true,
  vuex = true,
  asyncComputed = true
}: DefaultPluginsOptions = {}) => {
  const plugins = []

  if (designSystem) {
    plugins.push(DesignSystem)
  }

  if (gettext) {
    plugins.push([
      GetTextPlugin,
      {
        translations: 'does-not-matter.json',
        silent: true
      }
    ])
  }

  if (vuex) {
    plugins.push(Vuex)
  }

  if (asyncComputed) {
    plugins.push(AsyncComputed)
  }

  plugins.push({
    install(app) {
      // mock `v-translate` directive
      app.directive('translate', {
        inserted: () => undefined
      })
    }
  })

  return plugins
}
