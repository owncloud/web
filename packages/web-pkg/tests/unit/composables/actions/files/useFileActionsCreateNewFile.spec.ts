import { mock } from 'jest-mock-extended'
import { nextTick, ref, unref } from 'vue'
import { useFileActionsCreateNewFile } from '../../../../../src/composables/actions'
import { useMessages, useModals } from '../../../../../src/composables/piniaStores'
import { SpaceResource } from '@ownclouders/web-client/src'
import { Resource } from '@ownclouders/web-client/src/helpers'
import { FileActionOptions } from '../../../../../src/composables/actions'
import { useFileActions } from '../../../../../src/composables/actions/files/useFileActions'
import {
  RouteLocation,
  createStore,
  defaultComponentMocks,
  defaultStoreMockOptions,
  getComposableWrapper
} from 'web-test-helpers/src'
import { ApplicationFileExtension } from '../../../../../types'

jest.mock('../../../../../src/composables/actions/files/useFileActions', () => ({
  useFileActions: jest.fn(() => mock<ReturnType<typeof useFileActions>>())
}))

describe('useFileActionsCreateNewFile', () => {
  describe('checkFileName', () => {
    it.each([
      { input: '', output: 'File name cannot be empty' },
      { input: '/', output: 'File name cannot contain "/"' },
      { input: '.', output: 'File name cannot be equal to "."' },
      { input: '..', output: 'File name cannot be equal to ".."' },
      { input: 'myfile.txt', output: null }
    ])('should validate file name %s', (data) => {
      const space = mock<SpaceResource>({ id: '1' })
      getWrapper({
        space,
        setup: ({ getNameErrorMsg }) => {
          const result = getNameErrorMsg(data.input)
          expect(result).toBe(data.output)
        }
      })
    })
  })

  describe('addNewFile', () => {
    it('create new file', () => {
      const space = mock<SpaceResource>({ id: '1' })
      getWrapper({
        space,
        setup: async ({ addNewFile }, { storeOptions }) => {
          await addNewFile('myfile.txt', null)
          await nextTick()
          expect(storeOptions.modules.Files.mutations.UPSERT_RESOURCE).toHaveBeenCalled()
          const { showMessage } = useMessages()
          expect(showMessage).toHaveBeenCalledWith({
            title: '"myfile.txt" was created successfully'
          })
        }
      })
    })
    it('show error message if createFile fails', () => {
      const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation()
      const space = mock<SpaceResource>({ id: '1' })
      getWrapper({
        resolveCreateFile: false,
        space,
        setup: async ({ addNewFile }) => {
          await addNewFile('myfolder', null)
          await nextTick()

          const { showErrorMessage } = useMessages()
          expect(showErrorMessage).toHaveBeenCalledWith(
            expect.objectContaining({ title: 'Failed to create file' })
          )

          consoleErrorMock.mockRestore()
        }
      })
    })
  })
  describe('createNewFileModal', () => {
    it('should show modal', () => {
      const space = mock<SpaceResource>({ id: '1' })
      getWrapper({
        space,
        setup: async ({ actions }) => {
          const { dispatchModal } = useModals()
          const fileActionOptions: FileActionOptions = { space, resources: [] } as FileActionOptions
          unref(actions)[0].handler(fileActionOptions)
          await nextTick()
          expect(dispatchModal).toHaveBeenCalled()
        }
      })
    })
  })
})

function getWrapper({
  resolveCreateFile = true,
  space = undefined,
  setup
}: {
  resolveCreateFile?: boolean
  space?: SpaceResource
  setup: (
    instance: ReturnType<typeof useFileActionsCreateNewFile>,
    options: { storeOptions: typeof defaultStoreMockOptions }
  ) => void
}) {
  const mocks = {
    ...defaultComponentMocks({
      currentRoute: mock<RouteLocation>({ name: 'files-spaces-generic' })
    }),
    space
  }
  mocks.$clientService.webdav.putFileContents.mockImplementation(() => {
    if (resolveCreateFile) {
      return Promise.resolve({
        id: '1',
        type: 'folder',
        path: '/',
        isReceivedShare: jest.fn()
      } as Resource)
    }
    return Promise.reject('error')
  })

  const storeOptions = {
    ...defaultStoreMockOptions
  }
  const currentFolder = {
    id: 1,
    path: '/'
  }
  storeOptions.modules.Files.getters.currentFolder.mockReturnValue(currentFolder)
  const store = createStore(storeOptions)
  return {
    wrapper: getComposableWrapper(
      () => {
        const instance = useFileActionsCreateNewFile({
          store,
          space,
          appNewFileMenuExtensions: ref([
            mock<ApplicationFileExtension>({
              extension: '.txt',
              newFileMenu: { menuTitle: jest.fn() }
            })
          ])
        })
        setup(instance, { storeOptions })
      },
      {
        store,
        provide: mocks,
        mocks
      }
    )
  }
}
