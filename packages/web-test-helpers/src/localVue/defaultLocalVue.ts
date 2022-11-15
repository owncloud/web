import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import DesignSystem from 'owncloud-design-system'
import GetTextPlugin from 'vue-gettext'

export interface LocalVueOptions {
  designSystem?: boolean
  gettext?: boolean
  vuex?: boolean
}

export const defaultLocalVue = ({
  designSystem = true,
  gettext = true,
  vuex = true
}: LocalVueOptions = {}) => {
  const localVue = createLocalVue()

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
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    inserted: () => {}
  })
  return localVue
}
