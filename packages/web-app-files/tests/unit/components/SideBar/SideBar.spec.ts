import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'
import GetTextPlugin from 'vue-gettext'
import fileSideBars from 'web-app-files/src/fileSideBars'
import { ClientService } from 'web-pkg/src/services'
import { createLocationPublic, createLocationSpaces } from '../../../../src/router'

import InnerSideBar from 'web-pkg/src/components/sideBar/SideBar.vue'
import SideBar from 'web-app-files/src/components/SideBar/SideBar.vue'
import { mockDeep } from 'jest-mock-extended'
import { defaultStubs } from 'web-test-helpers/src/mocks/defaultStubs'
import { Resource } from 'web-client'
import { Location } from 'vue-router'

jest.mock('web-pkg/src/observer')

const selectors = {
  noSelectionInfoPanel: 'noselection-stub'
}

describe('SideBar', () => {
  describe('no selection info panel', () => {
    afterEach(() => {
      jest.clearAllMocks()
    })
    describe('for public links', () => {
      it.each([
        [
          'shows in root node',
          {
            path: '',
            noSelectionExpected: true
          }
        ],
        [
          'does not show in non-root node',
          {
            path: '/publicLinkToken/some-folder',
            noSelectionExpected: false
          }
        ]
      ])('%s', async (name, { path, noSelectionExpected }) => {
        const item = mockDeep<Resource>({ path })
        const wrapper = createWrapper({
          item,
          currentRoute: createLocationPublic('files-public-link')
        })
        await wrapper.vm.$nextTick()
        await wrapper.vm.$nextTick()
        expect(wrapper.find(selectors.noSelectionInfoPanel).exists()).toBe(noSelectionExpected)
      })
    })
    describe('for all files', () => {
      it.each([
        [
          'shows in root node',
          {
            path: '/',
            noSelectionExpected: true
          }
        ],
        [
          'does not show in non-root node',
          {
            path: '/some-folder',
            noSelectionExpected: false
          }
        ]
      ])('%s', async (name, { path, noSelectionExpected }) => {
        const item = mockDeep<Resource>({ path })
        const wrapper = createWrapper({ item })
        await wrapper.vm.$nextTick()
        await wrapper.vm.$nextTick()
        expect(wrapper.find(selectors.noSelectionInfoPanel).exists()).toBe(noSelectionExpected)
      })
    })
  })
})

function createWrapper({
  item,
  currentRoute = createLocationSpaces('files-spaces-generic')
}: {
  item: Resource
  currentRoute?: Location
}) {
  const localVue = createLocalVue()
  localVue.use(Vuex)
  localVue.use(GetTextPlugin, {
    translations: 'does-not-matter.json',
    silent: true
  })
  return shallowMount(SideBar, {
    propsData: {
      open: true
    },
    store: new Vuex.Store({
      getters: {
        user: function () {
          return { id: 'marie' }
        },
        capabilities: () => ({
          files_sharing: {
            api_enabled: true,
            public: { enabled: true }
          }
        })
      },
      modules: {
        apps: {
          getters: {
            fileSideBars: () => fileSideBars
          }
        },
        Files: {
          namespaced: true,
          state: {
            highlightedFile: item
          },
          getters: {
            highlightedFile: (state) => state.highlightedFile,
            selectedFiles: () => [],
            sharesTree: () => ({}),
            versions: () => ({})
          }
        }
      }
    }),
    localVue,
    stubs: {
      ...defaultStubs,
      SideBar: InnerSideBar,
      'oc-icon': true,
      'oc-button': true
    },
    directives: {
      'click-outside': jest.fn()
    },
    mocks: {
      $router: {
        currentRoute,
        resolve: (r) => {
          return { href: r.name }
        },
        afterEach: jest.fn()
      },
      $clientService: mockDeep<ClientService>()
    }
  })
}
