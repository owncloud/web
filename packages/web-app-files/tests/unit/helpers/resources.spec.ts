import { Resource, SpaceResource } from 'web-client/src/helpers'
import {
  renameResource,
  buildWebDavFilesPath,
  buildWebDavFilesTrashPath,
  attachIndicators
} from '../../../src/helpers/resources'
import * as indicators from '../../../src/helpers/statusIndicators'

describe('resources helper', () => {
  let resource: Resource
  let space: SpaceResource
  beforeEach(() => {
    resource = {
      name: 'unchanged',
      path: 'unchanged',
      webDavPath: 'unchanged',
      extension: 'unchanged',
      size: 10
    } as Resource
    space = {
      webDavPath: 'space'
    } as SpaceResource
  })
  describe('renameResource', () => {
    it('expect only name, path, webDavPath, extension to be set', () => {
      renameResource(space, resource, '/test/test.txt')
      expect(resource.name).toBe('test.txt')
      expect(resource.path).toBe('/test/test.txt')
      expect(resource.webDavPath).toBe('space/test/test.txt')
      expect(resource.extension).toBe('txt')
      expect(resource.size).toBe(10)
    })
  })
  describe('buildWebDavFilesPath', () => {
    it('should return a valid webdav file path', () => {
      const result = buildWebDavFilesPath('test', 'abc/123')
      expect(result).toEqual('/files/test/abc/123')
    })
  })
  describe('buildWebDavFilesTrashPath', () => {
    it('should return a valid webdav trash file path', () => {
      const result = buildWebDavFilesTrashPath('test', 'abc/123')
      expect(result).toEqual('/trash-bin/test/abc/123')
    })
  })
  describe('attachIndicators', () => {
    it('should attach indicators to resource', () => {
      jest.spyOn(indicators, 'getIndicators').mockReturnValue({ indicator: 'test' })
      attachIndicators(resource, {})
      expect(resource.indicators).toMatchObject({ indicator: 'test' })
    })
  })
})
