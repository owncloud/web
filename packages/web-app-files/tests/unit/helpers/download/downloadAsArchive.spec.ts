import {
  isDownloadAsArchiveAvailable,
  triggerDownloadAsArchive
} from '../../../../src/helpers/download/downloadAsArchive'
import { ArchiverService } from '../../../../src/services'
import { RuntimeError } from 'web-runtime/src/container/error'

const serverUrl = 'https://demo.owncloud.com'
const archiverCapability = {
  enabled: true,
  version: 'v2.3.5',
  formats: [],
  archiver_url: '/archiver'
}

describe('downloadAsArchive', () => {
  describe('triggerDownloadAsArchive', () => {
    let archiverService
    beforeEach(() => {
      archiverService = new ArchiverService()
    })
    it('fails with a runtime error if archiver unavailable', async () => {
      const downloadPromise = triggerDownloadAsArchive({
        fileIds: [],
        archiverService
      })
      await expect(downloadPromise).rejects.toThrow(
        new RuntimeError('no archiver capability available')
      )
    })
    it('fails with a runtime error if no fileIds provided', async () => {
      archiverService.initialize(serverUrl, [archiverCapability])
      const downloadPromise = triggerDownloadAsArchive({
        fileIds: [],
        archiverService
      })
      await expect(downloadPromise).rejects.toThrow(
        new RuntimeError('requested archive with empty list of resources')
      )
    })
  })

  describe('isDownloadAsArchiveAvailable', () => {
    describe('wraps if archiverService is available', () => {
      it('returns false if archiverService unavailable', () => {
        expect(isDownloadAsArchiveAvailable(new ArchiverService())).toBe(false)
      })
      it('returns true if archiverService available', () => {
        const service = new ArchiverService()
        service.initialize(serverUrl, [archiverCapability])
        expect(isDownloadAsArchiveAvailable(service)).toBe(true)
      })
    })
  })
})
