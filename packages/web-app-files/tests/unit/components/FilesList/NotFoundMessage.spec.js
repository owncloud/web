import NotFoundMessage from '../../../../src/components/FilesList/NotFoundMessage.vue'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'
import stubs from '../../../../../../tests/unit/stubs/index.js'

const localVue = createLocalVue()
localVue.use(Vuex)

const store = new Vuex.Store({
  getters: {
    homeFolder: () => {
      return 'home'
    }
  }
})

describe('NotFoundMessage', () => {
  function getWrapper(
    route = {
      name: 'files-personal'
    }
  ) {
    return shallowMount(NotFoundMessage, {
      localVue,
      store: store,
      stubs: stubs,
      mocks: {
        $route: route
      }
    })
  }

  const selectors = {
    homeButton: '#files-list-not-found-button-go-home',
    reloadLinkButton: '#files-list-not-found-button-reload-link'
  }

  describe('when user on personal route', () => {
    const wrapper = getWrapper()

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
  })

  describe('when user on public link route', () => {
    const wrapper = getWrapper({
      name: 'files-public-list',
      params: {
        item: 'abc'
      }
    })

    it('should show reload link button', () => {
      const reloadLinkButton = wrapper.find(selectors.reloadLinkButton)

      expect(reloadLinkButton.exists()).toBeTruthy()
      expect(reloadLinkButton.find('translate-stub')).toBeTruthy()
      expect(reloadLinkButton.find('translate-stub').text()).toBe('Reload public link')
    })

    it('should not show home button', () => {
      const reloadLinkButton = wrapper.find(selectors.homeButton)

      expect(reloadLinkButton.exists()).toBeFalsy()
    })
  })
})
