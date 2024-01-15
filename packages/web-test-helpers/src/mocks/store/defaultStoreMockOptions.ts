import { filesModuleMockOptions } from './filesModuleMockOptions'
import { runtimeModuleMockOptions } from './runtimeModuleMockOptions'

export const defaultStoreMockOptions = {
  commit: jest.fn(),
  getters: {
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
    External: {
      getters: {
        mimeTypes: jest.fn(() => ({}))
      }
    }
  }
} // FIXME: when we switch to TypeScript 4.9: satisfies StoreOptionsExtended<any>
