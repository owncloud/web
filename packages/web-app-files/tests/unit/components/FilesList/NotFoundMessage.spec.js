import Vuex from 'vuex'
import CompositionAPI from '@vue/composition-api'
import DesignSystem from 'owncloud-design-system'
import stubs from '../../../../../../tests/unit/stubs/index.js'
import { createLocalVue, mount, shallowMount } from '@vue/test-utils'
import NotFoundMessage from '../../../../src/components/FilesList/NotFoundMessage.vue'
import { createLocationPublic, createLocationSpaces } from '../../../../src/router'

const localVue = createLocalVue()
localVue.use(CompositionAPI)
localVue.use(DesignSystem)
localVue.use(Vuex)

const selectors = {
  homeButton: '#files-list-not-found-button-go-home',
  reloadLinkButton: '#files-list-not-found-button-reload-link'
}

const spacesLocation = createLocationSpaces('files-spaces-personal-home')

const store = new Vuex.Store({
  getters: {
    homeFolder: () => {
      return 'home'
    }
  }
})

describe('NotFoundMessage', () => {
  describe('when user on personal route', () => {
    const wrapper = getWrapper(spacesLocation)

    it('should show home button', () => {
      const homeButton = wrapper.find(selectors.homeButton)

      expect(homeButton.exists()).toBeTruthy()
      expect(homeButton.find('translate-stub')).toBeTruthy()
      expect(homeButton.find('translate-stub').text()).toBe('Go to »Personal« page')
    })

    it('should not show reload public link button', () => {
      const reloadLinkButton = wrapper.find(selectors.reloadLinkButton)

      expect(reloadLinkButton.exists()).toBeFalsy()
    })

    it('should have property route to home', () => {
      const wrapper = getMountedWrapper(spacesLocation)
      const homeButton = wrapper.find(selectors.homeButton)

      expect(homeButton.props().to.name).toBe(spacesLocation.name)
      expect(homeButton.props().to.params.item).toBe('home')
    })
  })

  describe('when user on public link route', () => {
    const wrapper = getWrapper(publicLocation('parent'))

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
      const location = publicLocation('parent/sub')
      const wrapper = getMountedWrapper(location)
      const reloadLinkButton = wrapper.find(selectors.reloadLinkButton)

      expect(reloadLinkButton.props().to.name).toBe(location.name)
      expect(reloadLinkButton.props().to.params.item).toBe('parent')
    })
  })
})

function publicLocation(item) {
  return createLocationPublic('files-public-files', {
    params: {
      item: item
    }
  })
}

function getMountOpts(route) {
  return {
    localVue,
    store: store,
    stubs: stubs,
    mocks: {
      $route: route,
      $router: {
        resolve: (r) => {
          return {
            href: r.name
          }
        },
        currentRoute: route
      }
    }
  }
}

function getMountedWrapper(route) {
  return mount(NotFoundMessage, {
    ...getMountOpts(route)
  })
}

function getWrapper(route) {
  return shallowMount(NotFoundMessage, {
    ...getMountOpts(route)
  })
}
