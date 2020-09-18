import { fileSortFunctions } from '../fileSortFunctions.js'
import { shareTypes, userShareTypes } from '../helpers/shareTypes'

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
  fileSortField: state => state.fileSortField,
  fileSortDirectionDesc: state => state.fileSortDirectionDesc,
  // a flat file list has no current folder nor parent
  flatFileList: state => !!state.currentFolder === false,
  searchTerm: state => {
    return state.searchTermGlobal
  },
  atSearchPage: state => {
    return state.searchTermGlobal !== ''
  },
  activeFiles: state => {
    // if searchTermGlobal is set, replace current file list with search results
    const files = state.searchTermGlobal ? state.filesSearched : state.files
    // make a copy of array for sorting as sort() would modify the original array
    const direction = state.fileSortDirectionDesc ? 'desc' : 'asc'
    return [].concat(files).sort(fileSortFunctions[state.fileSortField][direction])
  },
  filesTotalSize: (state, getters) => {
    let totalSize = 0
    for (const file of getters.activeFiles) {
      totalSize += parseInt(file.size, 10)
    }

    return totalSize
  },
  activeFilesCount: (state, getters) => {
    const files = getters.activeFiles.filter(file => file.type === 'file')

    const folders = getters.activeFiles.filter(file => file.type === 'folder')

    return {
      files: files.length,
      folders: folders.length
    }
  },
  davProperties: state => {
    return state.davProperties
  },
  dropzone: state => {
    return state.dropzone
  },
  currentFileOutgoingCollaborators: state => {
    return state.currentFileOutgoingShares.filter(share => {
      return userShareTypes.includes(share.shareType)
    })
  },
  currentFileOutgoingLinks: state => {
    return state.currentFileOutgoingShares.filter(share => {
      return share.shareType === shareTypes.link
    })
  },
  currentFileOutgoingSharesLoading: state => {
    return state.currentFileOutgoingSharesLoading
  },
  sharesTree: state => state.sharesTree,
  sharesTreeLoading: state => state.sharesTreeLoading,
  loadingFolder: state => {
    // when loading the shares tree, it is only related to the full folder
    // whenever no file is selected / no sidebar is open.
    // else it means we're loading the shares only for the sidebar contents and shouldn't
    // be showing a progress bar for the whole folder
    return state.loadingFolder || (state.highlightedFile === null && state.sharesTreeLoading)
  },
  quota: state => {
    return state.quota
  },
  highlightedFile: state => {
    return state.highlightedFile
  },
  publicLinkPassword: state => {
    // we need to use the state for reactivity
    if (state.publicLinkPassword) {
      return state.publicLinkPassword
    }

    let password = sessionStorage.getItem('publicLinkInfo')
    if (password) {
      try {
        password = atob(password)
      } catch (e) {
        sessionStorage.removeItem('publicLinkInfo')
      }
    }

    return password
  },
  uploaded: state => state.uploaded,
  actionsInProgress: state => state.actionsInProgress
}
