export const filesModuleMockOptions = {
  Files: {
    namespaced: true,
    getters: {
      currentFolder: jest.fn(),
      files: jest.fn(),
      selectedFiles: jest.fn()
    },
    mutations: {
      SET_FILE_SELECTION: jest.fn(),
      SET_SELECTED_IDS: jest.fn(),
      RENAME_FILE: jest.fn(),
      SET_HIDDEN_FILES_VISIBILITY: jest.fn(),
      SET_FILE_EXTENSIONS_VISIBILITY: jest.fn()
    },
    actions: {
      deleteFiles: jest.fn()
    }
  }
}
