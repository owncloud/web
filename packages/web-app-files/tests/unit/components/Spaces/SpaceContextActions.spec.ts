import SpaceContextActions from '../../../../src/components/Spaces/SpaceContextActions.vue'
import { buildSpace } from 'web-client/src/helpers'
import { createStore, defaultComponentMocks, defaultPlugins, mount } from 'web-test-helpers'
import { defaultStoreMockOptions } from 'web-test-helpers/src/mocks/store/defaultStoreMockOptions'

const spaceMock = {
  id: '1',
  root: { permissions: [{ roles: ['manager'], grantedTo: [{ user: { id: 1 } }] }] }
}

describe('SpaceContextActions', () => {
  describe('action handlers', () => {
    it('renders actions that are always available: "Members", "Deleted files", "Details"', () => {
      const { wrapper } = getWrapper(buildSpace(spaceMock))
      expect(wrapper).toMatchSnapshot()
    })
  })
})

function getWrapper(space) {
  const store = createStore(defaultStoreMockOptions)
  return {
    wrapper: mount(SpaceContextActions, {
      props: {
        items: [space],
        space: space
      },
      global: {
        mocks: {
          ...defaultComponentMocks({ currentRoute: { path: '/files' } })
        },
        plugins: [...defaultPlugins(), store]
      }
    })
  }
}
