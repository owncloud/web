import DriveRedirect from '../../../../src/views/spaces/DriveRedirect.vue'
import { mock } from 'vitest-mock-extended'
import {
  defaultPlugins,
  mount,
  defaultComponentMocks,
  defaultStubs,
  RouteLocation
} from '@ownclouders/web-test-helpers'

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

  return {
    mocks,
    wrapper: mount(DriveRedirect, {
      global: {
        plugins: [...defaultPlugins()],
        stubs: defaultStubs,
        mocks,
        provide: mocks
      }
    })
  }
}
