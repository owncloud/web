export const filesModuleMockOptions = {
  Files: {
    namespaced: true,
    state: {
      highlightedFile: undefined,
      currentFolder: undefined,
      latestSelectedId: undefined,
      areFileExtensionsShown: undefined
    },
    getters: {
      currentFolder: jest.fn(),
      files: jest.fn(() => []),
      activeFiles: jest.fn(),
      highlightedFile: jest.fn(),
      clipboardResources: jest.fn(() => []),
      selectedFiles: jest.fn(() => []),
      versions: jest.fn(() => []),
      outgoingCollaborators: jest.fn(() => []),
      outgoingLinks: jest.fn(() => []),
      sharesLoading: jest.fn(() => false)
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
      SET_LATEST_SELECTED_FILE_ID: jest.fn(),
      CLEAR_FILES_SEARCHED: jest.fn(),
      CLEAR_CLIPBOARD: jest.fn(),
      PRUNE_SHARES: jest.fn()
    },
    actions: {
      deleteFiles: jest.fn(),
      pasteSelectedFiles: jest.fn(),
      clearClipboardFiles: jest.fn(),
      loadIndicators: jest.fn(),
      loadVersions: jest.fn(),
      loadShares: jest.fn(),
      deleteShare: jest.fn(),
      updateLink: jest.fn(),
      clearTrashBin: jest.fn(),
      removeFilesFromTrashbin: jest.fn(),
      changeShare: jest.fn(),
      addLink: jest.fn(),
      addShare: jest.fn(),
      copySelectedFiles: jest.fn(),
      cutSelectedFiles: jest.fn(),
      resetFileSelection: jest.fn(),
      toggleFileSelection: jest.fn()
    }
  }
}
