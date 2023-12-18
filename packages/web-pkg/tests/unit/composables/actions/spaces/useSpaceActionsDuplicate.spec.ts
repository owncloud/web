import { useSpaceActionsDuplicate } from '../../../../../src/composables/actions/spaces'
import { AbilityRule, SpaceResource } from '@ownclouders/web-client/src/helpers'
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
    spaceReadmeData: null,
    spaceQuota: { total: Math.pow(10, 9) }
  })
]
describe('restore', () => {
  describe('isEnabled property', () => {
    it('should be false when no resource given', () => {
      getWrapper({
        setup: ({ actions }, { storeOptions }) => {
          expect(unref(actions)[0].isEnabled({ resources: [] })).toBe(false)
        }
      })
    })
    it('should be false when the space is disabled', () => {
      getWrapper({
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
      getWrapper({
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
      getWrapper({
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
      getWrapper({
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
    it('should show error message on error', () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined)
      getWrapper({
        setup: async ({ duplicateSpace }, { storeOptions, clientService }) => {
          clientService.graphAuthenticated.drives.createDrive.mockRejectedValue(new Error())
          await duplicateSpace(spaces[0])
          expect(storeOptions.actions.showErrorMessage).toHaveBeenCalledTimes(1)
        }
      })
    })
    it('should show message on success', () => {
      getWrapper({
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
              name: 'Moon (1)',
              quota: {
                total: Math.pow(10, 9)
              }
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
    it('should upsert a space as resource on the projects page', () => {
      getWrapper({
        currentRouteName: 'files-spaces-projects',
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
          expect(storeOptions.modules.Files.mutations.UPSERT_RESOURCE).toHaveBeenCalled()
        }
      })
    })
  })
})

function getWrapper({
  setup,
  abilities = [{ action: 'create-all', subject: 'Drive' }],
  currentRouteName = 'files-spaces-generic'
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
  abilities?: AbilityRule[]
  currentRouteName?: string
}) {
  const storeOptions = {
    ...defaultStoreMockOptions
  }
  storeOptions.modules.runtime.modules.spaces.getters.spaces = jest.fn(() => spaces)
  const store = createStore(storeOptions)
  const mocks = defaultComponentMocks({
    currentRoute: mock<RouteLocation>({ name: currentRouteName })
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
