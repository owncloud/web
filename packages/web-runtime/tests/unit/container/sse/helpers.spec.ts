import { Resource, SpaceResource } from '@ownclouders/web-client'
import { createTestingPinia } from 'web-test-helpers'
import { useResourcesStore } from '@ownclouders/web-pkg/src'
import { mock } from 'vitest-mock-extended'
import { isItemInCurrentFolder, sseEventWrapper } from '../../../../src/container/sse'

describe('helpers', () => {
  describe('method "sseEventWrapper"', () => {
    it('calls "console.debug" when executed', () => {
      console.debug = vi.fn()
      const topic = 'folder-created'
      const msg = { data: JSON.stringify({ itemid: 'newfolder' }) }
      sseEventWrapper({
        msg,
        topic,
        method: () => {}
      })
      expect(console.debug).toHaveBeenCalledWith(`SSE event '${topic}'`, { itemid: 'newfolder' })
    })
    it('calls "console.error" when error was thrown', () => {
      console.error = vi.fn()
      const topic = 'folder-created'
      const msg = { data: JSON.stringify({ itemid: 'newfolder' }) }
      const error = new Error('processing failed')
      sseEventWrapper({
        msg,
        topic,
        method: () => {
          throw error
        }
      })
      expect(console.error).toHaveBeenCalledWith(`Unable to process sse event ${topic}`, error)
    })
  })
  describe('method "isItemInCurrentFolder"', () => {
    it('returns "true" when item is in current folder', () => {
      const mocks = getMocks()
      expect(
        isItemInCurrentFolder({
          resourcesStore: mocks.resourcesStore,
          parentFolderId: 'currenFolder!currentFolder'
        })
      ).toBeTruthy()
    })
    it('returns "false" when item is not in current folder', () => {
      const mocks = getMocks()
      expect(
        isItemInCurrentFolder({
          resourcesStore: mocks.resourcesStore,
          parentFolderId: 'differentFolder!differentFolder'
        })
      ).toBeFalsy()
    })
    describe('current folder is space', () => {
      it('returns "true" when item is in current folder', () => {
        const mocks = getMocks({
          currentFolder: mock<SpaceResource>({
            id: 'bbf8b91f-54be-45f0-935e-a50c4922db21$c96eb07d-54a5-47bf-8402-64ad9a007797'
          })
        })
        expect(
          isItemInCurrentFolder({
            resourcesStore: mocks.resourcesStore,
            parentFolderId:
              'bbf8b91f-54be-45f0-935e-a50c4922db21$c96eb07d-54a5-47bf-8402-64ad9a007797!c96eb07d-54a5-47bf-8402-64ad9a007797'
          })
        ).toBeTruthy()
      })
      it('returns "false" when item is not in current folder', () => {
        const mocks = getMocks({
          currentFolder: mock<SpaceResource>({
            id: 'bbf8b91f-54be-45f0-935e-a50c4922db21$c96eb07d-54a5-47bf-8402-64ad9a007797'
          })
        })
        expect(
          isItemInCurrentFolder({
            resourcesStore: mocks.resourcesStore,
            parentFolderId: 'differentFolder!differentFolder'
          })
        ).toBeFalsy()
      })
    })
  })
})

const getMocks = ({
  currentFolder = mock<Resource>({
    id: 'currenFolder!currentFolder',
    isFolder: true,
    storageId: 'space1'
  })
} = {}) => {
  createTestingPinia()
  const resourcesStore = useResourcesStore()
  resourcesStore.currentFolder = currentFolder

  return {
    resourcesStore
  }
}
