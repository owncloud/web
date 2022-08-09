import { ShareTypes } from 'web-client/src/helpers/share'

export default {
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
  }
}
