import DriveRedirect from '../../../../src/views/spaces/DriveRedirect.vue'
import { mock } from 'jest-mock-extended'
import {
  createStore,
  defaultPlugins,
  mount,
  defaultStoreMockOptions,
  defaultComponentMocks,
  defaultStubs,
  RouteLocation
} from 'web-test-helpers'

describe('DriveRedirect view', () => {
  it('redirects to "projects" route if no personal space exist', () => {
    const { mocks } = getMountedWrapper()
    expect(mocks.$router.replace).toHaveBeenCalledWith({
      name: 'files-spaces-projects'
    })
  })
})

function getMountedWrapper({ currentRouteName = 'files-spaces-generic' } = {}) {
  const mocks = {
    ...defaultComponentMocks({ currentRoute: mock<RouteLocation>({ name: currentRouteName }) })
  }
  const storeOptions = { ...defaultStoreMockOptions }
  const store = createStore(storeOptions)
  return {
    storeOptions,
    mocks,
    wrapper: mount(DriveRedirect, {
      global: {
        plugins: [...defaultPlugins(), store],
        stubs: defaultStubs,
        mocks,
        provide: mocks
      }
    })
  }
}
