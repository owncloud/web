import { filesModuleMockOptions } from './filesModuleMockOptions'
import { runtimeModuleMockOptions } from './runtimeModuleMockOptions'

export const defaultStoreMockOptions = {
  commit: jest.fn(),
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
