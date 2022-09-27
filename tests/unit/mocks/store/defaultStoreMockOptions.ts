import { fileModuleMockOptions } from './fileModuleMockOptions'
import { runtimeModuleMockOptions } from './runtimeModuleMockOptions'

export const defaultStoreMockOptions = {
  getters: {
    capabilities: jest.fn().mockImplementation(() => ({}))
  },
  modules: {
    ...fileModuleMockOptions,
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
