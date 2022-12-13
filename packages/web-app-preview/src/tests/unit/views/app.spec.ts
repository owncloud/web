import App from '../../../App.vue'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import GetTextPlugin from 'vue-gettext'
import { ClientService } from 'web-pkg/src'
import { mockDeep } from 'jest-mock-extended'
import { createStore } from 'vuex-extensions'
import { getActions } from 'web-app-files/tests/__fixtures__/fileActions'

const localVue = createLocalVue()

localVue.use(GetTextPlugin, {
  translations: 'does-not-matter.json',
  silent: true
})
localVue.use(Vuex)
localVue.prototype.$gettextInterpolate = jest.fn()
localVue.prototype.$ngettext = jest.fn()

const filteredFiles = [
  {
    id: '1',
    name: 'bear.png',
    mimeType: 'image/png',
    path: 'personal/admin/bear.png'
  },
  {
    id: '2',
    name: 'elephant.png',
    mimeType: 'image/png',
    path: 'personal/admin/elephant.png'
  },
  {
    id: '3',
    name: 'wale_sounds.mp3',
    mimeType: 'audio/mp3',
    path: 'personal/admin/wale_sounds.mp3'
  },
  {
    id: '4',
    name: 'lonely_sloth_very_sad.jpg',
    mimeType: 'image/jpg',
    path: 'personal/admin/lonely_sloth_very_sad.jpg'
  },
  {
    id: '5',
    name: 'tiger_eats_plants.mp4',
    mimeType: 'video/mp4',
    path: 'personal/admin/tiger_eats_plants.mp4'
  },
  {
    id: '6',
    name: 'happy_hippo.jpg',
    mimeType: 'image/jpg',
    path: 'personal/admin/happy_hippo.jpg'
  },
  {
    id: '7',
    name: 'sleeping_dog.jpg',
    mimeType: 'image/jpg',
    path: 'personal/admin/sleeping_dog.jpg'
  },
  {
    id: '8',
    name: 'cat_murr_murr.jpg',
    mimeType: 'image/jpg',
    path: 'personal/admin/cat_murr_murr.jpg'
  },
  {
    id: '9',
    name: 'labrador.jpg',
    mimeType: 'image/jpg',
    path: 'personal/admin/labrador.jpg'
  }
]

const driveAliasAndItem = filteredFiles[5].path
const route = {
  params: {
    driveAliasAndItem: driveAliasAndItem,
    space: {
      getDriveAliasAndItem: jest.fn().mockImplementation((file) => {
        return filteredFiles.find((filteredFile) => filteredFile.id == file.id)?.path
      })
    }
  }
}

describe('Preview app', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Method "preloadImages"', () => {
    it('should preload images', () => {
      const wrapper = createShallowMountWrapper()
    })
  })
})

function createShallowMountWrapper(options = {}) {
  return shallowMount(App, {
    localVue,
    setup: () => ({}),
    store: createStore(Vuex.Store, {
      actions: {
        createModal: jest.fn(),
        hideModal: jest.fn(),
        showMessage: jest.fn()
      },
      getters: {
        user: () => ({ id: 1 }),
        configuration: () => ({
          server: 'https://example.com'
        }),
        activeFiles: () => ['3']
      },
      modules: {
        runtime: {
          namespaced: true,
          modules: {
            auth: {
              namespaced: true,
              getters: {
                accessToken: () => ''
              }
            }
          }
        }
      }
    }),
    stubs: {
      'oc-button': true,
      'oc-icon': true,
      'oc-spinner': true
    },
    mocks: {
      $route: route,
      $clientService: mockDeep<ClientService>(),
      closeApp: jest.fn(),
      isFolderLoading: jest.fn().mockImplementation(() => false),
      isFullScreenModeActivated: false,
      toggleFullscreenMode: jest.fn(),
      loadFolderForFileContext: jest.fn(),
      currentFileContext: route.params
    },
    computed: {
      filteredFiles: () => filteredFiles
    },
    methods: {},
    ...options
  })
}
