import Vuex from 'vuex'
import DesignSystem from 'owncloud-design-system'
import stubs from '@/tests/unit/stubs/index.js'
import { createLocalVue, mount } from '@vue/test-utils'
import FileActions from '@files/src/components/SideBar/Actions/FileActions.vue'

import GetTextPlugin from 'vue-gettext'

import { apps, getActions, fileActions } from '@files/tests/__fixtures__/fileActions.js'

const localVue = createLocalVue()
localVue.use(DesignSystem)
localVue.use(Vuex)
localVue.use(GetTextPlugin, {
  translations: 'does-not-matter.json',
  silent: true
})

const filesPersonalRoute = { name: 'files-personal' }

const systemDefaultActions = [
  [['copy']],
  [['copy', 'move']],
  [['copy', 'markdown-editor']],
  [['copy', 'move', 'download', 'markdown-editor']]
]

describe('FileActions', () => {
  describe('when user is on personal route', () => {
    describe('action handlers', () => {
      afterEach(() => {
        jest.clearAllMocks()
      })
      it('renders action handlers as clickable elements', async () => {
        const actions = ['copy', 'download', 'move', 'open-folder', 'markdown-editor']
        const wrapper = getWrapper(filesPersonalRoute, actions)

        for (const button of actions) {
          const action = fileActions[button]

          const buttonElement = wrapper.find(action.selector)
          expect(buttonElement.exists()).toBeTruthy()

          await buttonElement.trigger('click.stop')
          expect(action.handler).toHaveBeenCalledTimes(1)
        }
      })
    })

    describe('menu items', () => {
      it.each(systemDefaultActions)('renders a list of actions', (actions) => {
        const wrapper = getWrapper(filesPersonalRoute, actions)

        for (const defaultAction of actions) {
          expect(wrapper.find(fileActions[defaultAction].selector).exists()).toBeTruthy()
        }
      })
    })
  })
})

function getWrapper(
  route,
  actions = [],
  store = createStore({
    mimeType: undefined,
    availableMimeTypes: {}
  }),
  availableApps = []
) {
  const mountStubs = { ...stubs, 'oc-button': false }
  const mountOptions = {
    localVue,
    store,
    data() {
      return {
        appList: availableApps
      }
    },
    stubs: mountStubs,
    mocks: {
      $route: route,
      publicPage: () => false
    },
    computed: {
      actions: () => getActions(actions)
    }
  }
  return mount(FileActions, mountOptions)
}

function createStore(state, filename, fileId, extension, type, mimeType, availableMimeTypes) {
  return new Vuex.Store({
    state: {
      apps: apps
    },
    modules: {
      External: {
        namespaced: true,
        getters: {
          getMimeTypes: () => {
            return availableMimeTypes
          }
        }
      },
      Files: {
        state: {
          ...state,
          currentFolder: { path: '' }
        },
        namespaced: true,
        getters: {
          highlightedFile: () => {
            return getResource({ filename, fileId, extension, type, mimeType })
          },
          currentFolder: () => '/'
        }
      }
    }
  })
}

function getResource({
  filename = 'welcome',
  fileId = 'a93f8adf==',
  extension = 'md',
  type = 'file',
  mimeType
}) {
  return {
    id: '4',
    fileId,
    icon: type,
    name: type === 'file' ? `${filename}.${extension}` : filename,
    extension,
    path: type === 'file' ? `/${filename}.${extension}` : `/${filename}`,
    type,
    mdate: 'Mon, 12 Jul 2021 11:04:33 GMT',
    size: '163',
    indicators: [],
    permissions: 'RDNVW',
    starred: false,
    etag: '"89128c0e8122002db57bd19c9ec33004"',
    mimeType,
    shareTypes: [],
    downloadURL: '',
    ownerDisplayName: 'user1',
    ownerId: 'user1',
    canDownload: () => true,
    isReceivedShare: () => true,
    canBeDeleted: () => true,
    canRename: () => true
  }
}
