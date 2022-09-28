import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import DesignSystem from 'owncloud-design-system'
import VueCompositionAPI from '@vue/composition-api'
import GetTextPlugin from 'vue-gettext'

export const defaultLocalVueViews = ({ compositionApi = true }: { compositionApi: boolean }) => {
  const localVue = createLocalVue()
  localVue.use(Vuex)
  localVue.use(DesignSystem)
  if (compositionApi) {
    localVue.use(VueCompositionAPI)
  }
  /*
   * TODO: options on GetTextPlugin do not have any effect because of
   * packages/web-app-files/src/gettext.js which overwrites every setting.
   */
  localVue.use(GetTextPlugin, {
    translations: 'does-not-matter.json',
    silent: true
  })
  // mock `v-translate` directive
  localVue.directive('translate', {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    inserted: () => {}
  })
  return localVue
}
