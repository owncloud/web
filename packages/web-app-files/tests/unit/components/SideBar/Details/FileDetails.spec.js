import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'
import FileDetails from '../../../../../src/components/SideBar/Details/FileDetails.vue'
import stubs from '../../../../../../../tests/unit/stubs'
import GetTextPlugin from 'vue-gettext'
import AsyncComputed from 'vue-async-computed'
import { ShareTypes } from '../../../../../src/helpers/share'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(AsyncComputed)
localVue.use(GetTextPlugin, {
  translations: 'does-not-matter.json',
  silent: true
})
const OcTooltip = jest.fn()

const simpleOwnFolder = {
  id: '1',
  type: 'folder',
  ownerId: 'marie',
  ownerDisplayName: 'Marie',
  mdate: 'Wed, 21 Oct 2015 07:28:00 GMT',
  size: '740'
}

const sharedFolder = {
  id: '2',
  type: 'folder',
  ownerId: 'einstein',
  ownerDisplayName: 'Einstein',
  mdate: 'Wed, 21 Oct 2015 07:28:00 GMT',
  size: '740',
  shareTypes: [ShareTypes.user.value]
}

const simpleOwnFile = {
  id: '3',
  type: 'file',
  ownerId: 'marie',
  ownerDisplayName: 'Marie',
  mdate: 'Wed, 21 Oct 2015 07:28:00 GMT',
  size: '740'
}

const sharedFile = {
  id: '4',
  path: '/Shares/123.png',
  type: 'file',
  ownerId: 'einstein',
  ownerDisplayName: 'Einstein',
  preview: 'example.com/image',
  thumbnail: 'example.com/image',
  mdate: 'Tue, 20 Oct 2015 06:15:00 GMT',
  size: '740',
  shareTypes: [ShareTypes.user.value]
}

const formDateFromJSDate = jest.fn().mockImplementation(() => 'ABSOLUTE_TIME')
const formDateFromHTTP = jest.fn().mockImplementation(() => 'ABSOLUTE_TIME')
const refreshShareDetailsTree = jest.fn()

beforeEach(() => {
  formDateFromJSDate.mockClear()
  formDateFromHTTP.mockClear()
  refreshShareDetailsTree.mockReset()
})

describe('Details SideBar Panel', () => {
  describe('displays a resource of type folder', () => {
    describe('on a private page', () => {
      it('with timestamp, size info and (me) as owner', () => {
        const wrapper = createWrapper(simpleOwnFolder)
        expect(wrapper).toMatchSnapshot()
      })
      it('with timestamp, size info, share info and share date', () => {
        const wrapper = createWrapper(sharedFolder)
        expect(wrapper).toMatchSnapshot()
      })
    })
    describe('on a public page', () => {
      it('with owner, timestamp, size info and no share info', () => {
        const wrapper = createWrapper(sharedFolder, [], null, true)
        expect(wrapper).toMatchSnapshot()
      })
    })
  })
  describe('displays a resource of type file', () => {
    describe('on a private page', () => {
      it('with timestamp, size info and (me) as owner', () => {
        const wrapper = createWrapper(simpleOwnFile)
        expect(wrapper).toMatchSnapshot()
      })
      it('with timestamp, size info, share info, share date and preview', () => {
        const wrapper = createWrapper(sharedFile)
        expect(wrapper).toMatchSnapshot()
      })

      it('updates when the shareTree updates', async () => {
        const wrapper = createWrapper(sharedFile)
        expect(refreshShareDetailsTree).toBeCalledTimes(1)

        // make sure this renders once when initial sharesTree become available
        wrapper.vm.$store.state.Files.sharesTree = {
          '/Shares': [{}]
        }

        await wrapper.vm.$nextTick
        expect(wrapper).toMatchSnapshot()

        // ... and renders again when the relevant shares become available
        wrapper.vm.$store.state.Files.sharesTree = {
          '/Shares': [{}],
          '/Shares/123.png': [
            {
              shareType: 0,
              owner: {
                name: 'marie',
                displayName: 'Marie Curie'
              },
              stime: 12345
            }
          ]
        }
        await wrapper.vm.$nextTick
        expect(wrapper).toMatchSnapshot()
      })
    })
    describe('on a public page', () => {
      it('with owner, timestap, size info, no share info and preview', () => {
        const wrapper = createWrapper(sharedFile, [], null, true)
        expect(wrapper).toMatchSnapshot()
      })
      it('with owner, timestamp, size info, no share info and preview', () => {
        const wrapper = createWrapper(sharedFile, [], null, true)
        expect(wrapper).toMatchSnapshot()
      })
    })
  })
})

function createWrapper(testResource, testVersions = [], testPreview, publicRoute = false) {
  return shallowMount(FileDetails, {
    store: new Vuex.Store({
      getters: {
        user: function () {
          return { id: 'marie' }
        }
      },
      modules: {
        Files: {
          namespaced: true,
          state: {
            sharesTree: {}
          },
          getters: {
            highlightedFile: function () {
              return testResource
            },
            versions: function () {
              return 2
            },
            sharesTreeLoading: function () {
              return false
            },
            sharesTree: function (state) {
              return state.sharesTree
            }
          },
          actions: {
            loadVersions: function () {
              return testVersions
            },
            loadPreview: function () {
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
    mixins: [
      {
        methods: {
          formDateFromJSDate,
          formDateFromHTTP,
          refreshShareDetailsTree
        }
      }
    ],
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
