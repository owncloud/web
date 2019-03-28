import { findIndex, without, map, filter } from 'lodash'
import { fileFilters } from './fileFilters.js'
const namespaced = true

const state = {
  currentFolder: null,
  files: [],
  filesSearched: [],
  fileFilter: fileFilters,
  selected: [],
  inProgress: [],
  searchTermGlobal: '',
  searchTermFilter: '',
  davProperties: [
    '{http://owncloud.org/ns}permissions',
    '{http://owncloud.org/ns}favorite',
    '{http://owncloud.org/ns}fileid',
    '{http://owncloud.org/ns}owner-id',
    '{http://owncloud.org/ns}owner-display-name',
    '{DAV:}getcontentlength',
    '{http://owncloud.org/ns}size',
    '{DAV:}getlastmodified',
    '{DAV:}getetag',
    '{DAV:}resourcetype'
  ]
}

function _buildFile (file) {
  let ext = false
  if (file.type !== 'dir') {
    const ex = file.name.match(/\.[0-9a-z]+$/i)
    if (ex !== null) {
      ext = ex[0].substr(1)
    }
  }
  return ({
    type: (file.type === 'dir') ? 'folder' : file.type,
    id: file['fileInfo']['{http://owncloud.org/ns}fileid'],
    starred: file['fileInfo']['{http://owncloud.org/ns}favorite'] !== '0',
    mdate: file['fileInfo']['{DAV:}getlastmodified'],
    cdate: '', // TODO: Retrieve data of creation of a file
    size: (function () {
      if (file.type === 'dir') {
        return file['fileInfo']['{http://owncloud.org/ns}size'] / 100
      } else {
        return file['fileInfo']['{DAV:}getcontentlength'] / 100
      }
    }()),
    extension: ext,
    name: (function () {
      let pathList = file.name.split('/').filter(e => e !== '')
      return pathList.length === 0 ? '' : pathList[pathList.length - 1]
    }()),
    basename: (function () {
      let pathList = file.name.split('/').filter(e => e !== '')
      let name =  pathList.length === 0 ? '' : pathList[pathList.length - 1]
      if (ext) {
        return name.substring(0, name.length - ext.length - 1)
      }
      return name
    }()),
    path: file.name,
    permissions: file['fileInfo']['{http://owncloud.org/ns}permissions'],
    sharePermissions: file['fileInfo']['{http://open-collaboration-services.org/ns}share-permissions'],
    canUpload: function () {
      return this.permissions.indexOf('C') >= 0
    },
    canDownload: function () {
      return this.type !== 'folder'
    },
    canBeDeleted: function () {
      return this.permissions.indexOf('D') >= 0
    },
    canRename: function () {
      return this.permissions.indexOf('N') >= 0
    }
  })
}

const mutations = {
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

const actions = {
  updateFileProgress ({ commit }, progress) {
    if (progress.progress === 100) commit('REMOVE_FILE_FROM_PROGRESS', { name: progress.fileName })
    else commit('UPDATE_FILE_PROGRESS', progress)
  },
  addFileToProgress ({ commit }, file) {
    commit('ADD_FILE_TO_PROGRESS', file)
  },
  loadFiles (context, { currentFolder, files }) {
    currentFolder = _buildFile(currentFolder)
    files = files.map(_buildFile)
    context.commit('LOAD_FILES', { currentFolder, files })
  },
  addFileSelection (context, file) {
    context.commit('ADD_FILE_SELECTION', file)
  },
  removeFileSelection (context, file) {
    context.commit('REMOVE_FILE_SELECTION', file)
  },
  resetFileSelection (context) {
    context.commit('RESET_SELECTION')
  },
  markFavorite (context, payload) {
    let file = payload.file
    let client = payload.client
    let newValue = !file.starred
    client.files.favorite(file.path, newValue)
      .then(() => {
        context.commit('FAVORITE_FILE', file)
      })
      .catch(error => {
        console.log(error)
      })
  },
  addFiles (context, payload) {
    let files = payload.files
    for (let file of files) {
      context.commit('ADD_FILE', _buildFile(file))
    }
  },
  deleteFiles (context, payload) {
    let files = payload.files
    let client = payload.client
    for (let file of files) {
      client.files.delete(file.path).then(() => {
        context.commit('REMOVE_FILE', file)
        context.commit('REMOVE_FILE_SELECTION', file)
      }).catch(error => {
        console.log('error: ' + file.path + ' not deleted: ' + error)
      })
    }
  },
  renameFile (context, payload) {
    let file = payload.file
    let newValue = payload.newValue
    let client = payload.client
    if (file !== undefined && newValue !== undefined && newValue !== file.name) {
      let newPath = file.path.substr(1, file.path.lastIndexOf('/'))
      client.files.move(file.path, (newPath + newValue)).then(() => {
        context.commit('RENAME_FILE', { file, newValue, newPath })
      })
    }
  },
  setFilterTerm (context, filterTerm) {
    context.commit('SET_FILTER_TERM', filterTerm)
  },
  setFileFilter (context, filter) {
    context.commit('SET_FILE_FILTER', filter)
  },
  searchForFile (context, payload) {
    return new Promise(function (resolve, reject) {
      let client = payload.client
      let searchTerm = payload.searchTerm
      context.commit('SET_SEARCH_TERM', searchTerm)
      // TODO respect user selected listSize from state.config
      // do not search for empty strings
      if (!searchTerm) return
      client.files.search(searchTerm, null, context.state.davProperties).then((filesSearched) => {
        filesSearched = map(filesSearched, (f) => {
          let file = _buildFile(f)
          return file
        })
        context.commit('LOAD_FILES_SEARCHED', filesSearched)
        resolve(filesSearched)
      }).catch((error) => {
        // TODO notification missing
        context.dispatch('showNotification', {
          title: this.$gettext('Error while searching.'),
          desc: error.message,
          type: 'error'
        }, { root: true })
        reject(error)
      })
    })
  }
}

const getters = {
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
    let files = state.searchTermGlobal ? state.filesSearched : state.files
    // respect file filters set in TopBar
    return filter(files, (file) => {
      for (let filter of state.fileFilter) {
        if (file.type === filter.tag) {
          if (!filter.value) return false
        } else if (file.name.startsWith('.')) {
          // show hidden files ?
          if (!state.fileFilter[2].value) return false
        }
      }
      // respect filename filter for local 'search' in open folder
      if (state.searchTermFilter && !file.name.toLowerCase().includes(state.searchTermFilter.toLowerCase())) return false
      return true
    })
  },
  davProperties: state => {
    return state.davProperties
  }
}

export default {
  namespaced,
  state,
  actions,
  mutations,
  getters
}
