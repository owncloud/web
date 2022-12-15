import { useRouter } from 'web-pkg/src/composables'
import VueRouter from 'vue-router'
import { getComposableWrapper } from 'web-test-helpers'

describe('useRouter', () => {
  it('should be valid', () => {
    expect(useRouter).toBeDefined()
    const router = new VueRouter()
    const mocks = { $router: router }
    getComposableWrapper(
      () => {
        expect(useRouter()).toBeInstanceOf(VueRouter)
      },
      { mocks }
    )
  })
})
