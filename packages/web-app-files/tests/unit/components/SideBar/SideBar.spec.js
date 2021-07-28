import { shallowMount, mount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import VueRouter from 'vue-router'
import GetTextPlugin from 'vue-gettext'

import fileSideBars from '@files/src/fileSideBars'
import stubs from '@/tests/unit/stubs'
import Files from '@/__fixtures__/files'

import SideBar from '@files/src/components/SideBar/SideBar.vue'
import DesignSystem from 'owncloud-design-system'
import flushPromises from 'flush-promises'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(DesignSystem)
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

function getMountOptions({ item, selectedItems, mocks, sidebarPanels = fileSideBars }) {
  return {
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
            fileSideBars: () => sidebarPanels
          }
        },
        Files: {
          namespaced: true,
          getters: {
            highlightedFile: () => item,
            selectedFiles: () => selectedItems
          },
          modules: {
            sidebar: {
              namespaced: true,
              state: () => ({
                activePanel: null
              }),
              actions: {
                setActivePanel({ commit }, panel) {
                  commit('SET_ACTIVE_PANEL', panel)
                }
              },
              mutations: {
                SET_ACTIVE_PANEL(state, panel) {
                  state.activePanel = panel
                }
              }
            }
          }
        }
      }
    }),
    router: new VueRouter(),
    localVue,
    stubs: {
      ...stubs,
      'file-info': true,
      'oc-button': false
    },
    directives: {
      'click-outside': jest.fn()
    },
    mocks: {
      publicPage: () => false,
      ...mocks
    }
  }
}

function createMountedWrapper(options) {
  return mount(SideBar, getMountOptions(options))
}

function createWrapper(options) {
  return shallowMount(SideBar, getMountOptions(options))
}

const panelSelectors = {
  Details: '#sidebar-panel-details-item',
  Actions: '#sidebar-panel-actions-item',
  People: '#sidebar-panel-sharing-item',
  NoSelection: '#sidebar-panel-no-selection-item',
  MultiDetails: '#sidebar-panel-details-multiple-item'
}

const selectors = {
  panelBody: '.sidebar-panel__body',
  actionButton: '#sidebar-panel-actions-item-select',
  peopleButton: '#sidebar-panel-sharing-item-select'
}

const samplePanels = [
  () => {
    return {
      app: 'details-item',
      get enabled() {
        return true
      },
      icon: 'info_outline',
      component: getSideBarComponent('Details'),
      default: () => true
    }
  },
  () => {
    return {
      app: 'actions-item',
      get enabled() {
        return true
      },
      icon: 'slideshow',
      component: getSideBarComponent('Actions')
    }
  },
  () => {
    return {
      app: 'sharing-item',
      get enabled() {
        return true
      },
      icon: 'group',
      component: getSideBarComponent('People')
    }
  }
]

describe('SideBar', () => {
  describe('Fetching the fileinfo of selected file', () => {
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

  describe('When on root folder', () => {
    it('should show no selection panel', async () => {
      const item = getResource({ filename: '', type: 'folder' })

      const wrapper = createWrapper({
        item,
        selectedItems: [],
        mocks: {
          $client: {
            files: {
              fileInfo: () =>
                getFileResponse({
                  filename: '',
                  extension: '',
                  type: 'folder'
                })
            }
          }
        }
      })

      await flushPromises()

      const noSelectionPanel = wrapper.find(panelSelectors.NoSelection)
      expect(noSelectionPanel.exists()).toBe(true)
    })
  })

  describe('when only one item is selected', () => {
    let item, wrapper
    afterEach(() => {
      jest.clearAllMocks()
    })

    beforeEach(async () => {
      item = getResource({ filename: 'testfile', extension: 'txt' })
      wrapper = createWrapper({
        item,
        selectedItems: [item],
        mocks: {
          $client: {
            files: {
              fileInfo: () =>
                getFileResponse({
                  filename: 'testfile',
                  extension: 'txt',
                  sidebarPanels: samplePanels
                })
            }
          }
        }
      })

      await flushPromises()
    })

    const allPanels = ['Details', 'Actions', 'People']

    it.each(allPanels)('should contain all panels', (expectedPanel) => {
      const panel = wrapper.find(panelSelectors[expectedPanel])
      expect(panel.exists()).toBeTruthy()
    })

    it('should set the active class on default panel', () => {
      const detailPanel = wrapper.find(panelSelectors.Details)
      expect(detailPanel.exists()).toBeTruthy()
      expect(detailPanel.classes()).toContain('is-active-default-panel')
    })

    it('should set the active class on a panel when the panel button is clicked', async () => {
      wrapper = createMountedWrapper({
        item,
        selectedItems: [item],
        mocks: {
          $client: {
            files: {
              fileInfo: () =>
                getFileResponse({
                  filename: 'testfile',
                  extension: 'txt'
                })
            }
          }
        },
        sidebarPanels: samplePanels
      })

      await flushPromises()

      const buttons = {
        Actions: selectors.actionButton,
        People: selectors.peopleButton
      }

      for (const key in buttons) {
        const button = wrapper.find(buttons[key])
        expect(button.exists()).toBeTruthy()

        let panel = wrapper.find(panelSelectors[key])
        expect(panel.exists()).toBeTruthy()

        const body = panel.find(selectors.panelBody)
        expect(body.text()).toBe(key + ' content')
        expect(panel.classes()).not.toContain('is-active-sub-panel')

        await button.trigger('click')

        panel = wrapper.find(panelSelectors[key])
        expect(panel.classes()).toContain('is-active-sub-panel')
        expect(body.text()).toContain(key + ' content')
      }
    })
  })

  describe('when multiple items are selected', () => {
    it('should show multiple selection details panel only', async () => {
      const item1 = getResource({ filename: 'testfile', extension: 'txt' })
      const item2 = getResource({ filename: 'testimage', extension: 'jpg' })

      const wrapper = createWrapper({
        item: item1,
        selectedItems: [item1, item2]
      })
      await flushPromises()

      let panel = wrapper.find(panelSelectors.MultiDetails)
      expect(panel.exists()).toBe(true)

      panel = wrapper.find(panelSelectors.Actions)
      expect(panel.exists()).toBe(false)

      panel = wrapper.find(panelSelectors.People)
      expect(panel.exists()).toBe(false)
    })
  })
})

const getSideBarComponent = function (name) {
  const component = localVue.component(name + '-sidebar-item', {
    render: function (createElement) {
      return createElement('div', name + ' content')
    }
  })
  component.title = () => name
  component.data = () => {
    return {
      loading: false
    }
  }
  return component
}

function getResource({ filename, extension, type = 'file' }) {
  let path = ''
  if (filename) {
    path = `/${filename}`
  }
  if (extension) {
    path = path + `.${extension}`
  }

  return {
    id: '4',
    fileId: '4',
    icon: type,
    name: type === 'file' ? `${filename}.${extension}` : filename,
    extension: extension,
    path,
    type,
    mdate: 'Mon, 12 Jul 2021 11:04:33 GMT',
    size: '163',
    permissions: 'RDNVW',
    starred: false,
    etag: '"89128c0e8122002db57bd19c9ec33004"',
    shareTypes: [],
    ownerDisplayName: 'user1',
    ownerId: 'user1',
    canDownload: () => true,
    isReceivedShare: () => true,
    canBeDeleted: () => true,
    canRename: () => true
  }
}

function getFileResponse({ filename, extension, type = 'file' }) {
  let name = ''
  if (filename) {
    name = `/${filename}`
  }
  if (extension) {
    name = name + `.${extension}`
  }
  return {
    name,
    type,
    fileInfo: {
      '{http://owncloud.org/ns}fileid': '54'
    }
  }
}
