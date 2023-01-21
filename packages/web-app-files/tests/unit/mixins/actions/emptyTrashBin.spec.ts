import EmptyTrashBin from 'web-app-files/src/mixins/actions/emptyTrashBin'
import { createLocationTrash, createLocationSpaces } from '../../../../src/router'
import { mockDeep } from 'jest-mock-extended'
import { OwnCloudSdk } from 'web-client/src/types'
import { createStore, defaultPlugins, mount, defaultStoreMockOptions } from 'web-test-helpers'

const Component = {
  template: '<div></div>',
  mixins: [EmptyTrashBin]
}

describe('emptyTrashBin', () => {
  afterEach(() => jest.clearAllMocks())

  describe('isEnabled property', () => {
    it('should be false when resource is given', () => {
      const { wrapper } = getWrapper()
      expect(wrapper.vm.$_emptyTrashBin_items[0].isEnabled({ resources: [{}] })).toBe(false)
    })
    it('should be true when no resource is given', () => {
      const { wrapper } = getWrapper()
      expect(wrapper.vm.$_emptyTrashBin_items[0].isEnabled({ resources: [] })).toBe(true)
    })
    it('should be false when location is invalid', () => {
      const { wrapper } = getWrapper({ invalidLocation: true })
      expect(wrapper.vm.$_emptyTrashBin_items[0].isEnabled({ resources: [] })).toBe(false)
    })
    it('should be false in a space trash bin with insufficient permissions', () => {
      const { wrapper } = getWrapper({ driveType: 'project' })
      expect(
        wrapper.vm.$_emptyTrashBin_items[0].isEnabled({
          resources: [{ canBeRestored: () => true }]
        })
      ).toBe(false)
    })
  })

  describe('method "$_emptyTrashBin_trigger"', () => {
    it('should trigger the empty trash bin modal window', async () => {
      const { wrapper } = getWrapper()
      const spyCreateModalStub = jest.spyOn(wrapper.vm, 'createModal')
      await wrapper.vm.$_emptyTrashBin_trigger()

      expect(spyCreateModalStub).toHaveBeenCalledTimes(1)
    })
  })

  describe('method "$_emptyTrashBin_emptyTrashBin"', () => {
    it('should hide the modal and show message on success', async () => {
      const { wrapper } = getWrapper()
      const hideModalStub = jest.spyOn(wrapper.vm, 'hideModal')
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      await wrapper.vm.$_emptyTrashBin_emptyTrashBin()

      expect(hideModalStub).toHaveBeenCalledTimes(1)
      expect(showMessageStub).toHaveBeenCalledTimes(1)
    })

    it('should show message on error', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined)

      const { wrapper } = getWrapper({ resolveClearTrashBin: false })
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      await wrapper.vm.$_emptyTrashBin_emptyTrashBin()

      expect(showMessageStub).toHaveBeenCalledTimes(1)
    })
  })
})

function getWrapper({
  invalidLocation = false,
  resolveClearTrashBin = true,
  driveType = 'personal'
} = {}) {
  const clientMock = mockDeep<OwnCloudSdk>()
  const mocks = {
    $router: {
      currentRoute: invalidLocation
        ? createLocationSpaces('files-spaces-generic')
        : createLocationTrash('files-trash-generic'),
      resolve: (r) => {
        return { href: r.name }
      }
    },
    $gettext: jest.fn(),
    $pgettext: jest.fn(),
    space: { driveType, isEditor: () => false, isManager: () => false },
    $client: {
      ...clientMock,
      fileTrash: {
        ...clientMock.files,
        clearTrashBin: jest.fn().mockImplementation(() => {
          if (resolveClearTrashBin) {
            return Promise.resolve({})
          }
          return Promise.reject(new Error(''))
        })
      }
    }
  }
  const storeOptions = {
    ...defaultStoreMockOptions,
    modules: {
      ...defaultStoreMockOptions.modules,
      user: { state: { uuid: 1 } }
    }
  }
  const store = createStore(storeOptions)
  return {
    wrapper: mount(Component, {
      global: { plugins: [...defaultPlugins(), store], mocks }
    })
  }
}
