import { useSpaceActionsDuplicate } from '../../../../../src/composables/actions'
import { SpaceResource } from '@ownclouders/web-client/src/helpers'
import { mock } from 'jest-mock-extended'
import {
  createStore,
  defaultComponentMocks,
  mockAxiosResolve,
  defaultStoreMockOptions,
  RouteLocation,
  getComposableWrapper
} from 'web-test-helpers'
import { unref } from 'vue'
import { ListFilesResult } from '@ownclouders/web-client/src/webdav/listFiles'

const spaces = [
  mock<SpaceResource>({
    name: 'Moon',
    description: 'To the moon',
    type: 'project',
    spaceImageData: null,
    spaceReadmeData: null
  })
]
describe('restore', () => {
  describe('isEnabled property', () => {
    it('should be false when no resource given', () => {
      const { wrapper } = getWrapper({
        setup: ({ actions }, { storeOptions }) => {
          expect(unref(actions)[0].isEnabled({ resources: [] })).toBe(false)
        }
      })
    })
    it('should be false when the space is disabled', () => {
      const { wrapper } = getWrapper({
        setup: ({ actions }, { storeOptions }) => {
          expect(
            unref(actions)[0].isEnabled({
              resources: [
                mock<SpaceResource>({
                  disabled: true,
                  driveType: 'project'
                })
              ]
            })
          ).toBe(false)
        }
      })
    })
    it('should be false when the space is no project space', () => {
      const { wrapper } = getWrapper({
        setup: ({ actions }, { storeOptions }) => {
          expect(
            unref(actions)[0].isEnabled({
              resources: [
                mock<SpaceResource>({
                  disabled: false,
                  driveType: 'personal'
                })
              ]
            })
          ).toBe(false)
        }
      })
    })
    it('should be false when the current user can not create spaces', () => {
      const { wrapper } = getWrapper({
        abilities: [],
        setup: ({ actions }, { storeOptions }) => {
          expect(
            unref(actions)[0].isEnabled({
              resources: [mock<SpaceResource>({ disabled: false, driveType: 'project' })]
            })
          ).toBe(false)
        }
      })
    })
    it('should be true when the current user can create spaces', () => {
      const { wrapper } = getWrapper({
        setup: ({ actions }, { storeOptions }) => {
          expect(
            unref(actions)[0].isEnabled({
              resources: [
                mock<SpaceResource>({ name: 'Moon', disabled: false, driveType: 'project' }),
                mock<SpaceResource>({ name: 'Sun', disabled: false, driveType: 'project' })
              ]
            })
          ).toBe(true)
        }
      })
    })
  })
  describe('method "duplicateSpace"', () => {
    it('should show error message on error', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined)
      const { wrapper } = getWrapper({
        setup: async ({ duplicateSpace }, { storeOptions, clientService }) => {
          clientService.graphAuthenticated.drives.createDrive.mockRejectedValue(new Error())
          await duplicateSpace(spaces[0])
          expect(storeOptions.actions.showErrorMessage).toHaveBeenCalledTimes(1)
        }
      })
    })
    it('should show message on success', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined)
      const { wrapper } = getWrapper({
        setup: async ({ duplicateSpace }, { storeOptions, clientService }) => {
          clientService.graphAuthenticated.drives.createDrive.mockResolvedValue(
            mockAxiosResolve({
              id: '1',
              name: 'Moon (1)',
              special: []
            })
          )
          clientService.webdav.listFiles.mockResolvedValue({ children: [] } as ListFilesResult)
          await duplicateSpace(spaces[0])
          expect(clientService.graphAuthenticated.drives.createDrive).toHaveBeenCalledWith(
            {
              description: 'To the moon',
              name: 'Moon (1)'
            },
            expect.anything()
          )
          expect(
            storeOptions.modules.runtime.modules.spaces.mutations.UPSERT_SPACE
          ).toHaveBeenCalled()
          expect(storeOptions.actions.showMessage).toHaveBeenCalled()
        }
      })
    })
  })
})

function getWrapper({
  setup,
  abilities = [{ action: 'create-all', subject: 'Drive' }]
}: {
  setup: (
    instance: ReturnType<typeof useSpaceActionsDuplicate>,
    {
      storeOptions,
      clientService
    }: {
      storeOptions: typeof defaultStoreMockOptions
      clientService: ReturnType<typeof defaultComponentMocks>['$clientService']
    }
  ) => void
  abilities?
}) {
  const storeOptions = {
    ...defaultStoreMockOptions
  }
  storeOptions.modules.runtime.modules.spaces.getters.spaces = jest.fn(() => spaces)
  const store = createStore(storeOptions)
  const mocks = defaultComponentMocks({
    currentRoute: mock<RouteLocation>({ name: 'files-spaces-projects' })
  })
  return {
    mocks,
    wrapper: getComposableWrapper(
      () => {
        const instance = useSpaceActionsDuplicate({ store })
        setup(instance, { storeOptions, clientService: mocks.$clientService })
      },
      {
        mocks,
        provide: mocks,
        store,
        pluginOptions: { abilities }
      }
    )
  }
}
