import { DateTime } from 'luxon'
import FileVersions from 'web-app-files/src/components/SideBar/Versions/FileVersions.vue'
import { defaultComponentMocks, defaultStubs } from 'web-test-helpers'
import { mock, mockDeep } from 'jest-mock-extended'
import { Resource } from '@ownclouders/web-client'
import { ShareResource, ShareSpaceResource } from '@ownclouders/web-client/src/helpers'
import { DavPermission } from '@ownclouders/web-client/src/webdav/constants'
import { defaultPlugins, mount, shallowMount } from 'web-test-helpers'
import { useDownloadFile, useResourcesStore } from '@ownclouders/web-pkg'
import { computed } from 'vue'

jest.mock('@ownclouders/web-pkg', () => ({
  ...jest.requireActual('@ownclouders/web-pkg'),
  useDownloadFile: jest.fn()
}))

const yesterday = DateTime.now().minus({ days: 1 }).toHTTP()
const sevenDaysBefore = DateTime.now().minus({ days: 7 }).toHTTP()
const defaultVersions = [
  mock<Resource>({
    name: '1625818937',
    size: '23',
    mimeType: 'text/plain',
    etag: '82add182994ade91e3d5bc47571ea731',
    mdate: yesterday,
    type: ''
  }),
  mock<Resource>({
    name: '1625637401',
    size: '11',
    mimeType: 'text/plain',
    etag: '311b3319ebc7063069a15ee02b926298',
    mdate: sevenDaysBefore,
    type: ''
  })
]

const loadingStubSelector = 'oc-loader-stub'
const versionTableStubSelector = 'oc-simple-table-stub'

const selectors = {
  noVersionsMessage: '[data-testid="file-versions-no-versions"]',
  lastModifiedDate: '[data-testid="file-versions-file-last-modified-date"]',
  resourceSize: '[data-testid="file-versions-file-size"]',
  revertVersionButton: '[data-testid="file-versions-revert-button"]',
  downloadVersionButton: '[data-testid="file-versions-download-button"]'
}

describe('FileVersions', () => {
  describe('versions are loading', () => {
    const { wrapper } = getMountedWrapper({
      mountType: shallowMount,
      loadingStateDelay: 500
    })

    it('should show oc loader component', () => {
      expect(wrapper.find(loadingStubSelector).exists()).toBeTruthy()
    })

    it('should not show versions list', () => {
      expect(wrapper.find(versionTableStubSelector).exists()).toBeFalsy()
    })

    it('should not show no versions message', () => {
      expect(wrapper.find(selectors.noVersionsMessage).exists()).toBeFalsy()
    })
  })

  describe('versions are loaded', () => {
    it('should not show oc loader component', async () => {
      const { wrapper } = getMountedWrapper({ mountType: shallowMount })
      await wrapper.vm.fetchVersionsTask.last
      await wrapper.vm.$nextTick()
      expect(wrapper.find(loadingStubSelector).exists()).toBeFalsy()
    })

    it('should show no versions message if there are no versions', async () => {
      const { wrapper } = getMountedWrapper({ mountType: shallowMount, versions: [] })
      await wrapper.vm.fetchVersionsTask.last
      const noVersionsMessageElement = wrapper.find(selectors.noVersionsMessage)

      expect(noVersionsMessageElement.text()).toBe('No Versions available for this file')
    })

    describe('when the file has versions', () => {
      describe('versions list', () => {
        it('should show last modified date of each version', async () => {
          const { wrapper } = getMountedWrapper({ mountType: shallowMount })
          await wrapper.vm.fetchVersionsTask.last
          const dateElement = wrapper.findAll(selectors.lastModifiedDate)

          expect(dateElement.length).toBe(2)
          expect(dateElement.at(0).text()).toBe('1 day ago')
          expect(dateElement.at(1).text()).toBe('7 days ago')
        })
        it('should show content length of each version', async () => {
          const { wrapper } = getMountedWrapper({ mountType: shallowMount })
          await wrapper.vm.fetchVersionsTask.last
          const contentLengthElement = wrapper.findAll(selectors.resourceSize)

          expect(contentLengthElement.length).toBe(2)
          expect(contentLengthElement.at(0).text()).toBe('23 B')
          expect(contentLengthElement.at(1).text()).toBe('11 B')
        })
        describe('row actions', () => {
          describe('reverting to a specific version', () => {
            it('should be possible for a non-share', async () => {
              const { wrapper } = getMountedWrapper()
              await wrapper.vm.fetchVersionsTask.last
              const revertVersionButton = wrapper.findAll(selectors.revertVersionButton)
              expect(revertVersionButton.length).toBe(defaultVersions.length)
            })
            it('should be possible for a share with write permissions', async () => {
              const resource = mockDeep<ShareResource>({
                permissions: DavPermission.Updateable,
                share: undefined
              })
              const space = mockDeep<ShareSpaceResource>({ driveType: 'share' })
              const { wrapper } = getMountedWrapper({ resource, space })
              await wrapper.vm.fetchVersionsTask.last
              const revertVersionButton = wrapper.findAll(selectors.revertVersionButton)
              expect(revertVersionButton.length).toBe(defaultVersions.length)
            })
            it('should not be possible for a share with read-only permissions', async () => {
              const resource = mockDeep<ShareResource>({ permissions: '', share: undefined })
              const space = mockDeep<ShareSpaceResource>({ driveType: 'share' })
              const { wrapper } = getMountedWrapper({ resource, space })
              await wrapper.vm.fetchVersionsTask.last
              const revertVersionButton = wrapper.findAll(selectors.revertVersionButton)
              expect(revertVersionButton.length).toBe(0)
            })
            it('should call UPDATE_RESOURCE_FIELD mutation when revert button is clicked', async () => {
              const { wrapper } = getMountedWrapper()
              await wrapper.vm.fetchVersionsTask.last
              const revertVersionButton = wrapper.findAll(selectors.revertVersionButton)
              const { updateResourceField } = useResourcesStore()

              expect(revertVersionButton.length).toBe(defaultVersions.length)
              expect(updateResourceField).not.toHaveBeenCalled()

              await revertVersionButton.at(0).trigger('click')

              expect(updateResourceField).toHaveBeenCalledTimes(2)
            })
          })

          it('should call downloadFile method when download version button is clicked', async () => {
            const { wrapper, mocks } = getMountedWrapper()
            await wrapper.vm.fetchVersionsTask.last
            const downloadVersionButton = wrapper.findAll(selectors.downloadVersionButton)

            expect(downloadVersionButton.length).toBe(defaultVersions.length)
            expect(mocks.downloadFile).not.toHaveBeenCalled()

            await downloadVersionButton.at(0).trigger('click')

            expect(mocks.downloadFile).toHaveBeenCalledTimes(1)
          })
        })
      })
    })
  })
})

function getMountedWrapper({
  mountType = mount,
  space = undefined,
  versions = defaultVersions,
  resource = mock<Resource>({ id: '1', size: 0, mdate: '' }),
  loadingStateDelay = 0
} = {}) {
  const downloadFile = jest.fn()
  jest.mocked(useDownloadFile).mockReturnValue({ downloadFile })
  const mocks = {
    ...defaultComponentMocks(),
    downloadFile
  }
  mocks.$clientService.webdav.getFileInfo.mockResolvedValue(mock<Resource>({ id: '1' }))
  mocks.$clientService.webdav.listFileVersions.mockImplementation(() => {
    if (loadingStateDelay > 0) {
      return new Promise((res) => setTimeout(() => res(versions), loadingStateDelay))
    }
    return new Promise((res) => res(versions))
  })

  return {
    wrapper: mountType(FileVersions, {
      global: {
        mocks,
        renderStubDefaultSlot: true,
        provide: { space: computed(() => space), resource: computed(() => resource), ...mocks },
        stubs: {
          ...defaultStubs,
          'oc-td': true,
          'oc-tr': true,
          'oc-tbody': true,
          'oc-table-simple': true,
          'oc-resource-icon': true,
          OcButton: false
        },
        plugins: [...defaultPlugins()]
      }
    }),
    mocks
  }
}
