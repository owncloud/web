import { filesModuleMockOptions } from './filesModuleMockOptions'
import { runtimeModuleMockOptions } from './runtimeModuleMockOptions'

export const defaultStoreMockOptions = {
  getters: {
    capabilities: jest.fn().mockImplementation(() => ({})),
    configuration: jest
      .fn()
      .mockImplementation(() => ({ currentTheme: { general: { slogan: '' } } }))
  },
  modules: {
    ...filesModuleMockOptions,
    ...runtimeModuleMockOptions
  },
  actions: {
    createModal: jest.fn(),
    hideModal: jest.fn(),
    toggleModalConfirmButton: jest.fn(),
    showMessage: jest.fn(),
    setModalInputErrorMessage: jest.fn()
  }
} // FIXME: when we switch to TypeScript 4.9: satisfies StoreOptionsExtended<any>
