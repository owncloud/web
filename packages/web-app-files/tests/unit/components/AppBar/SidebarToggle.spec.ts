import { mount } from '@vue/test-utils'
import SidebarToggle from '../../../../src/components/AppBar/SidebarToggle.vue'
import Vuex from 'vuex'
import { defaultLocalVue } from 'web-test-helpers/src/localVue/defaultLocalVue'
import { defaultStoreMockOptions } from 'web-test-helpers/src/mocks/store/defaultStoreMockOptions'
import { defaultComponentMocks } from 'web-test-helpers/src/mocks/defaultComponentMocks'
import { eventBus } from 'web-pkg'

const localVue = defaultLocalVue()
const selectors = {
  toggleSidebarBtn: '#files-toggle-sidebar'
}

describe('SidebarToggle component', () => {
  it.each([true, false])(
    'should show the "Toggle sidebar"-button with sidebar opened and closed',
    (sideBarOpen) => {
      const { wrapper } = getWrapper({ sideBarOpen })
      expect(wrapper.find(selectors.toggleSidebarBtn).exists()).toBeTruthy()
      expect(wrapper).toMatchSnapshot()
    }
  )
  it('publishes the toggle-event to the sidebar on click', async () => {
    const { wrapper } = getWrapper()
    const eventSpy = jest.spyOn(eventBus, 'publish')
    await wrapper.find(selectors.toggleSidebarBtn).trigger('click')
    expect(eventSpy).toHaveBeenCalled()
  })
})

function getWrapper({ sideBarOpen = false } = {}) {
  const storeOptions = { ...defaultStoreMockOptions }
  const store = new Vuex.Store(storeOptions)
  const mocks = defaultComponentMocks()
  return {
    storeOptions,
    mocks,
    wrapper: mount(SidebarToggle, {
      localVue,
      mocks,
      store,
      propsData: { sideBarOpen }
    })
  }
}
