import { mock } from 'jest-mock-extended'
import { unref } from 'vue'
import { useFileActionsDownloadArchive } from '../../../../../src/composables/actions'
import { Resource } from '@ownclouders/web-client'
import { defaultComponentMocks, RouteLocation, getComposableWrapper } from 'web-test-helpers'
import { useArchiverService } from '../../../../../src/composables'

jest.mock('../../../../../src/composables/archiverService/useArchiverService')

describe('downloadArchive', () => {
  describe('search context', () => {
    describe('computed property "actions"', () => {
      describe('handler', () => {
        it.each([
          {
            resources: [
              { id: '1', fileId: '1', canDownload: () => true },
              { id: '2', fileId: '2', canDownload: () => true }
            ] as Resource[],
            downloadableResourceIds: ['1', '2']
          },
          {
            resources: [
              { id: '1', fileId: '1', canDownload: () => true },
              { id: '2', fileId: '2', canDownload: () => true },
              { id: '3', fileId: '3', canDownload: () => true },
              { id: '4', fileId: '4', canDownload: () => false },
              { id: '5', fileId: '5', canDownload: () => true, driveType: 'project' }
            ] as Resource[],
            downloadableResourceIds: ['1', '2', '3']
          }
        ])('should filter non downloadable resources', ({ resources, downloadableResourceIds }) => {
          const triggerDownloadMock = jest.fn().mockResolvedValue(true)
          getWrapper({
            searchLocation: true,
            triggerDownloadMock,
            setup: () => {
              const { actions } = useFileActionsDownloadArchive()

              unref(actions)[0].handler({ space: null, resources })

              expect(triggerDownloadMock).toHaveBeenCalledWith({ fileIds: downloadableResourceIds })
            }
          })
        })
      })
    })
  })
})

function getWrapper({
  searchLocation = false,
  triggerDownloadMock = jest.fn() as any,
  setup = () => undefined
} = {}) {
  const routeName = searchLocation ? 'files-common-search' : 'files-spaces-generic'

  jest.mocked(useArchiverService).mockImplementation(
    () =>
      ({
        ...jest.requireActual('../../../../..//src/composables/archiverService/useArchiverService'),
        triggerDownload: triggerDownloadMock,
        fileIdsSupported: true
      }) as any
  )

  const mocks = {
    ...defaultComponentMocks({ currentRoute: mock<RouteLocation>({ name: routeName }) }),
    space: { driveType: 'personal', spaceRoles: { viewer: [], editor: [], manager: [] } }
  }

  return {
    wrapper: getComposableWrapper(setup, {
      mocks,
      provide: mocks
    })
  }
}
