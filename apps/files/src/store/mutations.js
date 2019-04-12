import { findIndex, without } from 'lodash'

export default {
  UPDATE_FILE_PROGRESS (state, progress) {
    let fileIndex = findIndex(state.inProgress, (f) => {
      return f.name === progress.fileName
    })
    if (fileIndex === -1) return
    state.inProgress[fileIndex].progress = progress.progress
  },
  REMOVE_FILE_FROM_PROGRESS (state, file) {
    let fileIndex = findIndex(state.inProgress, (f) => {
      return f.name === file.name
    })
    state.inProgress.splice(fileIndex - 1, 1)
  },
  ADD_FILE_TO_PROGRESS (state, file) {
    state.inProgress.push({
      id: file.id,
      name: file.name,
      type: file.type,
      size: file.size,
      progress: 0,
      action: 'upload'
    })
  },
  LOAD_FILES (state, { currentFolder, files }) {
    state.currentFolder = currentFolder
    state.files = files
  },
  LOAD_FILES_SEARCHED (state, files) {
    state.filesSearched = files
  },
  ADD_FILE_SELECTION (state, file) {
    state.selected.push(file)
  },
  REMOVE_FILE_SELECTION (state, file) {
    if (state.selected.length > 1) {
      state.selected = without(state.selected, file)
      return
    }
    state.selected = []
  },
  RESET_SELECTION (state) {
    state.selected = []
  },
  FAVORITE_FILE (state, item) {
    let fileIndex = findIndex(state.files, (f) => {
      return f.name === item.name
    })
    state.files[fileIndex].starred = !item.starred
  },
  ADD_FILE (state, file) {
    state.files.push(file)
  },
  REMOVE_FILE (state, file) {
    state.files = without(state.files, file)
  },
  SET_SEARCH_TERM (state, searchTerm) {
    state.searchTermGlobal = searchTerm
  },
  SET_FILTER_TERM (state, filterTerm) {
    state.searchTermFilter = filterTerm
  },
  SET_FILE_FILTER (state, filter) {
    let i = findIndex(state.fileFilter, (f) => {
      return f.name === filter.name
    })
    state.fileFilter[i].value = filter.value
  },
  RENAME_FILE (state, { file, newValue, newPath }) {
    let fileIndex = findIndex(state.files, (f) => {
      return f.name === file.name
    })
    state.files[fileIndex].name = newValue
    state.files[fileIndex].path = '/' + newPath + newValue
  }
}
