import { mount, createLocalVue } from '@vue/test-utils'
import VueCompositionAPI from '@vue/composition-api'
import Vuex from 'vuex'
import GetTextPlugin from 'vue-gettext'
import fileSideBars from '@files/src/fileSideBars'
import stubs from '@/tests/unit/stubs'
import Files from '@/__fixtures__/files'
import merge from 'lodash-es/merge'
import { buildResource, renameResource } from '@files/src/helpers/resources'

import SideBar from '@files/src/components/SideBar/SideBar.vue'
import { createLocationSpaces } from '../../../../src/router'

const simpleOwnFolder = {
  type: 'folder',
  ownerId: 'marie',
  ownerDisplayName: 'Marie',
  mdate: 'Wed, 21 Oct 2015 07:28:00 GMT',
  size: '740'
}

function createWrapper({ item, selectedItems, mocks }) {
  const localVue = createLocalVue()
  localVue.use(Vuex)
  localVue.use(VueCompositionAPI)
  localVue.use(GetTextPlugin, {
    translations: 'does-not-matter.json',
    silent: true
  })
  return mount(SideBar, {
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
          },
          modules: {
            sidebar: {
              namespaced: true,
              state: {
                activePanel: null
              }
            }
          }
        }
      }
    }),
    localVue,
    stubs,
    directives: {
      'click-outside': jest.fn()
    },
    mocks: merge(
      {
        $router: {
          currentRoute: createLocationSpaces('files-spaces-personal-home'),
          resolve: (r) => {
            return { href: r.name }
          }
        }
      },
      mocks
    )
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
    const resource = buildResource(Files['/'][4])
    resource.path = `${resource.name}`
    wrapper.vm.$store.commit('Files/SET_HIGHLIGHTED_FILE', resource)
    await wrapper.vm.$nextTick()
    expect(spyOnFetchFileInfo).toHaveBeenCalledTimes(2)

    // and again if the file is renamed
    const renamedResource = renameResource(Object.assign({}, resource), 'foobar.png', '')
    wrapper.vm.$store.commit('Files/SET_HIGHLIGHTED_FILE', Object.assign(renamedResource))
    await wrapper.vm.$nextTick()
    expect(spyOnFetchFileInfo).toHaveBeenCalledTimes(3)

    jest.resetAllMocks()
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
