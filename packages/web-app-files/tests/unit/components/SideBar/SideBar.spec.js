import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import VueRouter from 'vue-router'
import GetTextPlugin from 'vue-gettext'

import fileSideBars from '@files/src/fileSideBars'
import stubs from '@/tests/unit/stubs'
import Files from '@/__fixtures__/files'

import SideBar from '@files/src/components/SideBar/SideBar.vue'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(VueRouter)
localVue.use(GetTextPlugin, {
  translations: 'does-not-matter.json',
  silent: true
})

const simpleOwnFolder = {
  type: 'folder',
  ownerId: 'marie',
  ownerDisplayName: 'Marie',
  mdate: 'Wed, 21 Oct 2015 07:28:00 GMT',
  size: '740'
}

function createWrapper({ item, selectedItems, mocks }) {
  return shallowMount(SideBar, {
    store: new Vuex.Store({
      getters: {
        user: function() {
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
          getters: {
            highlightedFile: () => item,
            selectedFiles: () => selectedItems
          }
        }
      }
    }),
    router: new VueRouter(),
    localVue,
    stubs,
    directives: {
      'click-outside': jest.fn()
    },
    mocks
  })
}

describe('SideBar', () => {
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

  it('does not fetch file info if multiple items are selected', () => {
    const mockFileInfo = jest.fn()

    createWrapper({
      item: simpleOwnFolder,
      selectedItems: [simpleOwnFolder, simpleOwnFolder],
      mocks: { $client: { files: { fileInfo: mockFileInfo } } }
    })

    expect(mockFileInfo).not.toHaveBeenCalled()
  })
})
