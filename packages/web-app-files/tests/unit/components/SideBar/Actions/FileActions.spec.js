import Vuex from 'vuex'
import DesignSystem from 'owncloud-design-system'
import stubs from '@/tests/unit/stubs/index.js'
import { createLocalVue, mount } from '@vue/test-utils'
import FileActions from '@files/src/components/SideBar/Actions/FileActions.vue'

import GetTextPlugin from 'vue-gettext'

const localVue = createLocalVue()
localVue.use(DesignSystem)
localVue.use(Vuex)
localVue.use(GetTextPlugin, {
  translations: 'does-not-matter.json',
  silent: true
})

const filesPersonalRoute = { name: 'files-personal' }

const meta = {
  files: {
    name: 'Files',
    id: 'files',
    icon: 'folder'
  },
  mediaviewer: {
    name: 'Mediaviewer',
    id: 'mediaviewer',
    icon: 'image'
  },
  'draw-io': {
    name: 'Draw.io',
    id: 'draw-io',
    icon: 'grid_on'
  },
  'markdown-editor': {
    name: 'MarkdownEditor',
    id: 'markdown-editor',
    icon: 'text'
  }
}

const routes = [
  'files-personal',
  'files-favorites',
  'files-shared-with-others',
  'files-shared-with-me',
  'files-public-list'
]

const editors = [
  {
    app: 'draw-io',
    extension: 'drawio',
    handler: null,
    icon: null,
    newTab: true,
    routeName: 'draw-io-edit',
    routes
  },
  {
    app: 'mediaviewer',
    extension: 'png',
    handler: null,
    icon: null,
    newTab: false,
    routeName: 'mediaviewer-media',
    routes
  },
  {
    app: 'markdown-editor',
    extension: 'md',
    handler: null,
    icon: null,
    newTab: false,
    routeName: 'markdown-editor',
    routes
  }
]

const sideBars = [
  {
    app: 'details-item',
    enabled: jest.fn(),
    icon: 'info_outline'
  },
  {
    app: 'actions-item',
    enabled: jest.fn(),
    icon: 'info_outline'
  }
]

const apps = {
  customFileListIndicators: [],
  file: {
    edit: false,
    path: ''
  },
  fileEditors: editors,
  fileSideBars: sideBars,
  newFileHandlers: editors,
  meta
}

function getWrapper(route, { filename = 'testfile', extension, extraActions = {}, type = 'file' }) {
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

const basicActions = {
  download: {
    class: 'oc-files-actions-sidebar-download-trigger',
    selector: '.oc-files-actions-sidebar-download-trigger',
    handler: jest.fn()
  },
  copy: {
    class: 'oc-files-actions-sidebar-copy-trigger',
    selector: '.oc-files-actions-sidebar-copy-trigger',
    handler: jest.fn()
  },
  rename: {
    class: 'oc-files-actions-sidebar-rename-trigger',
    selector: '.oc-files-actions-sidebar-rename-trigger',
    handler: jest.fn()
  },
  move: {
    class: 'oc-files-actions-sidebar-move-trigger',
    selector: '.oc-files-actions-sidebar-move-trigger',
    handler: jest.fn()
  },
  delete: {
    class: 'oc-files-actions-sidebar-delete-trigger',
    selector: '.oc-files-actions-sidebar-delete-trigger',
    handler: jest.fn()
  }
}

const extraActions = {
  'markdown-editor': {
    class: 'oc-files-actions-sidebar-markdown-editor-trigger',
    selector: '.oc-files-actions-sidebar-markdown-editor-trigger',
    handler: jest.fn()
  },
  'draw-io': {
    class: 'oc-files-actions-sidebar-draw-io-trigger',
    selector: '.oc-files-actions-sidebar-draw-io-trigger',
    handler: jest.fn()
  },
  mediaviewer: {
    class: 'oc-files-actions-sidebar-mediaviewer-trigger',
    selector: '.oc-files-actions-sidebar-mediaviewer-trigger',
    handler: jest.fn()
  },
  'open-folder': {
    class: 'oc-files-actions-sidebar-navigate-trigger',
    selector: '.oc-files-actions-sidebar-navigate-trigger',
    handler: jest.fn()
  }
}

const getActions = function(extractions = []) {
  const actions = []
  for (const key in basicActions) {
    const action = basicActions[key]

    const actionObj = {
      icon: key,
      handler: action.handler,
      isEnabled: () => true,
      label: () => key,
      componentType: 'oc-button',
      class: action.class
    }
    if (key === 'download') {
      actionObj.canBeDefault = true
    }
    actions.push(actionObj)
  }
  for (const key of extractions) {
    const action = extraActions[key]
    actions.push({
      icon: key,
      handler: action.handler,
      isEnabled: () => true,
      label: () => key,
      componentType: 'oc-button',
      class: action.class,
      canBeDefault: true
    })
  }
  return actions
}

describe('FileActions', () => {
  describe('when user is on personal route', () => {
    afterEach(() => {
      jest.clearAllMocks()
    })

    it('should show action buttons on md file', async () => {
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

        const args = action.handler.mock.calls[0]

        expect(action.handler).toHaveBeenCalledTimes(1)
        expect(args.length).toEqual(2)
        expect(args[0]).toMatchObject({
          id: '4',
          fileId: '4',
          icon: 'file',
          name: 'welcome.md',
          extension: 'md',
          path: '/welcome.md',
          type: 'file',
          ownerDisplayName: 'user1',
          ownerId: 'user1'
        })
        expect(args[1]).toEqual(undefined)
      }
    })

    it('should show action buttons on png file', async () => {
      const actions = { ...basicActions, mediaviewer: extraActions.mediaviewer }
      const wrapper = getWrapper(filesPersonalRoute, {
        filename: 'testfile',
        extension: 'png',
        extraActions: ['mediaviewer']
      })

      for (const button in actions) {
        const action = actions[button]

        const buttonElement = wrapper.find(action.selector)
        expect(buttonElement.exists()).toBeTruthy()

        await buttonElement.trigger('click.stop')

        const args = action.handler.mock.calls[0]

        expect(action.handler).toHaveBeenCalledTimes(1)
        expect(args.length).toEqual(2)
        expect(args[0]).toMatchObject({
          id: '4',
          fileId: '4',
          icon: 'file',
          name: 'testfile.png',
          extension: 'png',
          path: '/testfile.png',
          type: 'file',
          ownerDisplayName: 'user1',
          ownerId: 'user1'
        })
        expect(args[1]).toEqual(undefined)
      }
    })

    it('should show Actions buttons on drawio file', async () => {
      const actions = { ...basicActions, 'draw-io': extraActions['draw-io'] }
      const wrapper = getWrapper(filesPersonalRoute, {
        filename: 'testfile',
        extension: 'drawio',
        extraActions: ['draw-io']
      })

      for (const button in actions) {
        const action = actions[button]

        const buttonElement = wrapper.find(action.selector)
        expect(buttonElement.exists()).toBeTruthy()

        await buttonElement.trigger('click.stop')

        const args = action.handler.mock.calls[0]

        expect(action.handler).toHaveBeenCalledTimes(1)
        expect(args.length).toEqual(2)
        expect(args[0]).toMatchObject({
          id: '4',
          fileId: '4',
          icon: 'file',
          name: 'testfile.drawio',
          extension: 'drawio',
          path: '/testfile.drawio',
          type: 'file',
          ownerDisplayName: 'user1',
          ownerId: 'user1'
        })
        expect(args[1]).toEqual(undefined)
      }
    })

    it('should show Actions buttons on folder', async () => {
      const actions = { ...basicActions, 'open-folder': extraActions['open-folder'] }
      const wrapper = getWrapper(filesPersonalRoute, {
        filename: 'testFolder',
        extension: '',
        extraActions: ['open-folder'],
        type: 'folder'
      })
      delete actions.download // download option is not present for folders
      for (const button in actions) {
        const action = actions[button]

        const buttonElement = wrapper.find(action.selector)
        expect(buttonElement.exists()).toBeTruthy()

        await buttonElement.trigger('click.stop')

        const args = action.handler.mock.calls[0]

        expect(action.handler).toHaveBeenCalledTimes(1)
        expect(args.length).toEqual(2)
        expect(args[0]).toMatchObject({
          id: '4',
          fileId: '4',
          icon: 'folder',
          name: 'testFolder',
          extension: '',
          path: '/testFolder',
          type: 'folder',
          ownerDisplayName: 'user1',
          ownerId: 'user1'
        })
        expect(args[1]).toEqual(undefined)
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
