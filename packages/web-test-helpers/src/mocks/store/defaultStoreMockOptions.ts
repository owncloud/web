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
    setModalConfirmButtonDisabled: jest.fn(),
    showMessage: jest.fn(),
    showErrorMessage: jest.fn(),
    deleteNotification: jest.fn(),
    setModalInputErrorMessage: jest.fn(),
    openNavigation: jest.fn(),
    closeNavigation: jest.fn()
  },
  mutations: {
    SET_QUOTA: () => jest.fn()
  },
  state: {
    navigation: {
      closed: false
    }
  }
} // FIXME: when we switch to TypeScript 4.9: satisfies StoreOptionsExtended<any>
