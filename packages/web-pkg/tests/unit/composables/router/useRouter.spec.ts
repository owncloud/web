import { useRouter } from 'web-pkg/src/composables'
import { createWrapper } from './spec'
import VueRouter from 'vue-router'

describe('useRouter', () => {
  it('should be valid', () => {
    expect(useRouter).toBeDefined()

    createWrapper(
      () => {
        expect(useRouter()).toBeInstanceOf(VueRouter)
      },
      { router: new VueRouter() }
    )
  })
})
