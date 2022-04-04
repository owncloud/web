import { ShareTypes } from '../helpers/share'

export default {
  inProgress: (state) => {
    return state.inProgress
  },
  selectedFiles: (state, getters) => {
    return getters.filesAll.filter((f) => state.selectedIds.includes(f.id))
  },
  files: (state) => {
    return state.files
  },
  filesAll: (state) => state.filesSearched || state.files,
  currentFolder: (state) => {
    return state.currentFolder
  },
  // a flat file list has no current folder nor parent
  flatFileList: (state) => !!state.currentFolder === false,
  activeFiles: (state, getters) => {
    let files = [].concat(getters.filesAll)

    if (!state.areHiddenFilesShown) {
      files = files.filter((file) => !file.name.startsWith('.'))
    }

    return files
  },
  totalFilesSize: (state, getters) => {
    return getters.filesAll.map((file) => parseInt(file.size)).reduce((x, y) => x + y, 0)
  },
  totalFilesCount: (state, getters) => {
    const fileCount = getters.filesAll.filter((file) => file.type === 'file').length
    const folderCount = getters.filesAll.filter((file) => file.type === 'folder').length
    return {
      files: fileCount,
      folders: folderCount
    }
  },
  currentFileOutgoingCollaborators: (state) => {
    return state.currentFileOutgoingShares.filter((share) => {
      return ShareTypes.containsAnyValue(ShareTypes.authenticated, [share.shareType])
    })
  },
  currentFileOutgoingLinks: (state) => {
    return state.currentFileOutgoingShares.filter((share) => {
      return ShareTypes.containsAnyValue(ShareTypes.unauthenticated, [share.shareType])
    })
  },
  currentFileOutgoingSharesLoading: (state) => {
    return state.currentFileOutgoingSharesLoading
  },
  sharesTree: (state) => state.sharesTree,
  sharesTreeLoading: (state) => state.sharesTreeLoading,
  loadingFolder: (state, getter) => {
    // when loading the shares tree, it is only related to the full folder
    // whenever no file is selected / no sidebar is open.
    // else it means we're loading the shares only for the sidebar contents and shouldn't
    // be showing a progress bar for the whole folder
    return state.loadingFolder || (getter.highlightedFile === null && state.sharesTreeLoading)
  },
  quota: (state) => {
    return state.quota
  },
  highlightedFile: (state, getters) => {
    if (getters.selectedFiles.length > 0) {
      return getters.selectedFiles[0]
    }
    return state.currentFolder
  },
  versions: (state) => {
    return state.versions
  },
  publicLinkPassword: (state) => {
    // we need to use the state for reactivity
    if (state.publicLinkPassword) {
      return state.publicLinkPassword
    }

    let password = sessionStorage.getItem('publicLinkInfo')
    if (password) {
      try {
        password = Buffer.from(password, 'base64').toString()
      } catch (e) {
        sessionStorage.removeItem('publicLinkInfo')
      }
    }

    return password
  },
  actionsInProgress: (state) => state.actionsInProgress
}
