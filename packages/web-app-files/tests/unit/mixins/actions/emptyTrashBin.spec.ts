import { useEmptyTrashBin } from 'web-app-files/src/mixins/actions/emptyTrashBin'
import { createLocationTrash, createLocationSpaces } from '../../../../src/router'
import { mock } from 'jest-mock-extended'
import {
  createStore,
  defaultStoreMockOptions,
  getComposableWrapper,
  defaultComponentMocks,
  RouteLocation
} from 'web-test-helpers'
import { useStore } from 'web-pkg/src/composables'
import { unref } from 'vue'
import { ProjectSpaceResource, Resource } from 'web-client/src/helpers'

describe('emptyTrashBin', () => {
  afterEach(() => jest.clearAllMocks())

  describe('isEnabled property', () => {
    it('should be false when resource is given', () => {
      const { wrapper } = getWrapper({
        setup: ({ actions }, space) => {
          expect(unref(actions)[0].isEnabled({ space, resources: [{}] as Resource[] })).toBe(false)
        }
      })
    })
    it('should be true when no resource is given', () => {
      const { wrapper } = getWrapper({
        setup: ({ actions }, space) => {
          expect(unref(actions)[0].isEnabled({ space, resources: [] })).toBe(true)
        }
      })
    })
    it('should be false when location is invalid', () => {
      const { wrapper } = getWrapper({
        invalidLocation: true,
        setup: ({ actions }, space) => {
          expect(unref(actions)[0].isEnabled({ space, resources: [] })).toBe(false)
        }
      })
    })
    it('should be false in a space trash bin with insufficient permissions', () => {
      const { wrapper } = getWrapper({
        driveType: 'project',
        setup: ({ actions }, space) => {
          expect(
            unref(actions)[0].isEnabled({
              space,
              resources: [{ canBeRestored: () => true }] as Resource[]
            })
          ).toBe(false)
        }
      })
    })
  })

  describe.skip('method "$_emptyTrashBin_trigger"', () => {
    it('should trigger the empty trash bin modal window', async () => {
      const { wrapper } = getWrapper({
        setup: () => undefined
      })
      const spyCreateModalStub = jest.spyOn(wrapper.vm, 'createModal')
      await wrapper.vm.$_emptyTrashBin_trigger()

      expect(spyCreateModalStub).toHaveBeenCalledTimes(1)
    })
  })

  describe.skip('method "$_emptyTrashBin_emptyTrashBin"', () => {
    it('should hide the modal and show message on success', async () => {
      const { wrapper } = getWrapper({
        setup: () => undefined
      })
      const hideModalStub = jest.spyOn(wrapper.vm, 'hideModal')
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      await wrapper.vm.$_emptyTrashBin_emptyTrashBin()

      expect(hideModalStub).toHaveBeenCalledTimes(1)
      expect(showMessageStub).toHaveBeenCalledTimes(1)
    })

    it.skip('should show message on error', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined)

      const { wrapper } = getWrapper({ resolveClearTrashBin: false, setup: () => undefined })
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      await wrapper.vm.$_emptyTrashBin_emptyTrashBin()

      expect(showMessageStub).toHaveBeenCalledTimes(1)
    })
  })
})

function getWrapper({
  invalidLocation = false,
  resolveClearTrashBin = true,
  driveType = 'personal',
  setup
}: {
  invalidLocation?: boolean
  resolveClearTrashBin?: boolean
  driveType?: string
  setup: (instance: ReturnType<typeof useEmptyTrashBin>, space: ProjectSpaceResource) => void
}) {
  const mocks = {
    ...defaultComponentMocks({
      currentRoute: mock<RouteLocation>(
        invalidLocation
          ? (createLocationSpaces('files-spaces-generic') as any)
          : (createLocationTrash('files-trash-generic') as any)
      )
    }),
    space: mock<ProjectSpaceResource>({ driveType, isEditor: () => false, isManager: () => false })
  }

  mocks.$clientService.owncloudSdk.fileTrash.clearTrashBin.mockImplementation(() => {
    if (resolveClearTrashBin) {
      return Promise.resolve({})
    }
    return Promise.reject(new Error(''))
  })

  const storeOptions = {
    ...defaultStoreMockOptions,
    modules: {
      ...defaultStoreMockOptions.modules,
      user: { state: { uuid: 1 } }
    }
  }
  const store = createStore(storeOptions)
  return {
    wrapper: getComposableWrapper(
      () => {
        const store = useStore()
        const instance = useEmptyTrashBin({ store })
        setup(instance, mocks.space)
      },
      {
        mocks,
        store
      }
    )
  }
}
