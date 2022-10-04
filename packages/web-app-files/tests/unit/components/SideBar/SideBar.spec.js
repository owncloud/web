import { shallowMount, createLocalVue } from '@vue/test-utils'
import VueCompositionAPI from '@vue/composition-api'
import Vuex from 'vuex'
import GetTextPlugin from 'vue-gettext'
import fileSideBars from '@files/src/fileSideBars'
import stubs from '@/tests/unit/stubs'
import Files from '@/__fixtures__/files'
import merge from 'lodash-es/merge'
import { buildResource, renameResource } from '@files/src/helpers/resources'

import InnerSideBar from 'web-pkg/src/components/sideBar/SideBar.vue'
import SideBar from '@files/src/components/SideBar/SideBar.vue'
import { createLocationSpaces } from '../../../../src/router'

jest.mock('web-pkg/src/observer')
jest.mock('@files/src/helpers/resources', () => {
  const original = jest.requireActual('@files/src/helpers/resources')
  return {
    ...original,
    buildResource: jest.fn()
  }
})

const simpleOwnFolder = {
  type: 'folder',
  ownerId: 'marie',
  ownerDisplayName: 'Marie',
  mdate: 'Wed, 21 Oct 2015 07:28:00 GMT',
  size: '740'
}

const selectors = {
  noSelectionInfoPanel: 'noselection-stub'
}

describe('SideBar', () => {
  describe('file info', () => {
    beforeEach(() => {
      buildResource.mockImplementation((item) => item)
    })
    afterEach(() => {
      jest.clearAllMocks()
    })
    it('fetches file info if 1 item is selected', () => {
      const mockFileInfo = jest.fn()
      mockFileInfo.mockReturnValueOnce(Files['/'][1])

      createWrapper({
        item: simpleOwnFolder,
        selectedItems: [simpleOwnFolder],
        mocks: { $client: { files: { fileInfo: mockFileInfo } } }
      })

      expect(mockFileInfo).toHaveBeenCalledTimes(1)
    })

    it('fetches file info if the selected item changes', async () => {
      const spyOnFetchFileInfo = jest
        .spyOn(SideBar.methods, 'fetchFileInfo')
        .mockImplementation(jest.fn)

      const wrapper = createWrapper({
        item: simpleOwnFolder,
        selectedItems: [simpleOwnFolder]
      })

      // fetchFileInfo is called once in created()
      expect(spyOnFetchFileInfo).toHaveBeenCalledTimes(1)

      // it should be called again when a different file is loaded
      const resource = Files['/'][4]
      resource.path = `${resource.name}`
      wrapper.vm.$store.commit('Files/SET_HIGHLIGHTED_FILE', resource)
      await wrapper.vm.$nextTick()
      expect(spyOnFetchFileInfo).toHaveBeenCalledTimes(2)

      // and again if the file is renamed
      const renamedResource = renameResource(Object.assign({}, resource), 'foobar.png', '')
      wrapper.vm.$store.commit('Files/SET_HIGHLIGHTED_FILE', Object.assign(renamedResource))
      await wrapper.vm.$nextTick()
      expect(spyOnFetchFileInfo).toHaveBeenCalledTimes(3)
    })

    it('does not fetch file info if multiple items are selected', () => {
      const mockFileInfo = jest.fn().mockReturnValue({})

      createWrapper({
        item: simpleOwnFolder,
        selectedItems: [simpleOwnFolder, simpleOwnFolder],
        mocks: { $client: { files: { fileInfo: mockFileInfo } } }
      })

      expect(mockFileInfo).not.toHaveBeenCalled()
    })
  })

  describe('no selection info panel', () => {
    afterEach(() => {
      jest.clearAllMocks()
    })
    describe('for public links', () => {
      it.each([
        [
          'shows in root node',
          {
            path: '/publicLinkToken',
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
        const item = { path }
        const mockFileInfo = jest.fn()
        mockFileInfo.mockReturnValue(item)
        buildResource.mockReturnValue(item)
        const wrapper = createWrapper({
          item,
          selectedItems: [],
          mocks: {
            $client: { publicFiles: { getFileInfo: mockFileInfo } }
          },
          currentRouteName: 'files-public-files'
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
        const item = { path }
        const mockFileInfo = jest.fn()
        mockFileInfo.mockReturnValue(item)
        buildResource.mockReturnValue(item)
        const wrapper = createWrapper({
          item,
          selectedItems: [],
          mocks: {
            $client: { files: { fileInfo: mockFileInfo } }
          }
        })
        await wrapper.vm.$nextTick()
        await wrapper.vm.$nextTick()
        expect(wrapper.find(selectors.noSelectionInfoPanel).exists()).toBe(noSelectionExpected)
      })
    })
  })
})

function createWrapper({ item, selectedItems, mocks, currentRouteName = 'files-spaces-personal' }) {
  const localVue = createLocalVue()
  localVue.use(Vuex)
  localVue.use(VueCompositionAPI)
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
            selectedFiles: () => selectedItems
          },
          mutations: {
            SET_HIGHLIGHTED_FILE(state, file) {
              state.highlightedFile = file
            }
          }
        },
        runtime: {
          modules: {
            auth: {
              getters: {
                publicLinkPassword: () => ''
              }
            }
          }
        }
      }
    }),
    localVue,
    stubs: {
      ...stubs,
      SideBar: InnerSideBar
    },
    directives: {
      'click-outside': jest.fn()
    },
    mocks: merge(
      {
        $router: {
          currentRoute: createLocationSpaces(currentRouteName),
          resolve: (r) => {
            return { href: r.name }
          },
          afterEach: jest.fn()
        }
      },
      mocks
    )
  })
}
