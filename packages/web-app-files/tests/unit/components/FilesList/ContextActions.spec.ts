import {
  createStore,
  defaultComponentMocks,
  defaultPlugins,
  defaultStubs,
  mount
} from 'web-test-helpers'
import { mockDeep } from 'jest-mock-extended'
import { SpaceResource } from 'web-client/src/helpers'
import { defaultStoreMockOptions } from 'web-test-helpers/src/mocks/store/defaultStoreMockOptions'
import ContextActions from 'web-app-files/src/components/FilesList/ContextActions.vue'
import fixtureMimeTypes from 'web-app-files/tests/__fixtures__/mimeTypes.js'

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
        icon: 'file-text',
        canBeDefault: true,
        handler: jest.fn(),
        label: () => 'Open in editor',
        componentType: 'button',
        selector: '.oc-files-actions-text-editor-trigger',
        class: 'oc-files-actions-text-editor-trigger'
      },
      ...exampleApps.map((app) => {
        return {
          img: app.icon,
          canBeDefault: true,
          handler: jest.fn(),
          label: () => 'Open in ' + app.name,
          componentType: 'button',
          selector: `.oc-files-actions-${app.name}-trigger`,
          class: `oc-files-actions-${app.name}-trigger`
        }
      }),
      {
        icon: 'download',
        canBeDefault: true,
        handler: jest.fn(),
        label: () => 'Download',
        componentType: 'button',
        selector: '.oc-files-actions-download-file-trigger',
        class: 'oc-files-actions-download-file-trigger'
      },
      {
        icon: 'links',
        handler: jest.fn(),
        label: () => 'Create link',
        componentType: 'button',
        selector: '.oc-files-actions-create-public-link-trigger',
        class: 'oc-files-actions-create-public-link-trigger'
      },
      {
        icon: 'group',
        handler: jest.fn(),
        label: () => 'Share',
        componentType: 'button',
        selector: '.oc-files-actions-show-shares-trigger',
        class: 'oc-files-actions-show-shares-trigger'
      }
    ]
  },
  {
    name: 'actions',
    items: [
      {
        icon: 'pencil',
        handler: jest.fn(),
        label: () => 'Edit',
        componentType: 'button',
        selector: '.oc-files-actions-rename-trigger',
        class: 'oc-files-actions-rename-trigger'
      },
      {
        icon: 'folder-shared',
        handler: jest.fn(),
        label: () => 'Move',
        componentType: 'button',
        selector: '.oc-files-actions-move-trigger',
        class: 'oc-files-actions-move-trigger'
      },
      {
        icon: 'file-copy',
        handler: jest.fn(),
        label: () => 'Copy',
        componentType: 'button',
        selector: '.oc-files-actions-copy-trigger',
        class: 'oc-files-actions-copy-trigger'
      },
      {
        icon: 'delete-bin-5',
        handler: jest.fn(),
        label: () => 'Delete',
        componentType: 'button',
        selector: '.oc-files-actions-delete-trigger',
        class: 'oc-files-actions-delete-trigger'
      },
      {
        icon: 'slideshow',
        handler: jest.fn(),
        label: () => 'All actions',
        componentType: 'button',
        selector: '.oc-files-actions-show-actions-trigger',
        class: 'oc-files-actions-show-actions-trigger'
      }
    ]
  },
  {
    name: 'sidebar',
    items: [
      {
        icon: 'information',
        handler: jest.fn(),
        label: () => 'Details',
        componentType: 'button',
        selector: '.oc-files-actions-show-details-trigger',
        class: 'oc-files-actions-show-details-trigger'
      }
    ]
  }
]

const filesPersonalRoute = { name: 'files-personal' }

describe('ContextActions', () => {
  // FIXME: Fix test
  // describe('action handlers', () => {
  //   afterEach(() => {
  //     jest.clearAllMocks()
  //   })
  //   it('renders action handlers as clickable elements', async () => {
  //     const { wrapper } = getWrapper(
  //       filesPersonalRoute,
  //       {
  //         name: 'exampleFile',
  //         extension: 'jpg',
  //         mimeType: 'application/fileFormat2',
  //         type: 'file'
  //       },
  //       exampleApps
  //     )
  //
  //     console.log(wrapper.html())
  //     for (const section of mockMenuSections) {
  //       for (const item of section.items) {
  //         const buttonElement = wrapper.find(item.selector)
  //         expect(buttonElement.exists()).toBeTruthy()
  //         await buttonElement.trigger('click')
  //         expect(item.handler).toHaveBeenCalledTimes(1)
  //       }
  //     }
  //   })
  // })

  describe('menu items', () => {
    it('renders a list of actions for a file', () => {
      const { wrapper } = getWrapper(filesPersonalRoute, {
        name: 'exampleFile',
        extension: 'jpg',
        mimeType: 'application/fileFormat2',
        type: 'file'
      })

      expect(wrapper).toMatchSnapshot()
    })

    it('renders a list of actions for a folder', () => {
      const { wrapper } = getWrapper(filesPersonalRoute, {
        name: 'exampleFolder',
        extension: '',
        type: 'folder'
      })

      expect(wrapper).toMatchSnapshot()
    })
  })
})

function getWrapper(route, { filename, extension, type = '', mimeType }: any, availableApps = []) {
  const storeOptions = {
    ...defaultStoreMockOptions,
    state: {
      apps: { fileEditors: [] },
      user: { capabilities: {} }
    },
    External: {
      namespaced: true,
      getters: {
        mimeTypes: () => {
          return fixtureMimeTypes
        }
      }
    },
    getters: {
      ...defaultStoreMockOptions.getters,
      capabilities: () => ({
        files: {
          app_providers: [
            {
              apps_url: '/app/list',
              enabled: true,
              open_url: '/app/open'
            }
          ]
        }
      })
    }
  }
  storeOptions.modules.Files.getters.currentFolder.mockImplementation(() => '/')
  const store = createStore(storeOptions)
  const mocks = defaultComponentMocks()

  return {
    storeOptions,
    mocks,
    wrapper: mount(ContextActions, {
      data: () => ({ appList: availableApps }),
      props: {
        space: mockDeep<SpaceResource>(),
        items: [
          {
            id: 'a93f8adf==',
            fileId: 'a93f8adf==',
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
        ]
      },
      global: {
        mocks,
        provide: { currentSpace: mockDeep<SpaceResource>() },
        stubs: defaultStubs,
        plugins: [...defaultPlugins(), store]
      }
    })
  }
}
