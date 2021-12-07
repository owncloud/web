import { accentuatesTableRowTest } from './views.shared'
import PublicFiles from '@files/src/views/PublicFiles.vue'
import { localVue } from './views.setup'

/**
 * FixMe:
 * localVue is shared, no isolated testing is happening.
 * if VueRouter is applied multipleTimes it fails (as expected).
 * as temporary workaround apply it here too.
 *
 * create a localVue factory to guarantee isolation
 */
import VueRouter from 'vue-router'
localVue.use(VueRouter)

describe('PublicFiles view', () => {
  describe('accentuate new files and folders', () => {
    // eslint-disable-next-line jest/expect-expect
    it('accentuates table row for new files, folders and versions [Files/UPSERT_RESOURCE]', async () => {
      await accentuatesTableRowTest(PublicFiles)
    })
  })
})
