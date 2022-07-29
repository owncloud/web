import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import GetTextPlugin from 'vue-gettext'

import stubs from '@/tests/unit/stubs'

import FileInfo from '@files/src/components/SideBar/FileInfo.vue'

const simpleOwnFile = {
  type: 'file',
  ownerId: 'marie',
  ownerDisplayName: 'Marie',
  mdate: 'Wed, 21 Oct 2015 07:28:00 GMT',
  size: '740'
}

const simpleDeletedFile = {
  type: 'file',
  ownerId: 'bob',
  ownerDisplayName: 'Bob',
  ddate: 'Wed, 21 Oct 2015 09:29:00 GMT'
}

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(GetTextPlugin, {
  translations: 'does-not-matter.json',
  silent: true
})

const selectors = {
  name: '[data-testid="files-info-name"]',
  mdate: '[data-testid="files-info-mdate"]'
}

const formDateFromRFC = jest.fn()
const formRelativeDateFromRFC = jest.fn()
const resetDateMocks = () => {
  formDateFromRFC.mockReset()
  formRelativeDateFromRFC.mockReset()
  formDateFromRFC.mockImplementation(() => 'ABSOLUTE_TIME')
  formRelativeDateFromRFC.mockImplementation(() => 'RELATIVE_TIME')
}

describe('FileInfo', () => {
  it('shows file info', () => {
    resetDateMocks()

    const tooltipStub = jest.fn()
    const wrapper = createWrapper(simpleOwnFile, tooltipStub)
    expect(wrapper.find(selectors.name).exists()).toBeTruthy()
  })
})


function createWrapper(testResource, tooltipStub, routeName, privateLinksEnabled = false) {
  return shallowMount(FileInfo, {
    store: new Vuex.Store({
      getters: {
        user: function () {
          return { id: 'marie' }
        },
        capabilities: jest.fn(() => ({
          files: {
            privateLinks: privateLinksEnabled
          }
        }))
      },
      modules: {
        Files: {
          namespaced: true,
          getters: {
            highlightedFile: function () {
              return testResource
            }
          }
        }
      }
    }),
    localVue,
    stubs: {
      ...stubs,
      'oc-resource-icon': true,
      'oc-resource-name': true
    },
    directives: {
      OcTooltip: tooltipStub
    },
    mixins: [
      {
        methods: {
          formDateFromRFC,
          formRelativeDateFromRFC
        }
      }
    ],
    mocks: {
      $route: {
        path: '/files'
      },
      $router: {
        currentRoute: {
          name: routeName || 'some-route',
          query: { page: 1 }
        },
        resolve: (r) => ({ href: r.name })
      }
    },
    provide: {
      displayedItem: {
        value: testResource
      }
    }
  })
}
