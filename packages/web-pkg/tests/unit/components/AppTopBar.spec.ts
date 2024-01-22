import { mock } from 'jest-mock-extended'
import {
  RouteLocation,
  defaultComponentMocks,
  defaultPlugins,
  shallowMount
} from 'web-test-helpers'
import { Resource } from '@ownclouders/web-client/src/helpers'
import AppTopBar from '../../../src/components/AppTopBar.vue'
import { Action } from '../../../src/composables/actions'

describe('AppTopBar', () => {
  describe('if no resource is present', () => {
    it('renders only a close button', () => {
      const { wrapper } = getWrapper(mock<Resource>({ path: '/test.txt', shareRoot: '/test' }))
      expect(wrapper.html()).toMatchSnapshot()
    })
  })
  describe('if a resource is present', () => {
    it('renders a resource and no actions (if none given) and a close button', () => {
      const { wrapper } = getWrapper(mock<Resource>({ path: '/test.txt', shareRoot: '/test' }))
      expect(wrapper.html()).toMatchSnapshot()
    })

    it('renders a resource and mainActions (if given) and a close button', () => {
      const { wrapper } = getWrapper(
        mock<Resource>({ path: '/test.txt', shareRoot: '/test' }),
        [],
        [mock<Action>()]
      )
      expect(wrapper.html()).toMatchSnapshot()
    })

    it('renders a resource and dropdownActions (if given) and a close button', () => {
      const { wrapper } = getWrapper(
        mock<Resource>({ path: '/test.txt', shareRoot: '/test' }),
        [mock<Action>()],
        []
      )
      expect(wrapper.html()).toMatchSnapshot()
    })
    it('renders a resource and dropdownActions as well as mainActions (if both are passed) and a close button', () => {
      const { wrapper } = getWrapper(
        mock<Resource>({ path: '/test.txt', shareRoot: '/test' }),
        [mock<Action>()],
        [mock<Action>()]
      )
      expect(wrapper.html()).toMatchSnapshot()
    })
    it('renders a resource without file extension if areFileExtensionsShown is set to false', () => {
      const { wrapper } = getWrapper(
        mock<Resource>({ path: '/test.txt', shareRoot: '/test' }),
        [mock<Action>()],
        [mock<Action>()],
        false
      )

      expect(wrapper.html()).toMatchSnapshot()
    })
  })
})

function getWrapper(
  resource: Resource = null,
  dropDownActions: Action[] = [],
  mainActions: Action[] = [],
  areFileExtensionsShown = true
) {
  const mocks = defaultComponentMocks({
    currentRoute: mock<RouteLocation>({ name: 'admin-settings-general' })
  })
  return {
    wrapper: shallowMount(AppTopBar, {
      props: {
        dropDownActions,
        mainActions,
        resource
      },
      global: {
        plugins: [
          ...defaultPlugins({ piniaOptions: { resourcesStore: { areFileExtensionsShown } } })
        ],
        mocks,
        provide: mocks
      }
    })
  }
}
