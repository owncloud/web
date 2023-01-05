import { useRouter } from 'web-pkg/src/composables'
import VueRouter from 'vue-router'
import { createRouter, getComposableWrapper } from 'web-test-helpers'

describe('useRouter', () => {
  // FIXME
  it.skip('should be valid', () => {
    expect(useRouter).toBeDefined()
    const router = createRouter()
    const mocks = { $router: router }
    getComposableWrapper(
      () => {
        expect(useRouter()).toBeInstanceOf(VueRouter)
      },
      { mocks }
    )
  })
})
