import { filesModuleMockOptions } from './filesModuleMockOptions'
import { runtimeModuleMockOptions } from './runtimeModuleMockOptions'

export const defaultStoreMockOptions = {
  commit: jest.fn(),
  getters: {
    newFileHandlers: jest.fn(() => []),
    getNavItemsByExtension: jest.fn(),
    apps: jest.fn(() => ({})),
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
  }
} // FIXME: when we switch to TypeScript 4.9: satisfies StoreOptionsExtended<any>
