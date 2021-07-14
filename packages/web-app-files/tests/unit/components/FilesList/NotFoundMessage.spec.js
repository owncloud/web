import Vuex from 'vuex'
import DesignSystem from 'owncloud-design-system'
import stubs from '../../../../../../tests/unit/stubs/index.js'
import { createLocalVue, mount, shallowMount } from '@vue/test-utils'
import NotFoundMessage from '../../../../src/components/FilesList/NotFoundMessage.vue'

const localVue = createLocalVue()
localVue.use(DesignSystem)
localVue.use(Vuex)

const selectors = {
  homeButton: '#files-list-not-found-button-go-home',
  reloadLinkButton: '#files-list-not-found-button-reload-link'
}

const filesPersonalRoute = { name: 'files-personal' }

function publicLinkRoute(item) {
  return {
    name: 'files-public-list',
    params: {
      item: item
    }
  }
}

const store = new Vuex.Store({
  getters: {
    homeFolder: () => {
      return 'home'
    }
  }
})

function getWrapper(route) {
  return shallowMount(NotFoundMessage, {
    localVue,
    store: store,
    stubs: stubs,
    mocks: {
      $route: route
    }
  })
}

function getMountedWrapper(route) {
  return mount(NotFoundMessage, {
    localVue,
    store: store,
    stubs: stubs,
    mocks: {
      $route: route
    }
  })
}

describe('NotFoundMessage', () => {
  describe('when user on personal route', () => {
    const wrapper = getWrapper(filesPersonalRoute)

    it('should show home button', () => {
      const homeButton = wrapper.find(selectors.homeButton)

      expect(homeButton.exists()).toBeTruthy()
      expect(homeButton.find('translate-stub')).toBeTruthy()
      expect(homeButton.find('translate-stub').text()).toBe('Go to »All files«')
    })

    it('should not show reload public link button', () => {
      const reloadLinkButton = wrapper.find(selectors.reloadLinkButton)

      expect(reloadLinkButton.exists()).toBeFalsy()
    })

    it('should have property route to home', () => {
      const wrapper = getMountedWrapper(filesPersonalRoute)
      const homeButton = wrapper.find(selectors.homeButton)

      expect(homeButton.props().to.name).toBe('files-personal')
      expect(homeButton.props().to.params.item).toBe('home')
    })
  })

  describe('when user on public link route', () => {
    const wrapper = getWrapper(publicLinkRoute('parent'))

    it('should show reload link button', () => {
      const reloadLinkButton = wrapper.find(selectors.reloadLinkButton)

      expect(reloadLinkButton.exists()).toBeTruthy()
      expect(reloadLinkButton.find('translate-stub')).toBeTruthy()
      expect(reloadLinkButton.find('translate-stub').text()).toBe('Reload public link')
    })

    it('should not show home button', () => {
      const homeButton = wrapper.find(selectors.homeButton)

      expect(homeButton.exists()).toBeFalsy()
    })

    it('should have property route to files public list', () => {
      const wrapper = getMountedWrapper(publicLinkRoute('parent/sub'))
      const reloadLinkButton = wrapper.find(selectors.reloadLinkButton)

      expect(reloadLinkButton.props().to.name).toBe('files-public-list')
      expect(reloadLinkButton.props().to.params.item).toBe('parent')
    })
  })
})
