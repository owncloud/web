import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import DesignSystem from 'owncloud-design-system'
import VueCompositionAPI from '@vue/composition-api'
import GetTextPlugin from 'vue-gettext'

export interface LocalVueOptions {
  compositionApi?: boolean
  designSystem?: boolean
  gettext?: boolean
  vuex?: boolean
}

export const defaultLocalVue = ({
  compositionApi = true,
  designSystem = true,
  gettext = true,
  vuex = true
}: LocalVueOptions = {}) => {
  const localVue = createLocalVue()

  if (compositionApi) {
    localVue.use(VueCompositionAPI)
  }

  if (designSystem) {
    localVue.use(DesignSystem)
  }

  if (gettext) {
    localVue.use(GetTextPlugin, {
      translations: 'does-not-matter.json',
      silent: true
    })
  }

  if (vuex) {
    localVue.use(Vuex)
  }

  // mock `v-translate` directive
  localVue.directive('translate', {
    inserted: () => undefined
  })

  return localVue
}
