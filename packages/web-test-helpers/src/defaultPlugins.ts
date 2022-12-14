import Vuex from 'vuex'
import DesignSystem from 'owncloud-design-system'
import VueCompositionAPI from '@vue/composition-api'
import GetTextPlugin from 'vue-gettext'
import AsyncComputed from 'vue-async-computed'

export interface DefaultPluginsOptions {
  compositionApi?: boolean
  designSystem?: boolean
  gettext?: boolean
  vuex?: boolean
  asyncComputed?: boolean
}

export const defaultPlugins = ({
  compositionApi = true,
  designSystem = true,
  gettext = true,
  vuex = true,
  asyncComputed = true
}: DefaultPluginsOptions = {}) => {
  const plugins = []

  if (compositionApi) {
    plugins.push(VueCompositionAPI)
  }

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
