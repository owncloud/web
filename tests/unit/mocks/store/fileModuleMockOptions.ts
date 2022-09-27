export const fileModuleMockOptions = {
  Files: {
    namespaced: true,
    getters: {
      currentFolder: jest.fn(),
      files: jest.fn()
    },
    mutations: {
      SET_FILE_SELECTION: jest.fn(),
      RENAME_FILE: jest.fn()
    },
    actions: {
      deleteFiles: jest.fn()
    }
  }
}
