import { useRouter } from '@ownclouders/web-pkg/src/composables'
import { createRouter, getComposableWrapper } from 'web-test-helpers'

describe.skip('useRouter', () => {
  // FIXME
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
