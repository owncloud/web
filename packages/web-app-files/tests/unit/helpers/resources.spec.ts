import { Resource, SpaceResource } from 'web-client/src/helpers'
import { renameResource, buildWebDavFilesPath } from '../../../src/helpers/resources'
describe('resources helper', () => {
	describe('renameResource', () => {
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

	})
})
