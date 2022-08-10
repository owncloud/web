import {
  extractExtensionFromFile,
  extractNameWithoutExtension
} from '../../../../src/helpers/resource'
import { Resource } from 'web-client'

const resourceWithoutExtension = {
  name: 'file'
}
const resourceNameWithExtension = {
  name: 'file.txt',
  extension: 'txt'
}
const resourceNameWithExtensionAndDots = {
  name: 'file.dot.txt',
  extension: 'txt'
}

describe('filterResources', () => {
  describe('extractNameWithoutExtension', () => {
    it('should return resource name when there is no extension', () => {
      expect(extractNameWithoutExtension(resourceWithoutExtension as Resource)).toEqual(
        resourceWithoutExtension.name
      )
    })
    it('should return resource name without extension when there is an extension', () => {
      expect(extractNameWithoutExtension(resourceNameWithExtension as Resource)).toEqual('file')
    })
    it('should return resource name with dots without extension when there is an extension', () => {
      expect(extractNameWithoutExtension(resourceNameWithExtensionAndDots as Resource)).toEqual(
        'file.dot'
      )
    })
  })
  describe('extractExtensionFromFile', () => {
    it('should return simple file extension', () => {
      expect(extractExtensionFromFile({ name: 'test.png' } as Resource)).toEqual('png')
    })
    it('should return complex file extension', () => {
      expect(extractExtensionFromFile({ name: 'test.tar.gz' } as Resource)).toEqual('tar.gz')
    })
    it('should return unknown file extension', () => {
      expect(extractExtensionFromFile({ name: 'test.unknown' } as Resource)).toEqual('unknown')
    })
    it('should return no file extension', () => {
      expect(extractExtensionFromFile({ name: 'test' } as Resource)).toEqual('')
    })
    it.each([
      { name: 'afolder', isFolder: true },
      { name: 'afolder', type: 'dir' },
      { name: 'afolder', type: 'folder' }
    ])('should return empty string if folder', (resource) => {
      expect(extractExtensionFromFile(resource as Resource)).toEqual('')
    })
  })
})
