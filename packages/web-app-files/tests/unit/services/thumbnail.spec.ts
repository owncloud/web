import { thumbnailService, ThumbnailService } from '../../../src/services'

describe('thumbnail', () => {
  describe('thumbnailService', () => {
    it('creates an ArchiverService instance exported as `archiverService`', () => {
      expect(thumbnailService).toBeInstanceOf(ThumbnailService)
    })
    describe('when not being initialized', () => {
      it('is announcing itself as unavailable', () => {
        expect(thumbnailService.available).toBe(false)
      })
    })
    describe('when initialized', () => {
      let service
      beforeEach(() => {
        service = new ThumbnailService()
      })
      describe('without thumbnail capability', () => {
        beforeEach(() => {
          service.initialize(null)
        })
        it('is announcing itself as unavailable', () => {
          expect(service.available).toBe(false)
        })
      })
      describe('with capability', () => {
        const capability = {
          enabled: true,
          version: 'v0.1',
          supportedMimeTypes: ['image/png', 'image/jpg', 'image/jpeg', 'image/gif', 'text/plain']
        }
        beforeEach(() => {
          service.initialize(capability)
        })
        it('is announcing itself as available', () => {
          expect(service.available).toBe(true)
        })
        describe('method isMimetypeSupported', () => {
          it('should be true if mimeType is supported', () => {
            expect(service.isMimetypeSupported('image/png')).toBe(true)
          })
          it('should be false if mimeType is not supported', () => {
            expect(service.isMimetypeSupported('image/pdf')).toBe(false)
          })
          it('should be false if mimeType is supported but excluded via onlyImages property', () => {
            expect(service.isMimetypeSupported('text/plain', true)).toBe(false)
          })
        })
      })
    })
  })
})
