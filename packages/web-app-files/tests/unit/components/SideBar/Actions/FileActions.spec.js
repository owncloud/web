import Vuex from 'vuex'
import DesignSystem from 'owncloud-design-system'
import stubs from '@/tests/unit/stubs/index.js'
import { createLocalVue, mount } from '@vue/test-utils'
import FileActions from '@files/src/components/SideBar/Actions/FileActions.vue'

import GetTextPlugin from 'vue-gettext'

import {
  apps,
  getActions,
  basicActions,
  extraActions
} from '@files/tests/__fixtures__/fileActions.js'

const localVue = createLocalVue()
localVue.use(DesignSystem)
localVue.use(Vuex)
localVue.use(GetTextPlugin, {
  translations: 'does-not-matter.json',
  silent: true
})

const filesPersonalRoute = { name: 'files-personal' }

function getWrapper(route, { filename = 'testfile', extension, extraActions = [], type = 'file' }) {
  const mountStubs = { ...stubs, 'oc-button': false }
  const mountOptions = {
    localVue,
    store: createStore({}, filename, extension, type),
    stubs: mountStubs,
    mocks: {
      $route: route,
      publicPage: () => false
    },
    computed: {
      actions() {
        let actions = getActions(extraActions)
        if (type === 'folder') {
          actions = actions.filter(item => item.icon !== 'download')
        }
        return actions
      }
    }
  }
  return mount(FileActions, mountOptions)
}

describe('FileActions', () => {
  describe('when user is on personal route', () => {
    afterEach(() => {
      jest.clearAllMocks()
    })

    it('Action Buttons should be shown correctly on markdown file', () => {
      const actions = { ...basicActions, 'markdown-editor': extraActions['markdown-editor'] }
      const wrapper = getWrapper(filesPersonalRoute, {
        filename: 'welcome',
        extension: 'md',
        extraActions: ['markdown-editor']
      })

      for (const key in actions) {
        const action = actions[key]

        const buttonElement = wrapper.find(action.selector)
        expect(buttonElement.exists()).toBeTruthy()

        let expectedLabel = action.label
        if (action.opensInNewWindow) {
          expectedLabel += ' (Opens in new window)'
        }
        expect(buttonElement.text()).toBe(expectedLabel)
      }
    })

    it('Action Buttons should be shown correctly on png file', () => {
      const actions = { ...basicActions, mediaviewer: extraActions.mediaviewer }
      const wrapper = getWrapper(filesPersonalRoute, {
        filename: 'testfile',
        extension: 'png',
        extraActions: ['mediaviewer']
      })

      for (const key in actions) {
        const action = actions[key]

        const buttonElement = wrapper.find(action.selector)
        expect(buttonElement.exists()).toBeTruthy()

        let expectedLabel = action.label
        if (action.opensInNewWindow) {
          expectedLabel += ' (Opens in new window)'
        }
        expect(buttonElement.text()).toBe(expectedLabel)
      }
    })

    it('Action Buttons should be shown correctly on drawio file', () => {
      const actions = { ...basicActions, 'draw-io': extraActions['draw-io'] }
      const wrapper = getWrapper(filesPersonalRoute, {
        filename: 'testfile',
        extension: 'drawio',
        extraActions: ['draw-io']
      })

      for (const key in actions) {
        const action = actions[key]

        const buttonElement = wrapper.find(action.selector)
        expect(buttonElement.exists()).toBeTruthy()

        let expectedLabel = action.label
        if (action.opensInNewWindow) {
          expectedLabel += ' (Opens in new window)'
        }
        expect(buttonElement.text()).toBe(expectedLabel)
      }
    })

    it('Action Buttons should be shown correctly on a folder', () => {
      const actions = { ...basicActions, 'open-folder': extraActions['open-folder'] }
      const wrapper = getWrapper(filesPersonalRoute, {
        filename: 'testFolder',
        extension: '',
        extraActions: ['open-folder'],
        type: 'folder'
      })
      delete actions.download // download option is not present for folders
      for (const key in actions) {
        const action = actions[key]

        const buttonElement = wrapper.find(action.selector)
        expect(buttonElement.exists()).toBeTruthy()

        let expectedLabel = action.label
        if (action.opensInNewWindow) {
          expectedLabel += ' (Opens in new window)'
        }
        expect(buttonElement.text()).toBe(expectedLabel)
      }
    })

    it('should trigger the action handlers on click', async () => {
      const actions = { ...basicActions, 'markdown-editor': extraActions['markdown-editor'] }
      const wrapper = getWrapper(filesPersonalRoute, {
        filename: 'welcome',
        extension: 'md',
        extraActions: ['markdown-editor']
      })

      for (const button in actions) {
        const action = actions[button]

        const buttonElement = wrapper.find(action.selector)
        expect(buttonElement.exists()).toBeTruthy()

        await buttonElement.trigger('click.stop')

        expect(action.handler).toHaveBeenCalledTimes(1)
      }
    })
  })
})

function getResource({ filename, extension, type }) {
  return {
    id: '4',
    fileId: '4',
    icon: type,
    name: type === 'file' ? `${filename}.${extension}` : filename,
    extension: extension,
    path: type === 'file' ? `/${filename}.${extension}` : `/${filename}`,
    type,
    mdate: 'Mon, 12 Jul 2021 11:04:33 GMT',
    size: '163',
    indicators: [],
    permissions: 'RDNVW',
    starred: false,
    etag: '"89128c0e8122002db57bd19c9ec33004"',
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

function createStore(state, filename, extension, type = 'file') {
  return new Vuex.Store({
    state: {
      apps: apps
    },
    modules: {
      Files: {
        state: {
          ...state,
          currentFolder: { path: '' }
        },
        namespaced: true,
        getters: {
          highlightedFile: () => {
            return getResource({ filename, extension, type })
          },
          currentFolder: () => '/'
        }
      }
    }
  })
}
