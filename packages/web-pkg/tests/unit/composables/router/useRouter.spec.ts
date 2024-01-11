import { useRouter } from '../../../../src/composables/router'
import { createRouter, getComposableWrapper } from 'web-test-helpers'

// eslint-disable-next-line jest/no-disabled-tests
describe.skip('useRouter', () => {
  // FIXME
  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('should be valid', () => {
    expect(useRouter).toBeDefined()
    const router = createRouter()
    const mocks = { $router: router }
    getComposableWrapper(
      () => {
        // FIXME: Router is just a type, so we can't do a runtime check
        // hopefully we can just get rid of our own useRouter composable
        // expect(useRouter()).toBeInstanceOf(Router)
      },
      { mocks }
    )
  })
})
