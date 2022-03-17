import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import GetTextPlugin from 'vue-gettext'
import AsyncComputed from 'vue-async-computed'

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
localVue.use(AsyncComputed)
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
    expect(wrapper.find(selectors.mdate).exists()).toBeTruthy()
  })

  it('shows modification date info', () => {
    resetDateMocks()

    const tooltipStub = jest.fn()
    const wrapper = createWrapper(simpleOwnFile, tooltipStub)
    expect(tooltipStub).toHaveBeenCalledTimes(1)
    expect(formDateFromRFC).toHaveBeenCalledTimes(1)
    expect(formDateFromRFC).toHaveBeenCalledWith('Wed, 21 Oct 2015 07:28:00 GMT')
    expect(formRelativeDateFromRFC).toHaveBeenCalledTimes(1)
    expect(formRelativeDateFromRFC).toHaveBeenCalledWith('Wed, 21 Oct 2015 07:28:00 GMT')

    expect(wrapper).toMatchSnapshot()
  })

  it('shows deletion date info', () => {
    resetDateMocks()

    const tooltipStub = jest.fn()
    const wrapper = createWrapper(simpleDeletedFile, tooltipStub, 'files-trash-personal')

    expect(tooltipStub).toHaveBeenCalledTimes(1)
    expect(formDateFromRFC).toHaveBeenCalledTimes(1)
    expect(formDateFromRFC).toHaveBeenCalledWith('Wed, 21 Oct 2015 09:29:00 GMT')
    expect(formRelativeDateFromRFC).toHaveBeenCalledTimes(1)
    expect(formRelativeDateFromRFC).toHaveBeenCalledWith('Wed, 21 Oct 2015 09:29:00 GMT')

    expect(wrapper).toMatchSnapshot()
  })
})

function createWrapper(testResource, tooltipStub, routeName) {
  return shallowMount(FileInfo, {
    store: new Vuex.Store({
      getters: {
        user: function () {
          return { id: 'marie' }
        },
        capabilities: jest.fn(() => ({}))
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
      },
      publicPage: () => false
    },
    provide: {
      displayedItem: {
        value: testResource
      }
    }
  })
}
