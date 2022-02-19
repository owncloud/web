import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import GetTextPlugin from 'vue-gettext'
import AsyncComputed from 'vue-async-computed'

import stubs from '@/tests/unit/stubs'

import SpaceInfo from '@files/src/components/SideBar/SpaceInfo.vue'

const spaceMock = {
  type: 'space',
  name: ' space',
  id: '1',
  mdate: 'Wed, 21 Oct 2015 07:28:00 GMT',
  spaceQuota: {
    used: 100
  }
}

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(AsyncComputed)
localVue.use(GetTextPlugin, {
  translations: 'does-not-matter.json',
  silent: true
})

const selectors = {
  name: '[data-testid="space-info-name"]',
  subtitle: '[data-testid="space-info-subtitle"]'
}

const formDateFromRFC = jest.fn()
const formRelativeDateFromRFC = jest.fn()
const resetDateMocks = () => {
  formDateFromRFC.mockReset()
  formRelativeDateFromRFC.mockReset()
  formDateFromRFC.mockImplementation(() => 'ABSOLUTE_TIME')
  formRelativeDateFromRFC.mockImplementation(() => 'RELATIVE_TIME')
}

describe('SpaceInfo', () => {
  it('shows space info', () => {
    resetDateMocks()

    const wrapper = createWrapper(spaceMock)
    expect(wrapper.find(selectors.name).exists()).toBeTruthy()
    expect(wrapper.find(selectors.subtitle).exists()).toBeTruthy()
    expect(wrapper).toMatchSnapshot()
  })
})

function createWrapper(spaceResource) {
  return shallowMount(SpaceInfo, {
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
              return spaceResource
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
      OcTooltip: null
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
      $router: {
        currentRoute: {
          name: 'some-route',
          query: { page: 1 }
        },
        resolve: (r) => ({ href: r.name })
      },
      publicPage: () => false
    },
    provide: {
      displayedItem: {
        value: spaceResource
      }
    }
  })
}
