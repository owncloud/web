import { filesModuleMockOptions } from './filesModuleMockOptions'
import { runtimeModuleMockOptions } from './runtimeModuleMockOptions'

export const defaultStoreMockOptions = {
  getters: {
    newFileHandlers: jest.fn(() => []),
    capabilities: jest.fn().mockImplementation(() => ({})),
    configuration: jest
      .fn()
      .mockImplementation(() => ({ currentTheme: { general: { slogan: '' } } }))
  },
  modules: {
    ...filesModuleMockOptions,
    ...runtimeModuleMockOptions,
    apps: {
      getters: {
        fileSideBars: jest.fn(() => [])
      }
    }
  },
  actions: {
    createModal: jest.fn(),
    hideModal: jest.fn(),
    toggleModalConfirmButton: jest.fn(),
    showMessage: jest.fn(),
    setModalInputErrorMessage: jest.fn()
  },
  mutations: {
    SET_QUOTA: () => jest.fn()
  }
} // FIXME: when we switch to TypeScript 4.9: satisfies StoreOptionsExtended<any>
