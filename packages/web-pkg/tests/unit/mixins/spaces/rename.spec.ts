import rename from 'web-pkg/src/mixins/spaces/rename'
import { mock } from 'jest-mock-extended'
import {
  createStore,
  defaultComponentMocks,
  defaultPlugins,
  mockAxiosResolve,
  mount,
  defaultStoreMockOptions,
  RouteLocation
} from 'web-test-helpers'

const Component = {
  template: '<div></div>',
  mixins: [rename]
}

describe('rename', () => {
  afterEach(() => jest.clearAllMocks())

  describe('method "$_rename_trigger"', () => {
    it('should trigger the rename modal window', async () => {
      const { wrapper } = getWrapper()
      const spyCreateModalStub = jest.spyOn(wrapper.vm, 'createModal')
      await wrapper.vm.$_rename_trigger({ resources: [{ id: 1, name: 'renamed space' }] })

      expect(spyCreateModalStub).toHaveBeenCalledTimes(1)
    })
    it('should not trigger the rename modal window without any resource', async () => {
      const { wrapper } = getWrapper()
      const spyCreateModalStub = jest.spyOn(wrapper.vm, 'createModal')
      await wrapper.vm.$_rename_trigger({ resources: [] })

      expect(spyCreateModalStub).toHaveBeenCalledTimes(0)
    })
  })

  describe('method "$_rename_checkName"', () => {
    it('should throw an error with an empty space name', async () => {
      const { wrapper } = getWrapper()
      const spyInputErrorMessageStub = jest.spyOn(wrapper.vm, 'setModalInputErrorMessage')
      await wrapper.vm.$_rename_checkName('')

      expect(spyInputErrorMessageStub).toHaveBeenCalledTimes(1)
    })
    it('should throw an error with an space name longer than 255 characters', async () => {
      const { wrapper } = getWrapper()
      const spyInputErrorMessageStub = jest.spyOn(wrapper.vm, 'setModalInputErrorMessage')
      await wrapper.vm.$_rename_checkName('n'.repeat(256))

      expect(spyInputErrorMessageStub).toHaveBeenCalledTimes(1)
    })
    it.each(['/', '\\', '.', ':', '?', '*', '"', '>', '<', '|'])(
      'should show an error message when trying to create a space with a special character',
      (specialChar) => {
        const { wrapper } = getWrapper()
        wrapper.vm.setModalInputErrorMessage = jest.fn()

        const spyInputErrorMessageStub = jest.spyOn(wrapper.vm, 'setModalInputErrorMessage')
        wrapper.vm.$_rename_checkName(specialChar)

        expect(spyInputErrorMessageStub).toHaveBeenCalledTimes(1)
      }
    )
  })

  describe('method "$_rename_renameSpace"', () => {
    it('should hide the modal and show message on success', async () => {
      const { wrapper, mocks } = getWrapper()
      mocks.$clientService.graphAuthenticated.drives.updateDrive.mockResolvedValue(
        mockAxiosResolve()
      )
      const hideModalStub = jest.spyOn(wrapper.vm, 'hideModal')
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      await wrapper.vm.$_rename_renameSpace(1, 'renamed space')

      expect(hideModalStub).toHaveBeenCalledTimes(1)
      expect(showMessageStub).toHaveBeenCalledTimes(1)
    })

    it('should show message on error', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined)
      const { wrapper, mocks } = getWrapper()
      mocks.$clientService.graphAuthenticated.drives.updateDrive.mockRejectedValue(new Error())
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      await wrapper.vm.$_rename_renameSpace(1, 'renamed space')

      expect(showMessageStub).toHaveBeenCalledTimes(1)
    })
  })
})

function getWrapper() {
  const storeOptions = {
    ...defaultStoreMockOptions,
    modules: { ...defaultStoreMockOptions.modules, user: { state: { id: 'alice', uuid: 1 } } }
  }
  const store = createStore(storeOptions)
  const mocks = defaultComponentMocks({
    currentRoute: mock<RouteLocation>({ name: 'files-spaces-projects' })
  })
  return {
    mocks,
    wrapper: mount(Component, {
      global: {
        plugins: [...defaultPlugins(), store],
        mocks
      }
    })
  }
}
