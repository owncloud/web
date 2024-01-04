import { isProjectSpaceResource } from '@ownclouders/web-client/src/helpers'
import { ShareTypes } from '@ownclouders/web-client/src/helpers/share'

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
  clipboardResources: (state) => {
    return state.clipboardResources
  },
  clipboardAction: (state) => {
    return state.clipboardAction
  },
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
    const spaceCount = getters.filesAll.filter((file) => isProjectSpaceResource(file)).length
    return {
      files: fileCount,
      folders: folderCount,
      spaces: spaceCount
    }
  },
  outgoingCollaborators: (state) => {
    return state.outgoingShares.filter((s) =>
      ShareTypes.containsAnyValue(ShareTypes.authenticated, [s.shareType])
    )
  },
  incomingCollaborators: (state) => {
    return state.incomingShares.filter((s) =>
      ShareTypes.containsAnyValue(ShareTypes.authenticated, [s.shareType])
    )
  },
  outgoingLinks: (state) => {
    return state.outgoingShares.filter((share) => {
      return ShareTypes.containsAnyValue(ShareTypes.unauthenticated, [share.shareType])
    })
  },
  sharesLoading: (state) => state.sharesLoading,
  highlightedFile: (state, getters) => {
    if (getters.selectedFiles.length > 0) {
      return getters.selectedFiles[0]
    }
    return state.currentFolder
  },
  versions: (state) => {
    return state.versions
  },
  areHiddenFilesShown: (state) => {
    return state.areHiddenFilesShown
  },
  areFileExtensionsShown: (state) => {
    return state.areFileExtensionsShown
  },
  areWebDavDetailsShown: (state) => {
    return state.areWebDavDetailsShown
  }
}
