import ContextActions from '../../../../src/components/FilesList/ContextActions.vue'
import stubs from '../../../../../../tests/unit/stubs/index.js'
import GetTextPlugin from 'vue-gettext'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(GetTextPlugin, {
  translations: 'does-not-matter.json',
  silent: true
})

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

const actions = {
  download: {
    class: 'oc-files-actions-download-trigger',
    selector: '.oc-files-actions-download-trigger'
  },
  copy: {
    class: 'oc-files-actions-copy-trigger',
    selector: '.oc-files-actions-copy-trigger'
  },
  rename: {
    class: 'oc-files-actions-rename-trigger',
    selector: '.oc-files-actions-rename-trigger'
  },
  move: {
    class: 'oc-files-actions-move-trigger',
    selector: '.oc-files-actions-move-trigger'
  },
  delete: {
    class: 'oc-files-actions-delete-trigger',
    selector: '.oc-files-actions-delete-trigger'
  },
  mediaviewer: {
    class: 'oc-files-actions-mediaviewer-trigger',
    selector: '.oc-files-actions-mediaviewer-trigger'
  },
  'open-folder': {
    class: 'oc-files-actions-navigate-trigger',
    selector: '.oc-files-actions-navigate-trigger'
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
    app: 'mediaviewer',
    extension: 'png',
    handler: null,
    icon: null,
    newTab: false,
    routeName: 'mediaviewer-media',
    routes
  }
]

const apps = {
  fileEditors: editors,
  newFileHandlers: editors,
  meta
}
const user = {
  capabilities: {}
}

describe('ContextActions', () => {
  function getWrapper(route, { filename = '', extension = '', type = '' }) {
    const mountStubs = { ...stubs }

    return shallowMount(ContextActions, {
      localVue,
      store: createStore(),
      stubs: mountStubs,
      mocks: {
        $route: route,
        publicPage: () => false
      },
      propsData: {
        item: {
          name: filename,
          extension: extension,
          type: type,
          canDownload: () => true,
          isReceivedShare: () => true,
          canBeDeleted: () => true,
          canRename: () => true
        },
        actions: actions
      }
    })
  }

  const selectors = {
    actionList: '#oc-files-context-actions',
    actionItem: 'li.oc-files-context-action'
  }

  describe('renders a list of actions', () => {
    it('for a file', () => {
      const wrapper = getWrapper('files-personal', {
        name: 'exampleFile',
        extension: 'jpg',
        type: 'file'
      })

      expect(wrapper.find(selectors.actionList).exists()).toBeTruthy()
      expect(wrapper.find(actions.download.selector).exists()).toBeTruthy()
      expect(wrapper.find(actions.rename.selector).exists()).toBeTruthy()
      expect(wrapper.find(actions.delete.selector).exists()).toBeTruthy()
    })

    it('for a folder', () => {
      const wrapper = getWrapper('files-personal', {
        name: 'exampleFolder',
        extension: '',
        type: 'folder'
      })

      expect(wrapper.find(selectors.actionList).exists()).toBeTruthy()
      expect(wrapper.find(actions.download.selector).exists()).toBeTruthy()
      expect(wrapper.find(actions.rename.selector).exists()).toBeTruthy()
      expect(wrapper.find(actions.delete.selector).exists()).toBeTruthy()
    })
  })
})

function createStore(state) {
  return new Vuex.Store({
    state: {
      apps,
      user
    },
    modules: {
      Files: {
        state: {
          ...state
        },
        namespaced: true,
        getters: {
          currentFolder: () => '/'
        }
      }
    }
  })
}
