export const filesModuleMockOptions = {
  Files: {
    namespaced: true,
    state: {
      currentFolder: undefined,
      latestSelectedId: undefined,
      areFileExtensionsShown: undefined
    },
    getters: {
      currentFolder: jest.fn(),
      files: jest.fn(() => []),
      activeFiles: jest.fn(),
      selectedFiles: jest.fn(() => []),
      versions: jest.fn(() => [])
    },
    mutations: {
      SET_FILE_SELECTION: jest.fn(),
      ADD_FILE_SELECTION: jest.fn(),
      SET_SELECTED_IDS: jest.fn(),
      RENAME_FILE: jest.fn(),
      SET_HIDDEN_FILES_VISIBILITY: jest.fn(),
      SET_FILE_EXTENSIONS_VISIBILITY: jest.fn(),
      SET_FILE_WEB_DAV_DETAILS_VISIBILITY: jest.fn(),
      UPSERT_RESOURCE: jest.fn(),
      CLEAR_CURRENT_FILES_LIST: jest.fn(),
      SET_CURRENT_FOLDER: jest.fn(),
      LOAD_FILES: jest.fn(),
      UPDATE_RESOURCE_FIELD: jest.fn(),
      REMOVE_FILE: jest.fn(),
      REMOVE_FILES: jest.fn(),
      RESET_SELECTION: jest.fn(),
      SET_LATEST_SELECTED_FILE_ID: jest.fn()
    },
    actions: {
      deleteFiles: jest.fn(),
      loadIndicators: jest.fn(),
      loadVersions: jest.fn(),
      clearTrashBin: jest.fn(),
      removeFilesFromTrashbin: jest.fn(),
      resetFileSelection: jest.fn(),
      toggleFileSelection: jest.fn()
    }
  }
}
