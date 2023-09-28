import { DateTime } from 'luxon'
import FileVersions from 'web-app-files/src/components/SideBar/Versions/FileVersions.vue'
import { defaultStubs } from 'web-test-helpers'
import { mock, mockDeep } from 'jest-mock-extended'
import { Resource } from 'web-client'
import { ShareSpaceResource } from 'web-client/src/helpers'
import { DavPermission } from 'web-client/src/webdav/constants'
import {
  createStore,
  defaultPlugins,
  mount,
  shallowMount,
  defaultStoreMockOptions
} from 'web-test-helpers'

jest.mock('@ownclouders/web-pkg')

const yesterday = DateTime.now().minus({ days: 1 }).toHTTP()
const sevenDaysBefore = DateTime.now().minus({ days: 7 }).toHTTP()
const defaultVersions = [
  {
    fileInfo: {
      '{DAV:}getcontentlength': '23',
      '{DAV:}getcontenttype': 'text/plain',
      '{DAV:}getetag': '"82add182994ade91e3d5bc47571ea731"',
      '{DAV:}getlastmodified': yesterday,
      '{DAV:}resourcetype': ''
    },
    name: '/meta/2147524174/v/1625818937',
    tusSupport: null,
    type: 'file'
  },
  {
    fileInfo: {
      '{DAV:}getcontentlength': '11',
      '{DAV:}getcontenttype': 'text/plain',
      '{DAV:}getetag': '"311b3319ebc7063069a15ee02b926298"',
      '{DAV:}getlastmodified': sevenDaysBefore,
      '{DAV:}resourcetype': ''
    },
    name: '/meta/2147524174/v/1625637401',
    tusSupport: null,
    type: 'file'
  }
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
  describe('loading is true', () => {
    // fetchFileVersion is fired up when the wrapper is mounted and it sets loading to false
    // so the function needs to be mocked to get a loading wrapper
    jest.spyOn((FileVersions as any).methods, 'fetchFileVersions').mockImplementation()
    const { wrapper } = getMountedWrapper({ mountType: shallowMount })
    wrapper.vm.loading = true

    it('should show oc loader component', () => {
      expect(wrapper.find(loadingStubSelector).exists()).toBeTruthy()
    })

    it('should not show versions table', () => {
      expect(wrapper.find(versionTableStubSelector).exists()).toBeFalsy()
    })

    it('should show no versions message', () => {
      expect(wrapper.find(selectors.noVersionsMessage).exists()).toBeTruthy()
    })
  })

  describe('when loading is false', () => {
    it('should not show oc loader component', () => {
      const { wrapper } = getMountedWrapper({ mountType: shallowMount })
      expect(wrapper.find(loadingStubSelector).exists()).toBeFalsy()
    })

    it('should show no versions message if hasVersion is falsy', () => {
      const { wrapper } = getMountedWrapper({ mountType: shallowMount, versions: [] })
      const noVersionsMessageElement = wrapper.find(selectors.noVersionsMessage)

      expect(noVersionsMessageElement.text()).toBe('No Versions available for this file')
    })

    describe('currentVersionId method', () => {
      it('should return last item from slitted file name', () => {
        const { wrapper } = getMountedWrapper({ mountType: shallowMount })
        expect(wrapper.vm.currentVersionId({ name: '/meta/2147525688/v/1616851438' })).toBe(
          '1616851438'
        )
      })
    })

    describe('when hasVersion is truthy', () => {
      describe('versions table', () => {
        it('should show item last modified date', () => {
          const { wrapper } = getMountedWrapper({ mountType: shallowMount })
          const dateElement = wrapper.findAll(selectors.lastModifiedDate)

          expect(dateElement.length).toBe(2)
          expect(dateElement.at(0).text()).toBe('1 day ago')
          expect(dateElement.at(1).text()).toBe('7 days ago')
        })
        it('should show item content length', () => {
          const { wrapper } = getMountedWrapper({ mountType: shallowMount })
          const contentLengthElement = wrapper.findAll(selectors.resourceSize)

          expect(contentLengthElement.length).toBe(2)
          expect(contentLengthElement.at(0).text()).toBe('23 B')
          expect(contentLengthElement.at(1).text()).toBe('11 B')
        })
        describe('row actions', () => {
          const spyRevertFunction = jest
            .spyOn((FileVersions as any).methods, 'revertVersion')
            .mockImplementation()
          const spyDownloadFunction = jest
            .spyOn((FileVersions as any).methods, 'downloadVersion')
            .mockImplementation()

          describe('reverting versions', () => {
            it('should be possible for a non-share', () => {
              const { wrapper } = getMountedWrapper()
              const revertVersionButton = wrapper.findAll(selectors.revertVersionButton)
              expect(revertVersionButton.length).toBe(2)
            })
            it('should be possible for a share with write permissions', () => {
              const resource = mockDeep<Resource>({
                permissions: DavPermission.Updateable,
                share: undefined
              })
              const space = mockDeep<ShareSpaceResource>({ driveType: 'share' })
              const { wrapper } = getMountedWrapper({ resource, space })
              const revertVersionButton = wrapper.findAll(selectors.revertVersionButton)
              expect(revertVersionButton.length).toBe(2)
            })
            it('should not be possible for a share with read-only permissions', () => {
              const resource = mockDeep<Resource>({ permissions: '', share: undefined })
              const space = mockDeep<ShareSpaceResource>({ driveType: 'share' })
              const { wrapper } = getMountedWrapper({ resource, space })
              const revertVersionButton = wrapper.findAll(selectors.revertVersionButton)
              expect(revertVersionButton.length).toBe(0)
            })
            it('should call revertVersion method when revert version button is clicked', async () => {
              const { wrapper } = getMountedWrapper()
              const revertVersionButton = wrapper.findAll(selectors.revertVersionButton)

              expect(revertVersionButton.length).toBe(2)
              expect(spyRevertFunction).not.toHaveBeenCalled()

              await revertVersionButton.at(0).trigger('click')

              expect(spyRevertFunction).toHaveBeenCalledTimes(1)
              expect(spyRevertFunction).toHaveBeenCalledWith(defaultVersions[0])
            })
          })

          it('should call downloadVersion method when download version button is clicked', async () => {
            const { wrapper } = getMountedWrapper()
            const downloadVersionButton = wrapper.findAll(selectors.downloadVersionButton)

            expect(downloadVersionButton.length).toBe(2)
            expect(spyDownloadFunction).not.toHaveBeenCalled()

            await downloadVersionButton.at(0).trigger('click')

            expect(spyDownloadFunction).toHaveBeenCalledTimes(1)
            expect(spyDownloadFunction).toHaveBeenCalledWith(defaultVersions[0])
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
  resource = mock<Resource>()
} = {}) {
  const storeOptions = defaultStoreMockOptions
  storeOptions.modules.Files.getters.versions.mockImplementation(() => versions)
  const store = createStore(storeOptions)
  return {
    wrapper: mountType(FileVersions, {
      global: {
        renderStubDefaultSlot: true,
        provide: { space, resource },
        stubs: {
          ...defaultStubs,
          'oc-td': true,
          'oc-tr': true,
          'oc-tbody': true,
          'oc-table-simple': true,
          'oc-resource-icon': true,
          OcButton: false
        },
        plugins: [...defaultPlugins(), store]
      }
    })
  }
}
