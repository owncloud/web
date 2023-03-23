import { ThumbnailCapability, ThumbnailService } from '../../../src/services'
import { mock } from 'jest-mock-extended'

const getThumbnailServiceInstance = ({ supportedMimeTypes = [], version = undefined } = {}) => {
  const thumbnailCapability = mock<ThumbnailCapability>({ supportedMimeTypes, version })
  return new ThumbnailService(thumbnailCapability)
}

describe('ThumbnailService', () => {
  describe('availability', () => {
    it('is unavailable if no version given via capabilities', () => {
      expect(getThumbnailServiceInstance({ version: undefined }).available).toBe(false)
    })
    it('is available if a version is given via capabilities', () => {
      expect(getThumbnailServiceInstance({ version: '1' }).available).toBe(true)
    })
  })
  describe('method "isMimetypeSupported"', () => {
    it('should return true if mimeType is supported', () => {
      const supportedMimeTypes = ['image/png']
      const thumbnailServiceMock = getThumbnailServiceInstance({ supportedMimeTypes })
      expect(thumbnailServiceMock.isMimetypeSupported(supportedMimeTypes[0])).toBe(true)
    })
    it('should return true if no specific supported mimeTypes given', () => {
      const thumbnailServiceMock = getThumbnailServiceInstance()
      expect(thumbnailServiceMock.isMimetypeSupported('image/png')).toBe(true)
    })
    it('should return false if mimeType is not supported', () => {
      const supportedMimeTypes = ['image/png']
      const thumbnailServiceMock = getThumbnailServiceInstance({ supportedMimeTypes })
      expect(thumbnailServiceMock.isMimetypeSupported('image/jpeg')).toBe(false)
    })
  })
  describe('method "getSupportedMimeTypes"', () => {
    it('reads the supported mime types from the capabilities', () => {
      const supportedMimeTypes = ['image/png']
      const thumbnailServiceMock = getThumbnailServiceInstance({ supportedMimeTypes })
      expect(thumbnailServiceMock.getSupportedMimeTypes()).toEqual(supportedMimeTypes)
    })
    it('filters the supported mime types from the capabilities', () => {
      const supportedMimeTypes = ['image/png', 'text/plain']
      const thumbnailServiceMock = getThumbnailServiceInstance({ supportedMimeTypes })
      expect(thumbnailServiceMock.getSupportedMimeTypes('image')).toEqual([supportedMimeTypes[0]])
    })
  })
})
