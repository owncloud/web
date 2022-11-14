import Vuex from 'vuex'
import DesignSystem from 'owncloud-design-system'
import stubs from '../../../../../../tests/unit/stubs/index.js'
import { createLocalVue, mount, shallowMount } from '@vue/test-utils'
import NotFoundMessage from '../../../../src/components/FilesList/NotFoundMessage.vue'
import { createLocationPublic, createLocationSpaces } from '../../../../src/router'
import { PublicSpaceResource, SpaceResource, Resource } from 'web-client/src/helpers'
import { MockProxy, mock } from 'jest-mock-extended'
import { join } from 'path'

const localVue = createLocalVue()
localVue.use(DesignSystem)
localVue.use(Vuex)

const selectors = {
  homeButton: '#files-list-not-found-button-go-home',
  reloadLinkButton: '#files-list-not-found-button-reload-link'
}

const spacesLocation = createLocationSpaces('files-spaces-generic')
const publicLocation = createLocationPublic('files-public-link')

describe('NotFoundMessage', () => {
  describe('when user on personal route', () => {
    let space: MockProxy<SpaceResource>
    beforeEach(() => {
      space = mock<SpaceResource>({
        driveType: 'personal'
      })
    })

    it('should show home button', () => {
      const wrapper = getWrapper(space, spacesLocation)
      const homeButton = wrapper.find(selectors.homeButton)

      expect(homeButton.exists()).toBeTruthy()
      expect(homeButton.find('translate-stub')).toBeTruthy()
      expect(homeButton.find('translate-stub').text()).toBe('Go to »Personal« page')
    })

    it('should not show reload public link button', () => {
      const wrapper = getWrapper(space, spacesLocation)
      const reloadLinkButton = wrapper.find(selectors.reloadLinkButton)

      expect(reloadLinkButton.exists()).toBeFalsy()
    })

    it('should have property route to personal space', () => {
      const wrapper = getMountedWrapper(space, spacesLocation)
      const homeButton = wrapper.find(selectors.homeButton)

      expect(homeButton.props().to.name).toBe(spacesLocation.name)
      expect(homeButton.props().to.params.driveAliasAndItem).toBe('personal')
    })
  })

  describe('when user on public link route', () => {
    let space: MockProxy<PublicSpaceResource>
    beforeEach(() => {
      space = mock<PublicSpaceResource>({
        driveType: 'public'
      })
      space.getDriveAliasAndItem.mockImplementation((resource) =>
        join('public/1234', resource.path)
      )
    })

    it('should show reload link button', () => {
      const wrapper = getWrapper(space, publicLocation)
      const reloadLinkButton = wrapper.find(selectors.reloadLinkButton)

      expect(reloadLinkButton.exists()).toBeTruthy()
      expect(reloadLinkButton.find('translate-stub')).toBeTruthy()
      expect(reloadLinkButton.find('translate-stub').text()).toBe('Reload public link')
    })

    it('should not show home button', () => {
      const wrapper = getWrapper(space, publicLocation)
      const homeButton = wrapper.find(selectors.homeButton)

      expect(homeButton.exists()).toBeFalsy()
    })

    it('should have property route to files public list', () => {
      const wrapper = getMountedWrapper(space, publicLocation)
      const reloadLinkButton = wrapper.find(selectors.reloadLinkButton)

      expect(reloadLinkButton.props().to.name).toBe(publicLocation.name)
      expect(reloadLinkButton.props().to.params.driveAliasAndItem).toBe(
        space.getDriveAliasAndItem({ path: '' } as Resource)
      )
    })
  })
})

function getMountOpts(space, route) {
  return {
    localVue,
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
    },
    propsData: { space }
  }
}

function getMountedWrapper(space, route) {
  return mount(NotFoundMessage, {
    ...getMountOpts(space, route)
  })
}

function getWrapper(space, route) {
  return shallowMount(NotFoundMessage, {
    ...getMountOpts(space, route)
  })
}
