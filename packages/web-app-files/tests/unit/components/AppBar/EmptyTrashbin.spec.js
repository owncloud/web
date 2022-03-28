import { createLocalVue, shallowMount } from '@vue/test-utils'
import EmptyTrashbin from '../../../../src/components/AppBar/EmptyTrashbin.vue'
import Files from '@/__fixtures__/files'
import VueRouter from 'vue-router'
import Vuex from 'vuex'
import DesignSystem from 'owncloud-design-system'

const localVue = createLocalVue()
localVue.use(VueRouter)
localVue.use(DesignSystem)
localVue.use(Vuex)

describe('EmptyTrashbin component', () => {
  it('should render action-menu-item if no resources are selected', () => {
    const wrapper = getMountedWrapper()
    expect(wrapper).toMatchSnapshot()
  })

  it('should render action-menu-item for multiple selected resources', () => {
    const wrapper = getMountedWrapper([Files['/'][1], Files['/'][4]])
    expect(wrapper).toMatchSnapshot()
  })
})

function getMountedWrapper(selection = []) {
  return shallowMount(EmptyTrashbin, {
    localVue,
    store: new Vuex.Store({
      modules: {
        Files: {
          namespaced: true,
          getters: {
            selectedFiles: () => selection
          }
        }
      }
    }),
    stubs: {
      translate: true
    }
  })
}
