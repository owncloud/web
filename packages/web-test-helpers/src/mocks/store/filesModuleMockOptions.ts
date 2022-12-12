export const filesModuleMockOptions = {
  Files: {
    namespaced: true,
    state: {
      highlightedFile: undefined,
      currentFolder: undefined,
      sharesTree: {}
    },
    getters: {
      currentFolder: jest.fn(),
      files: jest.fn(() => []),
      activeFiles: jest.fn(),
      highlightedFile: jest.fn(),
      currentFileOutgoingCollaborators: jest.fn(() => []),
      indirectOutgoingShares: jest.fn(() => []),
      clipboardResources: jest.fn(() => []),
      selectedFiles: jest.fn(() => []),
      versions: jest.fn(() => []),
      sharesTree: jest.fn(() => ({}))
    },
    mutations: {
      SET_FILE_SELECTION: jest.fn(),
      SET_SELECTED_IDS: jest.fn(),
      RENAME_FILE: jest.fn(),
      SET_HIDDEN_FILES_VISIBILITY: jest.fn(),
      SET_FILE_EXTENSIONS_VISIBILITY: jest.fn(),
      UPSERT_RESOURCE: jest.fn(),
      CLEAR_CURRENT_FILES_LIST: jest.fn(),
      SET_CURRENT_FOLDER: jest.fn(),
      LOAD_FILES: jest.fn(),
      UPDATE_RESOURCE_FIELD: jest.fn(),
      REMOVE_FILE: jest.fn(),
      REMOVE_FILES: jest.fn(),
      CLEAR_FILES_SEARCHED: jest.fn()
    },
    actions: {
      deleteFiles: jest.fn(),
      pasteSelectedFiles: jest.fn(),
      clearClipboardFiles: jest.fn(),
      loadIndicators: jest.fn(),
      deleteShare: jest.fn(),
      clearTrashBin: jest.fn(),
      removeFilesFromTrashbin: jest.fn(),
      loadSharesTree: jest.fn(),
      changeShare: jest.fn()
    }
  }
}
