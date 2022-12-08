import Vuex from 'vuex'
import { createStore } from 'vuex-extensions'
import { mount, createLocalVue } from '@vue/test-utils'
import Restore from 'web-app-files/src/mixins/actions/restore'
import { createLocationTrash, createLocationSpaces } from 'web-app-files/src/router'
import { mockDeep } from 'jest-mock-extended'
import { OwnCloudSdk } from 'web-client/src/types'
import { defaultStoreMockOptions } from 'web-test-helpers/src/mocks/store/defaultStoreMockOptions'

const localVue = createLocalVue()
localVue.use(Vuex)

const Component = {
  template: '<div></div>',
  mixins: [Restore]
}

describe('restore', () => {
  afterEach(() => jest.clearAllMocks())

  describe('isEnabled property', () => {
    it('should be false when no resource is given', () => {
      const wrapper = getWrapper()
      expect(wrapper.vm.$_restore_items[0].isEnabled({ resources: [] })).toBe(false)
    })
    it('should be true when permission is sufficient', () => {
      const wrapper = getWrapper()
      expect(
        wrapper.vm.$_restore_items[0].isEnabled({ resources: [{ canBeRestored: () => true }] })
      ).toBe(true)
    })
    it('should be false when permission is not sufficient', () => {
      const wrapper = getWrapper()
      expect(
        wrapper.vm.$_restore_items[0].isEnabled({ resources: [{ canBeRestored: () => false }] })
      ).toBe(false)
    })
    it('should be false when location is invalid', () => {
      const wrapper = getWrapper({ invalidLocation: true })
      expect(wrapper.vm.$_restore_items[0].isEnabled({ resources: [{}] })).toBe(false)
    })
    it('should be false in a space trash bin with insufficient permissions', () => {
      const wrapper = getWrapper({ driveType: 'project' })
      expect(
        wrapper.vm.$_restore_items[0].isEnabled({ resources: [{ canBeRestored: () => true }] })
      ).toBe(false)
    })
  })

  describe('method "$_restore_trigger"', () => {
    it('should show message on success', async () => {
      const wrapper = getWrapper()
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      const removeFilesFromTrashbinStub = jest.spyOn(wrapper.vm, 'removeFilesFromTrashbin')
      await wrapper.vm.$_restore_restoreResources([{ id: '1', path: '/1' }], [])

      expect(showMessageStub).toHaveBeenCalledTimes(1)
      expect(removeFilesFromTrashbinStub).toHaveBeenCalledTimes(1)
    })

    it('should show message on error', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined)

      const wrapper = getWrapper({ resolveClearTrashBin: false })
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      const removeFilesFromTrashbinStub = jest.spyOn(wrapper.vm, 'removeFilesFromTrashbin')
      await wrapper.vm.$_restore_restoreResources([{ id: '1', path: '/1' }], [])

      expect(showMessageStub).toHaveBeenCalledTimes(1)
      expect(removeFilesFromTrashbinStub).toHaveBeenCalledTimes(0)
    })
    it('should request parent folder on collecting restore conflicts', async () => {
      const wrapper = getWrapper()
      await wrapper.vm.$_restore_collectConflicts([{ id: '1', path: '1', name: '1' }])

      expect(wrapper.vm.$clientService.webdav.listFiles).toHaveBeenCalledWith(expect.anything(), {
        path: '.'
      })
    })
    it('should find conflict within resources', async () => {
      const wrapper = getWrapper()
      const resourceOne = { id: '1', path: '1', name: '1' }
      const resourceTwo = { id: '2', path: '1', name: '1' }
      const { conflicts } = await wrapper.vm.$_restore_collectConflicts([resourceOne, resourceTwo])

      expect(conflicts).toContain(resourceTwo)
    })
    it('should add files without conflict to resolved resources', async () => {
      const wrapper = getWrapper()
      const resource = { id: '1', path: '1', name: '1' }
      const { resolvedResources } = await wrapper.vm.$_restore_collectConflicts([resource])

      expect(resolvedResources).toContain(resource)
    })
  })
})

function getWrapper({
  invalidLocation = false,
  resolveClearTrashBin: resolveRestore = true,
  driveType = 'personal'
} = {}) {
  const clientMock = mockDeep<OwnCloudSdk>()
  return mount(Component, {
    localVue,
    mocks: {
      $router: {
        currentRoute: invalidLocation
          ? createLocationSpaces('files-spaces-generic')
          : createLocationTrash('files-trash-generic'),
        resolve: (r) => {
          return { href: r.name }
        }
      },
      $gettext: jest.fn(),
      $gettextInterpolate: jest.fn(),
      space: { driveType, isEditor: () => false, isManager: () => false },
      createModal: jest.fn(),
      $clientService: {
        webdav: {
          listFiles: jest.fn().mockImplementation(() => {
            return { resource: {}, children: [] }
          }),
          restoreFile: jest.fn().mockImplementation(() => {
            if (resolveRestore) {
              return Promise.resolve({})
            }
            return Promise.reject(new Error(''))
          })
        }
      },
      $client: {
        ...clientMock,
        users: { getUser: () => ({ quota: {} }) },
        fileTrash: {
          ...clientMock.files,
          restore: jest.fn().mockImplementation(() => {
            if (resolveRestore) {
              return Promise.resolve({})
            }
            return Promise.reject(new Error(''))
          })
        }
      }
    },
    store: createStore(Vuex.Store, {
      ...defaultStoreMockOptions,
      modules: {
        ...defaultStoreMockOptions.modules,
        user: { state: { uuid: 1 } }
      }
    })
  })
}
