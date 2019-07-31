export default {
  inProgress: state => {
    return state.inProgress
  },
  selectedFiles: state => {
    if (state.selected.length === 0) {
      return []
    } else {
      return state.selected
    }
  },
  files: state => {
    return state.files
  },
  currentFolder: state => {
    return state.currentFolder
  },
  filterTerm: state => {
    return state.searchTermFilter
  },
  searchTerm: state => {
    return state.searchTermGlobal
  },
  atSearchPage: state => {
    return state.searchTermGlobal !== ''
  },
  fileFilter: state => {
    return state.fileFilter
  },
  activeFiles: state => {
    // if searchTermGlobal is set, replace current file list with search results
    const files = state.searchTermGlobal ? state.filesSearched : state.files
    // respect file filters set in TopBar
    return files.filter((file) => {
      for (const filter of state.fileFilter) {
        if (file.type === filter.tag) {
          if (!filter.value) return false
        } else if (file.name.startsWith('.')) {
          // show hidden files ?
          if (!state.fileFilter[2].value) return false
        }
      }
      // respect filename filter for local 'search' in open folder
      return !(state.searchTermFilter && !file.name.toLowerCase().includes(state.searchTermFilter.toLowerCase()))
    }).sort(function (a, b) {
      return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
    }
    )
  },
  davProperties: state => {
    return state.davProperties
  },
  dropzone: state => {
    return state.dropzone
  },
  shares: state => {
    return state.shares
  },
  sharesError: state => {
    return state.sharesError
  },
  sharesLoading: state => {
    return state.sharesLoading
  },
  loadingFolder: state => {
    return state.loadingFolder
  },
  freeSpace: state => {
    return state.freeSpace
  },
  trashbinDeleteMessage: state => {
    return state.trashbinDeleteMessage
  },
  filesDeleteMessage: state => {
    return state.filesDeleteMessage
  },
  overwriteDialogTitle: state => {
    return state.overwriteDialogTitle
  },
  overwriteDialogMessage: state => {
    return state.overwriteDialogMessage
  },
  highlightedFile: state => {
    return state.highlightedFile
  },
  collaboratorSaving: state => {
    return state.collaboratorSaving
  },
  publicLinkPassword: state => {
    return state.publicLinkPassword
  },
  collaboratorsEditInProgress: state => {
    return state.collaboratorsEditInProgress
  }
}
