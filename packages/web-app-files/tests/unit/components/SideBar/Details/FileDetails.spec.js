import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'
import FileDetails from 'packages/web-app-files/src/components/SideBar/Details/FileDetails.vue'
import stubs from '../../../../../../../tests/unit/stubs'
import GetTextPlugin from 'vue-gettext'
import AsyncComputed from 'vue-async-computed'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(AsyncComputed)
localVue.use(GetTextPlugin, {
  translations: 'does-not-matter.json',
  silent: true
})
const OcTooltip = jest.fn()

const selectors = {
  noContentText: '[data-testid="noContentText"]',
  timestamp: '[data-testid="timestamp"]',
  ownerName: '[data-testid="ownerDisplayName"]',
  sharingInfo: '[data-testid="sharingInfo"]',
  sizeInfo: '[data-testid="sizeInfo"]',
  versionsInfo: '[data-testid="versionsInfo"]',
  previewImgContainer: '[data-testid="preview"]',
  sharedBy: '[data-testid="shared-by"]',
  sharedVia: '[data-testid="shared-via"]',
  sharedDate: '[data-testid="shared-date"]'
}

const simpleOwnFolder = {
  type: 'folder',
  ownerId: 'marie',
  ownerDisplayName: 'Marie',
  mdate: 'Wed, 21 Oct 2015 07:28:00 GMT',
  size: '740'
}

const sharedFolder = {
  type: 'folder',
  ownerId: 'einstein',
  ownerDisplayName: 'Einstein',
  sdate: 'Wed, 21 Oct 2015 07:28:00 GMT',
  size: '740',
  shareTypes: [0]
}

const simpleOwnFile = {
  type: 'file',
  ownerId: 'marie',
  ownerDisplayName: 'Marie',
  mdate: 'Wed, 21 Oct 2015 07:28:00 GMT',
  size: '740'
}

const sharedFile = {
  type: 'file',
  ownerId: 'einstein',
  ownerDisplayName: 'Einstein',
  preview: 'example.com/image',
  thumbnail: 'example.com/image',
  sdate: 'Wed, 21 Oct 2015 07:28:00 GMT',
  size: '740',
  shareTypes: [0]
}

describe('Details SideBar Panel', () => {
  describe('displays a resource of type folder', () => {
    describe('on a private page', () => {
      it('with timestamp, size info and (me) as owner', () => {
        const wrapper = createWrapper(simpleOwnFolder)
        expect(wrapper.find(selectors.noContentText).exists()).toBeFalsy()
        expect(wrapper.find(selectors.timestamp).exists()).toBeTruthy()
        expect(wrapper.find(selectors.ownerName).exists()).toBeTruthy()
        expect(wrapper.find(selectors.ownerName).text()).toContain('(me)')
        expect(wrapper.find(selectors.sizeInfo).exists()).toBeTruthy()
        expect(wrapper.find(selectors.sharingInfo).exists()).toBeFalsy()
        expect(wrapper.find(selectors.versionsInfo).exists()).toBeFalsy()
        expect(wrapper.find(selectors.previewImgContainer).exists()).toBeFalsy()
      })
      it('with timestamp, size info, share info and share date', () => {
        const wrapper = createWrapper(sharedFolder)
        expect(wrapper.find(selectors.noContentText).exists()).toBeFalsy()
        expect(wrapper.find(selectors.timestamp).exists()).toBeTruthy()
        expect(wrapper.find(selectors.ownerName).exists()).toBeTruthy()
        expect(wrapper.find(selectors.ownerName).text()).not.toContain('(me)')
        expect(wrapper.find(selectors.sizeInfo).exists()).toBeTruthy()
        expect(wrapper.find(selectors.sharingInfo).exists()).toBeTruthy()
        expect(wrapper.find(selectors.versionsInfo).exists()).toBeFalsy()
        expect(wrapper.find(selectors.previewImgContainer).exists()).toBeFalsy()
      })
    })
    describe('on a public page', () => {
      it('with owner, timestamp, size info and no share info', () => {
        const wrapper = createWrapper(sharedFolder, [], null, true)
        expect(wrapper.find(selectors.noContentText).exists()).toBeFalsy()
        expect(wrapper.find(selectors.timestamp).exists()).toBeTruthy()
        expect(wrapper.find(selectors.ownerName).exists()).toBeTruthy()
        expect(wrapper.find(selectors.ownerName).text()).not.toContain('(me)')
        expect(wrapper.find(selectors.sizeInfo).exists()).toBeTruthy()
        expect(wrapper.find(selectors.sharingInfo).exists()).toBeFalsy()
        expect(wrapper.find(selectors.versionsInfo).exists()).toBeFalsy()
        expect(wrapper.find(selectors.previewImgContainer).exists()).toBeFalsy()
        expect(wrapper.find(selectors.sharedBy).exists()).toBeFalsy()
        expect(wrapper.find(selectors.sharedDate).exists()).toBeFalsy()
      })
    })
  })
  describe('displays a resource of type file', () => {
    describe('on a private page', () => {
      it('with timestamp, size info and (me) as owner', () => {
        const wrapper = createWrapper(simpleOwnFile)
        expect(wrapper.find(selectors.noContentText).exists()).toBeFalsy()
        expect(wrapper.find(selectors.timestamp).exists()).toBeTruthy()
        expect(wrapper.find(selectors.ownerName).exists()).toBeTruthy()
        expect(wrapper.find(selectors.ownerName).text()).toContain('(me)')
        expect(wrapper.find(selectors.sizeInfo).exists()).toBeTruthy()
        expect(wrapper.find(selectors.sharingInfo).exists()).toBeFalsy()
        expect(wrapper.find(selectors.versionsInfo).exists()).toBeFalsy()
        expect(wrapper.find(selectors.previewImgContainer).exists()).toBeFalsy()
      })
      it('with timestamp, size info, share info, share date and preview', () => {
        const wrapper = createWrapper(sharedFile)
        expect(wrapper.find(selectors.noContentText).exists()).toBeFalsy()
        expect(wrapper.find(selectors.timestamp).exists()).toBeTruthy()
        expect(wrapper.find(selectors.ownerName).exists()).toBeTruthy()
        expect(wrapper.find(selectors.ownerName).text()).not.toContain('(me)')
        expect(wrapper.find(selectors.sizeInfo).exists()).toBeTruthy()
        expect(wrapper.find(selectors.sharingInfo).exists()).toBeTruthy()
        expect(wrapper.find(selectors.versionsInfo).exists()).toBeFalsy()
        expect(wrapper.find(selectors.previewImgContainer).exists()).toBeTruthy()
      })
    })
    describe('on a public page', () => {
      it('with owner, timestamp, size info, no share info and preview', () => {
        const wrapper = createWrapper(sharedFile, [], null, true)
        expect(wrapper.find(selectors.noContentText).exists()).toBeFalsy()
        expect(wrapper.find(selectors.timestamp).exists()).toBeTruthy()
        expect(wrapper.find(selectors.ownerName).exists()).toBeTruthy()
        expect(wrapper.find(selectors.ownerName).text()).not.toContain('(me)')
        expect(wrapper.find(selectors.sizeInfo).exists()).toBeTruthy()
        expect(wrapper.find(selectors.sharingInfo).exists()).toBeFalsy()
        expect(wrapper.find(selectors.versionsInfo).exists()).toBeFalsy()
        expect(wrapper.find(selectors.previewImgContainer).exists()).toBeTruthy()
      })
      it('with owner, timestamp, size info, no share info and preview', () => {
        const wrapper = createWrapper(sharedFile, [], null, true)
        expect(wrapper.find(selectors.noContentText).exists()).toBeFalsy()
        expect(wrapper.find(selectors.timestamp).exists()).toBeTruthy()
        expect(wrapper.find(selectors.ownerName).exists()).toBeTruthy()
        expect(wrapper.find(selectors.ownerName).text()).not.toContain('(me)')
        expect(wrapper.find(selectors.sizeInfo).exists()).toBeTruthy()
        expect(wrapper.find(selectors.sharingInfo).exists()).toBeFalsy()
        expect(wrapper.find(selectors.versionsInfo).exists()).toBeFalsy()
        expect(wrapper.find(selectors.previewImgContainer).exists()).toBeTruthy()
      })
    })
  })
})

function createWrapper(testResource, testVersions = [], testPreview, publicRoute = false) {
  return shallowMount(FileDetails, {
    store: new Vuex.Store({
      getters: {
        user: function() {
          return { id: 'marie' }
        }
      },
      modules: {
        Files: {
          namespaced: true,
          getters: {
            highlightedFile: function() {
              return testResource
            },
            versions: function() {
              return 2
            },
            sharesTreeLoading: function() {
              return false
            }
          },
          actions: {
            loadVersions: function() {
              return testVersions
            },
            loadPreview: function() {
              return testPreview
            },
            loadSharesTree: jest.fn()
          }
        }
      }
    }),
    localVue,
    stubs: stubs,
    directives: {
      OcTooltip
    },
    mocks: {
      $route: {
        meta: {
          auth: !publicRoute
        }
      }
    },
    provide: {
      displayedItem: {
        value: testResource
      }
    }
  })
}
