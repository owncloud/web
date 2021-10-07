import Vuex from 'vuex'
import DesignSystem from 'owncloud-design-system'
import stubs from '@/tests/unit/stubs/index.js'
import { createLocalVue, mount } from '@vue/test-utils'
import ContextActions from '../../../../src/components/FilesList/ContextActions.vue'
import GetTextPlugin from 'vue-gettext'
import fixtureMimeTypes from '@files/tests/__fixtures__/mimeTypes.js'

const localVue = createLocalVue()
localVue.use(DesignSystem)
localVue.use(Vuex)
localVue.use(GetTextPlugin, {
  translations: 'does-not-matter.json',
  silent: true
})

const exampleApps = [
  { name: 'exampleName1', icon: 'exampleIcon1' },
  { name: 'exampleName2', icon: 'exampleIcon2' },
  { name: 'exampleName3', icon: 'exampleIcon3' }
]

const mockMenuSections = [
  {
    name: 'context',
    items: [
      {
        icon: 'text',
        canBeDefault: true,
        handler: jest.fn(),
        label: () => 'Open in editor',
        componentType: 'oc-button',
        selector: '.oc-files-actions-markdown-editor-trigger',
        class: 'oc-files-actions-markdown-editor-trigger'
      },
      {
        icon: 'file_download',
        canBeDefault: true,
        handler: jest.fn(),
        label: () => 'Download',
        componentType: 'oc-button',
        selector: '.oc-files-actions-download-file-trigger',
        class: 'oc-files-actions-download-file-trigger'
      },
      {
        icon: 'link-add',
        handler: jest.fn(),
        label: () => 'Create link',
        componentType: 'oc-button',
        selector: '.oc-files-actions-create-public-link-trigger',
        class: 'oc-files-actions-create-public-link-trigger'
      },
      {
        icon: 'group-add',
        handler: jest.fn(),
        label: () => 'Share',
        componentType: 'oc-button',
        selector: '.oc-files-actions-show-shares-trigger',
        class: 'oc-files-actions-show-shares-trigger'
      }
    ]
  },
  {
    name: 'actions',
    items: [
      {
        icon: 'edit',
        handler: jest.fn(),
        label: () => 'Edit',
        componentType: 'oc-button',
        selector: '.oc-files-actions-rename-trigger',
        class: 'oc-files-actions-rename-trigger'
      },
      {
        icon: 'folder-move',
        handler: jest.fn(),
        label: () => 'Move',
        componentType: 'oc-button',
        selector: '.oc-files-actions-move-trigger',
        class: 'oc-files-actions-move-trigger'
      },
      {
        icon: 'file_copy',
        handler: jest.fn(),
        label: () => 'Copy',
        componentType: 'oc-button',
        selector: '.oc-files-actions-copy-trigger',
        class: 'oc-files-actions-copy-trigger'
      },
      {
        icon: 'delete',
        handler: jest.fn(),
        label: () => 'Delete',
        componentType: 'oc-button',
        selector: '.oc-files-actions-delete-trigger',
        class: 'oc-files-actions-delete-trigger'
      },
      {
        icon: 'slideshow',
        handler: jest.fn(),
        label: () => 'All actions',
        componentType: 'oc-button',
        selector: '.oc-files-actions-show-actions-trigger',
        class: 'oc-files-actions-show-actions-trigger'
      }
    ]
  },
  {
    name: 'sidebar',
    items: [
      {
        icon: 'info_outline',
        handler: jest.fn(),
        label: () => 'Details',
        componentType: 'oc-button',
        selector: '.oc-files-actions-show-details-trigger',
        class: 'oc-files-actions-show-details-trigger'
      }
    ]
  }
]

const filesPersonalRoute = { name: 'files-personal' }

describe('ContextActions', () => {
  describe('if no externalApps are available, renders', () => {
    it('a list of actions for a file', () => {
      const wrapper = getWrapper(filesPersonalRoute, {
        name: 'exampleFile',
        extension: 'jpg',
        mimeType: 'application/fileFormat2',
        type: 'file'
      })

      expect(wrapper).toMatchSnapshot()
    })

    it('a list of actions for a folder', () => {
      const wrapper = getWrapper(filesPersonalRoute, {
        name: 'exampleFolder',
        extension: '',
        type: 'folder'
      })

      expect(wrapper).toMatchSnapshot()
    })
  })

  describe('if externalApps are available, renders', () => {
    it('two lists of actions for a file', () => {
      const wrapper = getWrapper(
        filesPersonalRoute,
        {
          name: 'exampleFile',
          extension: 'jpg',
          mimeType: 'application/fileFormat2',
          type: 'file'
        },
        exampleApps
      )

      expect(wrapper).toMatchSnapshot()
    })

    it('one list of actions for a folder', () => {
      const wrapper = getWrapper(
        filesPersonalRoute,
        {
          name: 'exampleFolder',
          extension: '',
          type: 'folder'
        },
        exampleApps
      )

      expect(wrapper).toMatchSnapshot()
    })
  })

  describe('should trigger the action handlers on click', () => {
    afterEach(() => {
      jest.clearAllMocks()
    })

    it('for external App actions', async () => {
      const triggerActionSpy = jest
        .spyOn(ContextActions.mixins[0].methods, '$_fileActions_openLink')
        .mockImplementationOnce(jest.fn)

      const wrapper = getWrapper(
        filesPersonalRoute,
        {
          name: 'exampleFile',
          extension: 'jpg',
          mimeType: 'application/fileFormat2',
          type: 'file'
        },
        exampleApps
      )

      const app = exampleApps[0]
      const appButton = wrapper.find('#oc-files-context-default-actions > li > button')
      expect(appButton.text()).toBe(`Open in ${app.name}`)

      await appButton.trigger('click')
      expect(triggerActionSpy).toHaveBeenCalledWith(app.name, 'a93f8adf==')
    })

    it('for default file and system actions', async () => {
      const wrapper = getWrapper(
        filesPersonalRoute,
        {
          name: 'exampleFile',
          extension: 'jpg',
          mimeType: 'application/fileFormat2',
          type: 'file'
        },
        exampleApps
      )

      for (const section of mockMenuSections) {
        for (const item of section.items) {
          const buttonElement = wrapper.find(item.selector)
          expect(buttonElement.exists()).toBeTruthy()
          await buttonElement.trigger('click')
          expect(item.handler).toHaveBeenCalledTimes(1)
        }
      }
    })
  })
})

function getWrapper(route, { filename, extension, type = '', mimeType }, availableApps = []) {
  const mountStubs = { ...stubs, 'oc-button': false }

  return mount(ContextActions, {
    localVue,
    store: createStore(),
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
    propsData: {
      item: {
        id: 'a93f8adf==',
        name: filename,
        path: type === 'file' ? `/${filename}.${extension}` : `/${filename}`,
        mimeType,
        extension,
        type,
        canDownload: () => true,
        isReceivedShare: () => true,
        canBeDeleted: () => true,
        canRename: () => true
      }
    },
    computed: {
      menuSections: () => mockMenuSections
    }
  })
}

function createStore(state) {
  return new Vuex.Store({
    getters: {
      capabilities: jest.fn(() => ({
        files: {
          app_providers: [
            {
              apps_url: '/app/list',
              enabled: true,
              open_url: '/app/open'
            }
          ]
        }
      }))
    },
    modules: {
      External: {
        state: {
          ...state
        },
        namespaced: true,
        getters: {
          getMimeTypes: () => {
            return fixtureMimeTypes
          }
        }
      },
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
