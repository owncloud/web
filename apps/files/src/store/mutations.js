import Vue from 'vue'
import _ from 'lodash'

export default {
  UPDATE_FILE_PROGRESS (state, file) {
    const fileIndex = state.inProgress.findIndex((f) => {
      return f.id === file.id
    })

    if (fileIndex === -1) return

    state.inProgress[fileIndex].progress = file.progress
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

  REMOVE_FILE_FROM_PROGRESS (state, file) {
    const fileIndex = state.inProgress.findIndex((f) => {
      return f.id === file.id
    })

    state.inProgress.splice(fileIndex, 1)
    if (state.inProgress.length < 1) {
      state.inProgress = []
      state.uploaded = []
      return
    }

    file.progress = 100
    state.uploaded.push(file)
  },

  LOAD_FILES (state, { currentFolder, files }) {
    state.currentFolder = currentFolder
    state.files = files
  },
  LOAD_FILES_SEARCHED (state, files) {
    state.filesSearched = files
  },
  ADD_FILE_SELECTION (state, file) {
    const fileIndex = state.selected.findIndex((f) => {
      return f.id === file.id
    })
    if (fileIndex === -1) {
      state.selected.push(file)
    }
  },
  REMOVE_FILE_SELECTION (state, file) {
    if (state.selected.length > 1) {
      state.selected = state.selected.filter(i => ![file].includes(i))
      return
    }
    state.selected = []
  },
  RESET_SELECTION (state) {
    state.selected = []
  },
  FAVORITE_FILE (state, item) {
    const fileIndex = state.files.findIndex((f) => {
      return f.id === item.id
    })
    state.files[fileIndex].starred = !item.starred
  },
  ADD_FILE (state, file) {
    state.files = state.files.filter(i => file.id !== i.id)
    state.files.push(file)
  },
  REMOVE_FILE (state, file) {
    state.files = state.files.filter(i => ![file].includes(i))
  },
  SET_SEARCH_TERM (state, searchTerm) {
    state.searchTermGlobal = searchTerm
  },
  SET_FILTER_TERM (state, filterTerm) {
    state.searchTermFilter = filterTerm
  },
  SET_FILE_FILTER (state, filter) {
    const i = state.fileFilter.findIndex((f) => {
      return f.name === filter.name
    })
    state.fileFilter[i].value = filter.value
  },
  RENAME_FILE (state, { file, newValue, newPath }) {
    const fileIndex = state.files.findIndex((f) => {
      return f.id === file.id
    })
    let ext = ''
    const name = newValue
    let baseName = newValue
    if (file.type !== 'dir') {
      const ex = name.match(/\.[0-9a-z]+$/i)
      if (ex !== null) {
        ext = ex[0].substr(1)
        baseName = name.substring(0, name.length - ext.length - 1)
      }
    }

    state.files[fileIndex].name = name
    state.files[fileIndex].basename = baseName
    state.files[fileIndex].extension = ext
    state.files[fileIndex].path = '/' + newPath + newValue
  },
  DRAG_OVER (state, value) {
    state.dropzone = value
  },
  SHARES_LOAD (state, shares) {
    state.shares = shares
  },
  SHARES_ADD_SHARE (state, share) {
    state.shares.push(share)
  },
  SHARES_REMOVE_SHARE (state, share) {
    state.shares = state.shares.filter(i => ![share].includes(i))
  },
  SHARES_UPDATE_SHARE (state, share) {
    const fileIndex = state.shares.findIndex((s) => {
      return s.info.id === share.info.id
    })
    if (fileIndex >= 0) {
      Vue.set(state.shares, fileIndex, share)
    } else {
      // share was not present in the list while updating, add it instead
      state.shares.push(share)
    }
  },
  SHARES_ERROR (state, error) {
    state.shares = []
    state.sharesError = error
  },
  SHARES_LOADING (state, loading) {
    state.sharesLoading = loading
  },
  SHARESTREE_CLEAR (state) {
    state.sharesTree = {}
  },
  SHARESTREE_PRUNE_OUTSIDE_PATH (state, pathToKeep) {
    if (pathToKeep !== '' && pathToKeep !== '/') {
      // clear all children unrelated to the given path
      //
      // for example if the following paths are cached:
      // - a
      // - a/b
      // - a/b/c
      // - d/e/f
      //
      // and we request to keep only "a/b", the remaining tree becomes:
      // - a
      // - a/b
      pathToKeep += '/'
      if (pathToKeep.charAt(0) !== '/') {
        pathToKeep = '/' + pathToKeep
      }
      state.sharesTree = _.pickBy(state.sharesTree, (shares, path) => {
        return _.startsWith(pathToKeep, path + '/')
      })
    } else {
      state.sharesTree = {}
    }
  },
  SHARESTREE_ADD (state, sharesTree) {
    Object.assign(state.sharesTree, sharesTree)
  },
  SHARESTREE_ERROR (state, error) {
    state.sharesTreeError = error
  },
  SHARESTREE_LOADING (state, loading) {
    state.sharesTreeLoading = loading
  },
  UPDATE_FOLDER_LOADING (state, value) {
    state.loadingFolder = value
  },
  CHECK_QUOTA (state, quota) {
    state.quota = quota
  },
  SET_TRASHBIN_DELETE_CONFIRMATION (state, message) {
    state.trashbinDeleteMessage = message
  },
  PROMPT_FILE_RENAME (state, file) {
    state.renameDialogOpen = true
    state.renameDialogOriginalName = file.name
    state.renameDialogSelectedFile = file
    state.renameDialogNewName = file.name
  },
  CLOSE_PROMPT_FILE_RENAME (state) {
    state.renameDialogOpen = false
    state.renameDialogOriginalName = null
    state.renameDialogSelectedFile = null
    state.renameDialogNewName = null
  },
  PROMPT_FILE_DELETE (state, { message, items }) {
    state.deleteDialogOpen = true
    state.deleteDialogSelectedFiles = items
    state.deleteDialogMessage = message
  },
  CLOSE_PROMPT_FILE_DELETE (state, item) {
    state.deleteDialogOpen = false
    state.deleteDialogSelectedFiles = null
    state.deleteDialogMessage = null
  },
  SET_OVERWRITE_DIALOG_TITLE (state, title) {
    state.overwriteDialogTitle = title
  },
  SET_OVERWRITE_DIALOG_MESSAGE (state, message) {
    state.overwriteDialogMessage = message
  },
  SET_HIGHLIGHTED_FILE (state, file) {
    if (typeof file === 'string') {
      const fileIndex = state.files.findIndex((f) => {
        return f.name === file
      })
      if (fileIndex === -1) {
        return
      }
      file = state.files[fileIndex]
    }
    state.highlightedFile = file
  },
  TOGGLE_COLLABORATOR_SAVING (state, saving) {
    state.collaboratorSaving = saving
  },
  SET_PUBLIC_LINK_PASSWORD (state, password) {
    state.publicLinkPassword = password
  },
  TOGGLE_COLLABORATORS_EDIT (state, inProgress) {
    state.collaboratorsEditInProgress = inProgress
  },
  LINKS_PURGE (state) {
    state.links = []
  },
  LINKS_LOADING (state, loading) {
    state.linksLoading = loading
  },
  LINKS_ERROR (state, error) {
    state.linksError = error
  },
  LINKS_ADD (state, link) {
    state.links.push(link)
  },
  LINKS_REMOVE (state, linkId) {
    state.links = state.links.filter(link => link.id !== linkId)
  },
  LINKS_UPDATE (state, linkUpdated) {
    state.links = state.links.map(link => {
      if (link.id === linkUpdated.id) {
        return linkUpdated
      }

      return link
    })
  },

  ADD_ACTION_TO_PROGRESS (state, item) {
    state.actionsInProgress.push(item)
  },

  REMOVE_ACTION_FROM_PROGRESS (state, item) {
    const itemIndex = state.actionsInProgress.findIndex(i => {
      return i === item
    })

    state.actionsInProgress.splice(itemIndex, 1)
  },

  CLEAR_CURRENT_FILES_LIST (state) {
    state.currentFolder = null
    state.files = []
  }
}
