import { filesModuleMockOptions } from './filesModuleMockOptions'
import { runtimeModuleMockOptions } from './runtimeModuleMockOptions'

export const defaultStoreMockOptions = {
  commit: jest.fn(),
  getters: {
    newFileHandlers: jest.fn(() => []),
    getNavItemsByExtension: jest.fn(),
    apps: jest.fn(() => ({})),
    quota: jest.fn(() => ({})),
    capabilities: jest.fn().mockImplementation(() => ({})),
    user: jest.fn().mockImplementation(() => ({})),
    configuration: jest.fn().mockImplementation(() => ({
      currentTheme: { general: { slogan: '' } },
      options: {
        editor: {
          autosaveEnabled: false,
          autosaveInterval: 120
        }
      }
    }))
  },
  modules: {
    ...filesModuleMockOptions,
    ...runtimeModuleMockOptions,
    apps: {
      state: {
        fileEditors: [],
        meta: {}
      },
      getters: {
        fileSideBars: jest.fn(() => [])
      }
    },
    External: {
      getters: {
        mimeTypes: jest.fn(() => ({}))
      }
    }
  },
  actions: {
    createModal: jest.fn(),
    hideModal: jest.fn(),
    toggleModalConfirmButton: jest.fn(),
    showMessage: jest.fn(),
    deleteNotification: jest.fn(),
    loadTheme: jest.fn(),
    setModalInputErrorMessage: jest.fn()
  },
  mutations: {
    SET_QUOTA: () => jest.fn()
  }
} // FIXME: when we switch to TypeScript 4.9: satisfies StoreOptionsExtended<any>
