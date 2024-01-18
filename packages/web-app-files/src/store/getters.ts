import { isProjectSpaceResource } from '@ownclouders/web-client/src/helpers'

export default {
  selectedFiles: (state, getters) => {
    return getters.files.filter((f) => state.selectedIds.includes(f.id))
  },
  files: (state) => {
    return state.files
  },
  currentFolder: (state) => {
    return state.currentFolder
  },
  activeFiles: (state, getters) => {
    let files = [].concat(getters.files)

    if (!state.areHiddenFilesShown) {
      files = files.filter((file) => !file.name.startsWith('.'))
    }

    return files
  },
  totalFilesSize: (state, getters) => {
    return getters.files.map((file) => parseInt(file.size)).reduce((x, y) => x + y, 0)
  },
  totalFilesCount: (state, getters) => {
    const fileCount = getters.files.filter((file) => file.type === 'file').length
    const folderCount = getters.files.filter((file) => file.type === 'folder').length
    const spaceCount = getters.files.filter((file) => isProjectSpaceResource(file)).length
    return {
      files: fileCount,
      folders: folderCount,
      spaces: spaceCount
    }
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
