import mixins from '../src/mixins'

describe('mixins', () => {
  describe('fileTypeIcon', () => {
    it.each(['', false, NaN, undefined, 1, {}])(
      'should return "file" if invalid data is provided',
      inputData => {
        expect(mixins.methods.fileTypeIcon(inputData)).toEqual('file')
      }
    )
    it.each([
      { type: 'file', extension: 'not existing' },
      { type: 'file', extension: 'UTF नेपालि' },
      { type: 'file', extension: '' },
      { type: 'file', extension: false },
      { type: 'file', extension: undefined },
      { type: 'file', extension: 1 },
      { type: 'file', extension: 0 },
      { type: 'file', extension: '.tar.bz2' },
      { type: '', extension: '.tar.bz2' },
      { type: 0, extension: '.tar.bz2' },
      { type: false, extension: '.tar.bz2' },
      { type: undefined, extension: '.tar.bz2' }
    ])('should return "file" for an unknown extension', inputData => {
      expect(mixins.methods.fileTypeIcon(inputData)).toEqual('file')
    })
    it.each([
      { type: 'folder', extension: '' },
      { type: 'folder', extension: 'pdf' },
      { type: 'folder' },
      { type: 'folder', extension: false },
      { type: 'folder', extension: undefined },
      { type: 'folder', extension: 1 },
      { type: 'folder', extension: 0 }
    ])('should return "folder" if type is set to "folder"', inputData => {
      expect(mixins.methods.fileTypeIcon(inputData)).toEqual('folder')
    })
    it.each([
      { type: 'file', extension: 'tar.bz2' },
      { type: 'file', extension: 'tAr.Bz2' },
      { type: false, extension: 'tar.bz2' },
      { type: undefined, extension: 'tar.bz2' },
      { type: 1, extension: 'tar.bz2' },
      { type: '', extension: 'tar.bz2' },
      { type: 0, extension: 'tar.bz2' },
      { type: false, extension: 'tar.bz2' },
      { type: '0', extension: 'tar.bz2' }
    ])('should return the icon for a known file extension, regardless of the type', inputData => {
      expect(mixins.methods.fileTypeIcon(inputData)).toEqual('package-x-generic')
    })
  })
})
