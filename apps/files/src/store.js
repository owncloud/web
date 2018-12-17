import { findIndex, without } from 'lodash'

const namespaced = true

const state = {
  files: [],
  selected: []
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
      return pathList[pathList.length - 1]
    }()),
    path: file.name,
    id: file['fileInfo']['{DAV:}getetag']
  })
}

const mutations = {
  LOAD_FILES (state, files) {
    state.files = files
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
  }
}

const actions = {
  loadFiles (context, files) {
    files = files.map(_buildFile)
    context.commit('LOAD_FILES', files)
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
  }
}

const getters = {
  selectedFiles: state => {
    if (state.selected.length === 0) {
      return []
    } else {
      return state.selected
    }
  },
  files: state => {
    return state.files
  }
}

export default {
  namespaced,
  state,
  actions,
  mutations,
  getters
}
