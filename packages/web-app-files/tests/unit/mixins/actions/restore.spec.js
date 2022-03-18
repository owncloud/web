import Vuex from 'vuex'
import { createStore } from 'vuex-extensions'
import { mount, createLocalVue } from '@vue/test-utils'
import Restore from '@files/src/mixins/actions/restore.js'
import { createLocationTrash, createLocationSpaces } from '../../../../src/router'
// eslint-disable-next-line jest/no-mocks-import
import sdkMock from '@/__mocks__/sdk'

const localVue = createLocalVue()
localVue.use(Vuex)

const Component = {
  render() {},
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
  })

  describe('method "$_restore_trigger"', () => {
    it('should show message on success', async () => {
      const wrapper = getWrapper()
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      const removeFilesFromTrashbinStub = jest.spyOn(wrapper.vm, 'removeFilesFromTrashbin')
      await wrapper.vm.$_restore_trigger({ resources: [{ id: '1' }] })

      expect(showMessageStub).toHaveBeenCalledTimes(1)
      expect(removeFilesFromTrashbinStub).toHaveBeenCalledTimes(1)
    })

    it('should show message on error', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => {})

      const wrapper = getWrapper({ resolveClearTrashBin: false })
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      const removeFilesFromTrashbinStub = jest.spyOn(wrapper.vm, 'removeFilesFromTrashbin')
      await wrapper.vm.$_restore_trigger({ resources: [{ id: '1' }] })

      expect(showMessageStub).toHaveBeenCalledTimes(1)
      expect(removeFilesFromTrashbinStub).toHaveBeenCalledTimes(0)
    })
  })
})

function getWrapper({ invalidLocation = false, resolveClearTrashBin: resolveRestore = true } = {}) {
  return mount(Component, {
    localVue,
    mocks: {
      $router: {
        currentRoute: invalidLocation
          ? createLocationSpaces('files-spaces-personal-home')
          : createLocationTrash('files-trash-personal'),
        resolve: (r) => {
          return { href: r.name }
        }
      },
      $gettext: jest.fn(),
      $gettextInterpolate: jest.fn(),
      $client: {
        ...sdkMock,
        fileTrash: {
          ...sdkMock.files,
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
      actions: {
        createModal: jest.fn(),
        hideModal: jest.fn(),
        showMessage: jest.fn()
      },
      getters: {
        configuration: () => ({
          server: 'https://example.com'
        }),
        getToken: () => 'token'
      },
      modules: {
        user: {
          state: {
            id: 'alice',
            uuid: 1
          }
        },
        Files: {
          namespaced: true,
          mutations: {
            REMOVE_FILE: jest.fn()
          },
          actions: {
            removeFilesFromTrashbin: jest.fn()
          }
        }
      }
    })
  })
}
