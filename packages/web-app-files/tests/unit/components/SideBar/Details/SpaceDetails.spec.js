import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'
import SpaceDetails from '../../../../../src/components/SideBar/Details/SpaceDetails.vue'
import stubs from '../../../../../../../tests/unit/stubs'
import GetTextPlugin from 'vue-gettext'
import AsyncComputed from 'vue-async-computed'
import VueCompositionAPI from '@vue/composition-api/dist/vue-composition-api'
import { ShareTypes, spaceRoleManager } from '../../../../../src/helpers/share'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(AsyncComputed)
localVue.use(VueCompositionAPI)
localVue.use(GetTextPlugin, {
  translations: 'does-not-matter.json',
  silent: true
})
const OcTooltip = jest.fn()

const spaceMock = {
  type: 'space',
  name: ' space',
  id: '1',
  mdate: 'Wed, 21 Oct 2015 07:28:00 GMT',
  spaceQuota: {
    used: 100,
    total: 1000
  }
}

const spaceShare = {
  id: '1',
  shareType: ShareTypes.space.value,
  collaborator: {
    onPremisesSamAccountName: 'Alice',
    displayName: 'alice'
  },
  role: {
    name: spaceRoleManager.name
  }
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
  it('displays the details side panel', () => {
    const wrapper = createWrapper(spaceMock)
    expect(wrapper).toMatchSnapshot()
  })
})

function createWrapper(spaceResource) {
  const component = {
    ...SpaceDetails,
    setup: () => ({
      spaceImage: '',
      owners: [],
      loadImageTask: {
        isRunning: false,
        perform: jest.fn()
      },
      loadOwnersTask: {
        isRunning: false,
        perform: jest.fn()
      }
    })
  }
  return shallowMount(component, {
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
              return spaceResource
            },
            currentFileOutgoingCollaborators: () => [spaceShare],
            currentFileOutgoingLinks: () => []
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
          formDateFromHTTP
        }
      }
    ],
    provide: {
      displayedItem: {
        value: spaceResource
      }
    }
  })
}
