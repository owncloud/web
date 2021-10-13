import Vuex from 'vuex'
import mixins from '../../src/mixins'
import { createLocalVue, mount } from '@vue/test-utils'

const localVue = createLocalVue()
localVue.use(Vuex)

describe('mixins', () => {
  describe('fileTypeIcon', () => {
    it.each(['', false, NaN, undefined, 1, {}])(
      'should return "file" if invalid data is provided',
      (inputData) => {
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
    ])('should return "file" for an unknown extension', (inputData) => {
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
    ])('should return "folder" if type is set to "folder"', (inputData) => {
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
    ])('should return the icon for a known file extension, regardless of the type', (inputData) => {
      expect(mixins.methods.fileTypeIcon(inputData)).toEqual('package-x-generic')
    })
  })

  describe('checkIfElementExists', () => {
    const Component = {
      render() {}
    }
    const wrapper = mount(Component, {
      localVue,
      mixins: [mixins],
      store: new Vuex.Store({
        modules: {
          Files: {
            namespaced: true,
            getters: {
              files: () => [{ name: 'file1', size: 1220 }, { name: 'file2' }]
            }
          }
        }
      })
    })
    it('should return the first found element if it exists in store files list', () => {
      expect(wrapper.vm.checkIfElementExists({ name: 'file1' })).toMatchObject({ name: 'file1' })
    })
    it('should return the first found element with provided name if it exists in store files list', () => {
      expect(wrapper.vm.checkIfElementExists('file1')).toMatchObject({ name: 'file1' })
    })
    it("should return undefined if the element doesn't exist in store files list", () => {
      expect(wrapper.vm.checkIfElementExists({ name: 'file3' })).toBe(undefined)
    })
  })
})
