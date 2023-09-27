import { useFileActionsRename } from '../../../../../src/composables/actions'
import { mockDeep } from 'jest-mock-extended'
import { Resource, SpaceResource } from 'web-client/src/helpers'
import {
  createStore,
  defaultStoreMockOptions,
  defaultComponentMocks,
  getComposableWrapper
} from 'web-test-helpers'
import { useStore } from '@ownclouders/web-pkg/src/composables'
import { nextTick, unref } from 'vue'
import { ConfigurationManager } from '@ownclouders/web-pkg'

jest.mock('@ownclouders/web-pkg/src/composables/configuration/useConfigurationManager', () => ({
  useConfigurationManager: () =>
    mockDeep<ConfigurationManager>({
      options: {
        routing: {
          fullShareOwnerPaths: false
        }
      }
    })
}))

const currentFolder = {
  id: 1,
  path: '/folder'
}

describe('rename', () => {
  describe('computed property "actions"', () => {
    describe('isEnabled property of returned element', () => {
      it.each([
        { resources: [{ canRename: () => true }] as Resource[], expectedStatus: true },
        { resources: [{ canRename: () => false }] as Resource[], expectedStatus: false },
        {
          resources: [{ canRename: () => true }, { canRename: () => true }] as Resource[],
          expectedStatus: false
        },
        {
          resources: [{ canRename: () => true, locked: true }] as Resource[],
          expectedStatus: false
        }
      ])('should be set correctly', (inputData) => {
        const { wrapper } = getWrapper({
          setup: ({ actions }, { space }) => {
            const resources = inputData.resources
            expect(unref(actions)[0].isEnabled({ space, resources })).toBe(inputData.expectedStatus)
          }
        })
      })
    })
  })

  describe('rename action handler', () => {
    it('should trigger the rename modal window', async () => {
      const { wrapper } = getWrapper({
        setup: async ({ actions }, { space, storeOptions }) => {
          const resources = [currentFolder]
          await unref(actions)[0].handler({ space, resources })
          expect(storeOptions.actions.createModal).toHaveBeenCalledTimes(1)
        }
      })
    })
  })

  describe('method "checkNewName"', () => {
    it('should not show an error if new name not taken', () => {
      const { wrapper } = getWrapper({
        setup: ({ checkNewName }, { storeOptions }) => {
          storeOptions.modules.Files.getters.files.mockReturnValue([
            { name: 'file1', path: '/file1' }
          ])
          checkNewName({ name: 'currentName', path: '/currentName' } as Resource, 'newName')
          expect(storeOptions.actions.setModalInputErrorMessage).toHaveBeenCalledWith(
            expect.anything(),
            null
          )
        }
      })
    })

    it('should not show an error if new name already exists but in different folder', () => {
      const { wrapper } = getWrapper({
        setup: ({ checkNewName }, { storeOptions }) => {
          storeOptions.modules.Files.getters.files.mockReturnValue([
            { name: 'file1', path: '/file1' }
          ])
          checkNewName({ name: 'currentName', path: '/favorites/currentName' }, 'file1')
          expect(storeOptions.actions.setModalInputErrorMessage).toHaveBeenCalledWith(
            expect.anything(),
            null
          )
        }
      })
    })

    it.each([
      { currentName: 'currentName', newName: '', message: 'The name cannot be empty' },
      { currentName: 'currentName', newName: 'new/name', message: 'The name cannot contain "/"' },
      { currentName: 'currentName', newName: '.', message: 'The name cannot be equal to "."' },
      { currentName: 'currentName', newName: '..', message: 'The name cannot be equal to ".."' },
      {
        currentName: 'currentName',
        newName: 'newname ',
        message: 'The name cannot end with whitespace'
      },
      {
        currentName: 'currentName',
        newName: 'file1',
        message: 'The name "file1" is already taken'
      },
      {
        currentName: 'currentName',
        newName: 'newname',
        parentResources: [{ name: 'newname', path: '/newname' }],
        message: 'The name "newname" is already taken'
      }
    ])('should detect name errors and display error messages accordingly', (inputData) => {
      const { wrapper } = getWrapper({
        setup: ({ checkNewName }, { storeOptions }) => {
          checkNewName(
            { name: inputData.currentName, path: `/${inputData.currentName}` },
            inputData.newName,
            inputData.parentResources
          )
          expect(storeOptions.actions.setModalInputErrorMessage).toHaveBeenCalledWith(
            expect.anything(),
            inputData.message
          )
        }
      })
    })
  })

  describe('method "renameResource"', () => {
    it('should call the rename action on a resource in the file list', async () => {
      const { wrapper } = getWrapper({
        setup: async ({ renameResource }, { space, storeOptions }) => {
          const resource = { id: 2, path: '/folder', webDavPath: '/files/admin/folder' }
          renameResource(space, resource, 'new name')
          await nextTick()
          expect(storeOptions.actions.hideModal).toHaveBeenCalledTimes(1)
        }
      })
    })

    it('should call the rename action on the current folder', async () => {
      const { wrapper } = getWrapper({
        setup: async ({ renameResource }, { space, storeOptions }) => {
          renameResource(space, currentFolder, 'new name')
          await nextTick()
          expect(storeOptions.actions.hideModal).toHaveBeenCalledTimes(1)
        }
      })
    })

    it('should handle errors properly', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined)

      const { wrapper } = getWrapper({
        setup: async ({ renameResource }, { space, storeOptions, clientService }) => {
          clientService.webdav.moveFiles.mockRejectedValueOnce(new Error())

          renameResource(space, currentFolder, 'new name')
          await nextTick()
          await nextTick()
          expect(storeOptions.actions.hideModal).toHaveBeenCalledTimes(0)
          expect(storeOptions.actions.showErrorMessage).toHaveBeenCalledTimes(1)
        }
      })
    })
  })
})

function getWrapper({
  setup
}: {
  setup: (
    instance: ReturnType<typeof useFileActionsRename>,
    {
      space,
      storeOptions,
      clientService
    }: {
      space: SpaceResource
      storeOptions: typeof defaultStoreMockOptions
      clientService: ReturnType<typeof defaultComponentMocks>['$clientService']
    }
  ) => void
}) {
  const mocks = {
    ...defaultComponentMocks(),
    space: mockDeep<SpaceResource>({
      webDavPath: 'irrelevant'
    })
  }

  const storeOptions = defaultStoreMockOptions
  const store = createStore(storeOptions)
  return {
    mocks,
    storeOptions,
    wrapper: getComposableWrapper(
      () => {
        const store = useStore()
        const instance = useFileActionsRename({ store })
        setup(instance, { space: mocks.space, storeOptions, clientService: mocks.$clientService })
      },
      {
        mocks,
        provide: mocks,
        store
      }
    )
  }
}
