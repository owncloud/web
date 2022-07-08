import { createLocalVue, mount } from '@vue/test-utils'
import GetTextPlugin from 'vue-gettext'
import Vuex from 'vuex'
import DesignSystem from 'owncloud-design-system'
import SharesPanel from '@files/src/components/SideBar/Shares/SharesPanel.vue'

const localVue = createLocalVue()
localVue.use(DesignSystem)
localVue.use(Vuex)
localVue.use(GetTextPlugin, {
  translations: 'does-not-matter.json',
  silent: true
})

jest.mock('web-pkg/src/composables/reactivity')
describe('SharesPanel', () => {
  it('reloads shares if highlighted file is changed', async () => {
    const spyOnReloadShares = jest.spyOn(SharesPanel.methods, '$_reloadShares').mockImplementation()
    const wrapper = mount(SharesPanel, {
      localVue,
      store: new Vuex.Store({
        modules: {
          Files: {
            namespaced: true,
            state: {
              highlightedFile: { name: '1' }
            },
            getters: {
              highlightedFile: (state) => {
                return state.highlightedFile
              }
            },
            mutations: {
              SET_HIGHLIGHTED_FILE(state, file) {
                state.highlightedFile = file
              }
            }
          }
        }
      }),
      stubs: {
        'file-shares': true
      }
    })
    wrapper.vm.$store.commit('Files/SET_HIGHLIGHTED_FILE', { name: '2' })
    await wrapper.vm.$nextTick()
    expect(spyOnReloadShares).toHaveBeenCalledTimes(2)
  })
})
