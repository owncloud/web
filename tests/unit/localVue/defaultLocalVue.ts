import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import DesignSystem from 'owncloud-design-system'
import VueCompositionAPI from '@vue/composition-api'
import GetTextPlugin from 'vue-gettext'
import { isUndefined } from 'lodash-es'

export interface LocalVueOptions {
  compositionApi?: boolean
  designSystem?: boolean
  gettext?: boolean
  vuex?: boolean
}

export const defaultLocalVue = (options: LocalVueOptions = {}) => {
  const localVue = createLocalVue()

  const useCompositionApi = isUndefined(options.compositionApi) ? true : options.compositionApi
  if (useCompositionApi) {
    localVue.use(VueCompositionAPI)
  }

  const useDesignSystem = isUndefined(options.designSystem) ? true : options.designSystem
  if (useDesignSystem) {
    localVue.use(DesignSystem)
  }

  const useGetText = isUndefined(options.gettext) ? true : options.gettext
  if (useGetText) {
    localVue.use(GetTextPlugin, {
      translations: 'does-not-matter.json',
      silent: true
    })
  }

  const useVuex = isUndefined(options.vuex) ? true : options.vuex
  if (useVuex) {
    localVue.use(Vuex)
  }

  // mock `v-translate` directive
  localVue.directive('translate', {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    inserted: () => {}
  })
  return localVue
}
