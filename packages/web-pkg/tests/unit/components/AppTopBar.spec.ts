import { mock } from 'jest-mock-extended'
import {
  RouteLocation,
  createStore,
  defaultComponentMocks,
  defaultPlugins,
  defaultStoreMockOptions,
  shallowMount
} from 'web-test-helpers'
import { Resource } from '@ownclouders/web-client/src/helpers'
import AppTopBar from '../../../src/components/AppTopBar.vue'
import { Action } from '../../../src/composables/actions'
import { ConfigurationManager } from '../../../types'

jest.mock('../../../src/composables/configuration/useConfigurationManager', () => ({
  useConfigurationManager: () =>
    mock<ConfigurationManager>({
      options: {
        routing: {
          fullShareOwnerPaths: false
        }
      }
    })
}))

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
  })
})

function getWrapper(
  resource: Resource = null,
  dropDownActions: Action[] = [],
  mainActions: Action[] = []
) {
  const storeOptions = { ...defaultStoreMockOptions }
  const store = createStore(storeOptions)
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
        plugins: [...defaultPlugins(), store],
        mocks,
        provide: mocks
      }
    })
  }
}
