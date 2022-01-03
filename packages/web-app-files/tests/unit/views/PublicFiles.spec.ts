import { accentuatesTableRowTest } from './views.shared'
import PublicFiles from '@files/src/views/PublicFiles.vue'
import { localVue } from './views.setup'

describe('PublicFiles view', () => {
  describe('accentuate new files and folders', () => {
    // eslint-disable-next-line jest/expect-expect
    it('accentuates table row for new files, folders and versions [Files/UPSERT_RESOURCE]', async () => {
      await accentuatesTableRowTest(PublicFiles)
    })
  })
})
