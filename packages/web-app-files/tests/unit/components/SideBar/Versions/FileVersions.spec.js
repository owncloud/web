import Vuex from 'vuex'
import { DateTime } from 'luxon'
import stubs from '@/tests/unit/stubs'
import GetTextPlugin from 'vue-gettext'
import DesignSystem from 'owncloud-design-system'
import { mount, shallowMount, createLocalVue } from '@vue/test-utils'
import FileVersions from '@files/src/components/SideBar/Versions/FileVersions.vue'

const defaultStubs = {
  ...stubs,
  'oc-td': true,
  'oc-tr': true,
  'oc-tbody': true,
  'oc-table-simple': true
}

const yesterday = DateTime.now().minus({ days: 1 }).toHTTP()

const sevenDaysBefore = DateTime.now().minus({ days: 7 }).toHTTP()

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(DesignSystem)
localVue.use(GetTextPlugin, {
  translations: 'does-not-matter.json',
  silent: true
})

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
  fileTypeIcon: '[data-testid="file-versions-file-icon"] oc-resource-icon-stub',
  lastModifiedDate: '[data-testid="file-versions-file-last-modified-date"]',
  resourceSize: '[data-testid="file-versions-file-size"]',
  revertVersionButton: '[data-testid="file-versions-revert-button"]',
  downloadVersionButton: '[data-testid="file-versions-download-button"]'
}

const mapActions = {
  loadVersions: jest.fn()
}

describe('FileVersions', () => {
  describe('loading is true', () => {
    // fetchFileVersion is fired up when the wrapper is mounted and it sets loading to false
    // so the function needs to be mocked to get a loading wrapper
    jest.spyOn(FileVersions.methods, 'fetchFileVersions').mockImplementation()
    const wrapper = getShallowWrapper(createStore(), true)

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
    const store = createStore({ versions: [] })
    const wrapper = getShallowWrapper(store)

    it('should not show oc loader component', () => {
      expect(wrapper.find(loadingStubSelector).exists()).toBeFalsy()
    })

    it('should show no versions message if hasVersion is falsy', () => {
      const noVersionsMessageElement = wrapper.find(selectors.noVersionsMessage)

      expect(noVersionsMessageElement.text()).toBe('No Versions available for this file')
    })

    describe('currentVersionId method', () => {
      it('should return last item from slitted file name', () => {
        expect(wrapper.vm.currentVersionId({ name: '/meta/2147525688/v/1616851438' })).toBe(
          '1616851438'
        )
      })
    })

    describe('when hasVersion is truthy', () => {
      describe('versions table', () => {
        it('should render icon according to file type', () => {
          const store = createStore({
            highlightedFile: { name: 'lorem.png', extension: 'png', type: 'file' },
            versions: [
              {
                fileInfo: {
                  '{DAV:}getcontentlength': '55474',
                  '{DAV:}getcontenttype': 'image/jpeg',
                  '{DAV:}getetag': '"156c87c7f5b017e55b38e1d188493f45"',
                  '{DAV:}getlastmodified': 'Sat, 27 Mar 2021 13:23:58 GMT',
                  '{DAV:}resourcetype': ''
                },
                name: '/meta/2147525688/v/1616851438',
                tusSupport: null,
                type: 'file'
              }
            ]
          })
          const wrapper = getShallowWrapper(store)

          const iconElements = wrapper.findAll(selectors.fileTypeIcon)

          expect(iconElements.length).toBe(1)
        })
        it('should show item last modified date', () => {
          const wrapper = getShallowWrapper(createStore())
          const dateElement = wrapper.findAll(selectors.lastModifiedDate)

          expect(dateElement.length).toBe(2)
          expect(dateElement.at(0).text()).toBe('1 day ago')
          expect(dateElement.at(1).text()).toBe('7 days ago')
        })
        it('should show item content length', () => {
          const wrapper = getShallowWrapper(createStore())
          const contentLengthElement = wrapper.findAll(selectors.resourceSize)

          expect(contentLengthElement.length).toBe(2)
          expect(contentLengthElement.at(0).text()).toBe('23 B')
          expect(contentLengthElement.at(1).text()).toBe('11 B')
        })
        describe('row actions', () => {
          const spyRevertFunction = jest
            .spyOn(FileVersions.methods, 'revertVersion')
            .mockImplementation((file) => {})
          const spyDownloadFunction = jest
            .spyOn(FileVersions.methods, 'downloadVersion')
            .mockImplementation((file) => {})
          const wrapper = getMountedWrapper(createStore())

          it('should call revertVersion method when revert version button is clicked', async () => {
            const revertVersionButton = wrapper.findAll(selectors.revertVersionButton)

            expect(revertVersionButton.length).toBe(2)
            expect(spyRevertFunction).not.toHaveBeenCalled()

            await revertVersionButton.at(0).trigger('click')

            expect(spyRevertFunction).toHaveBeenCalledTimes(1)
            expect(spyRevertFunction).toHaveBeenCalledWith(defaultVersions[0])
          })

          it('should call downloadVersion method when download version button is clicked', async () => {
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

function getMountOptions({ store, loading = false, stubs = defaultStubs }) {
  return {
    localVue,
    store: store,
    stubs: stubs,
    directives: {
      'oc-tooltip': true
    },
    data() {
      return {
        loading: loading
      }
    }
  }
}

function getShallowWrapper(store, loading = false) {
  return shallowMount(FileVersions, getMountOptions({ store: store, loading: loading }))
}

function getMountedWrapper(store) {
  return mount(
    FileVersions,
    getMountOptions({
      store: store,
      stubs: {
        ...defaultStubs,
        'oc-resource-icon': true,
        'oc-button': false
      }
    })
  )
}

function createStore({
  highlightedFile = {
    id: 1223,
    name: 'lorem.txt',
    path: '/lorem.txt'
  },
  versions = defaultVersions
} = {}) {
  return new Vuex.Store({
    getters: {
      getToken: function () {
        return 'token'
      }
    },
    modules: {
      Files: {
        namespaced: true,
        getters: {
          highlightedFile: function () {
            return highlightedFile
          },
          versions: function () {
            return versions
          }
        },
        actions: mapActions
      }
    }
  })
}
