import Vue from 'vue'
import pickBy from 'lodash-es/pickBy'
import { DateTime } from 'luxon'
import { set, has } from 'lodash-es'
import { getIndicators } from '../helpers/statusIndicators'

/**
 * @param {Array.<Object>} shares array of shares
 * @return {Array.<Integer>} array of share types
 */
function computeShareTypes(shares) {
  const shareTypes = new Set()
  shares.forEach(share => {
    shareTypes.add(share.shareType)
  })
  return Array.from(shareTypes)
}

export default {
  UPDATE_FILE_PROGRESS(state, file) {
    const inProgress = [...state.inProgress]

    const fileIndex = inProgress.findIndex(f => {
      return f.id === file.id
    })
    if (fileIndex === -1) return

    inProgress[fileIndex].progress = file.progress
    state.inProgress = inProgress
  },

  ADD_FILE_TO_PROGRESS(state, file) {
    const inProgress = [...state.inProgress]
    inProgress.push({
      id: file.id,
      name: file.name,
      type: file.type,
      size: file.size,
      progress: 0,
      action: 'upload'
    })
    state.inProgress = inProgress
  },

  REMOVE_FILE_FROM_PROGRESS(state, file) {
    const inProgress = [...state.inProgress]
    const fileIndex = inProgress.findIndex(f => {
      return f.id === file.id
    })

    inProgress.splice(fileIndex, 1)
    if (inProgress.length < 1) {
      state.inProgress = []
      state.uploaded = []
      return
    }
    state.inProgress = inProgress

    const uploaded = [...state.uploaded]
    file.progress = 100
    uploaded.push(file)
    state.uploaded = uploaded
  },

  LOAD_FILES(state, { currentFolder, files }) {
    state.currentFolder = currentFolder
    state.files = files
  },
  SET_CURRENT_FOLDER(state, currentFolder) {
    state.currentFolder = currentFolder
  },
  LOAD_FILES_SEARCHED(state, files) {
    state.filesSearched = files
  },
  REMOVE_FILE_FROM_SEARCHED(state, file) {
    if (!state.filesSearched) {
      return
    }

    state.filesSearched = state.filesSearched.filter(i => file.id !== i.id)
  },
  CLEAR_FILES_SEARCHED(state) {
    state.filesSearched = null
  },
  SET_FILE_SELECTION(state, files) {
    state.selected = files
  },
  ADD_FILE_SELECTION(state, file) {
    const selected = [...state.selected]
    const fileIndex = selected.findIndex(f => {
      return f.id === file.id
    })
    if (fileIndex === -1) {
      selected.push(file)
      state.selected = selected
    }
  },
  REMOVE_FILE_SELECTION(state, file) {
    const selected = [...state.selected]
    if (selected.length > 1) {
      state.selected = selected.filter(i => file.id !== i.id)
      return
    }
    state.selected = []
  },
  RESET_SELECTION(state) {
    state.selected = []
  },
  FAVORITE_FILE(state, item) {
    const files = [...state.files]
    const fileIndex = files.findIndex(f => {
      return f.id === item.id
    })
    files[fileIndex].starred = !item.starred
    state.files = files
  },
  REMOVE_FILE(state, removedFile) {
    state.files = [...state.files].filter(file => file.id !== removedFile.id)
  },
  UPDATE_CURRENT_FILE_SHARE_TYPES(state) {
    const files = [...state.files]
    const highlighted = state.selected[0]
    if (!highlighted) {
      return
    }
    const fileIndex = files.findIndex(f => {
      return f.id === highlighted.id
    })
    files[fileIndex].shareTypes = computeShareTypes(state.currentFileOutgoingShares)
    state.files = files
  },
  RENAME_FILE(state, { file, newValue, newPath }) {
    const resources = [...state.files]
    const fileIndex = resources.findIndex(f => {
      return f.id === file.id
    })

    resources[fileIndex].name = newValue
    resources[fileIndex].path = '/' + newPath + newValue

    state.files = resources
  },
  DRAG_OVER(state, value) {
    state.dropzone = value
  },
  CURRENT_FILE_OUTGOING_SHARES_SET(state, shares) {
    state.currentFileOutgoingShares = shares
  },
  CURRENT_FILE_OUTGOING_SHARES_ADD(state, share) {
    state.currentFileOutgoingShares.push(share)
  },
  CURRENT_FILE_OUTGOING_SHARES_REMOVE(state, share) {
    state.currentFileOutgoingShares = state.currentFileOutgoingShares.filter(s => share.id !== s.id)
  },
  CURRENT_FILE_OUTGOING_SHARES_UPDATE(state, share) {
    const fileIndex = state.currentFileOutgoingShares.findIndex(s => {
      return s.id === share.id
    })
    if (fileIndex >= 0) {
      Vue.set(state.currentFileOutgoingShares, fileIndex, share)
    } else {
      // share was not present in the list while updating, add it instead
      state.currentFileOutgoingShares.push(share)
    }
  },
  CURRENT_FILE_OUTGOING_SHARES_ERROR(state, error) {
    state.currentFileOutgoingShares = []
    state.currentFileOutgoingSharesError = error
  },
  CURRENT_FILE_OUTGOING_SHARES_LOADING(state, loading) {
    state.currentFileOutgoingSharesLoading = loading
  },
  INCOMING_SHARES_LOAD(state, shares) {
    state.incomingShares = shares
  },
  INCOMING_SHARES_ERROR(state, error) {
    state.incomingShares = []
    state.incomingSharesError = error
  },
  INCOMING_SHARES_LOADING(state, loading) {
    state.incomingSharesLoading = loading
  },
  SHARESTREE_PRUNE_OUTSIDE_PATH(state, pathToKeep) {
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
      state.sharesTree = pickBy(state.sharesTree, (shares, path) => {
        return pathToKeep.startsWith(path + '/')
      })
    } else {
      state.sharesTree = {}
    }
  },
  SHARESTREE_ADD(state, sharesTree) {
    Object.assign(state.sharesTree, sharesTree)
  },
  SHARESTREE_ERROR(state, error) {
    state.sharesTreeError = error
  },
  SHARESTREE_LOADING(state, loading) {
    state.sharesTreeLoading = loading
  },
  UPDATE_FOLDER_LOADING(state, value) {
    state.loadingFolder = value
  },
  SET_PUBLIC_LINK_PASSWORD(state, password) {
    // cache into state for reactivity
    state.publicLinkPassword = password
    if (password) {
      sessionStorage.setItem('publicLinkInfo', btoa(password))
    } else {
      sessionStorage.removeItem('publicLinkInfo')
    }
  },

  ADD_ACTION_TO_PROGRESS(state, item) {
    state.actionsInProgress.push(item)
  },

  REMOVE_ACTION_FROM_PROGRESS(state, item) {
    const itemIndex = state.actionsInProgress.findIndex(i => {
      return i === item
    })

    state.actionsInProgress.splice(itemIndex, 1)
  },

  CLEAR_CURRENT_FILES_LIST(state) {
    state.currentFolder = null
    state.selected = []
    // release blob urls
    state.files.forEach(item => {
      if (item.previewUrl && item.previewUrl.startsWith('blob:')) {
        window.URL.revokeObjectURL(item.previewUrl)
      }
    })
    state.files = []
  },

  SET_VERSIONS(state, versions) {
    state.versions = versions
  },

  SET_APP_SIDEBAR_ACTIVE_PANEL(state, accordion) {
    state.appSidebarActivePanel = accordion
  },

  TRIGGER_PUBLIC_LINK_EDIT(state, link) {
    // Adjust link for the edit
    link = {
      id: link.id,
      name: link.name,
      permissions: parseInt(link.permissions, 10),
      hasPassword: link.password,
      expireDate:
        link.expiration !== null
          ? DateTime.fromHTTP(link.expiration)
              .endOf('day')
              .toISO()
          : null
    }

    state.publicLinkInEdit = link
  },

  TRIGGER_PUBLIC_LINK_CREATE(state, { name, expireDate }) {
    state.publicLinkInEdit = {
      id: null,
      name,
      permissions: 1,
      hasPassword: false,
      expireDate
    }
  },

  LOAD_INDICATORS(state) {
    for (const resource of state.files) {
      const indicators = getIndicators(resource, state.sharesTree)

      if (!indicators && !resource.indicators.length) {
        continue
      }

      this.commit('Files/UPDATE_RESOURCE_FIELD', {
        id: resource.id,
        field: 'indicators',
        value: indicators
      })
    }
  },

  SELECT_RESOURCES(state, resources) {
    state.selected = resources
  },

  /**
   * Inserts or updates the given resource, depending on whether or not the resource is already loaded.
   * Updating the resource always takes precedence, so that we don't duplicate resources in the store
   * accidentally.
   *
   * @param state Current state of this store module
   * @param resource A new or updated resource
   */
  UPSERT_RESOURCE(state, resource) {
    $_upsertResource(state, resource, true)
  },

  /**
   * Updates the given resource in the store. If the resource doesn't exist in the store, the update
   * will be ignored. If you also want to allow inserts, use UPSERT_RESOURCE instead.
   *
   * @param state Current state of this store module
   * @param resource An updated resource
   */
  UPDATE_RESOURCE(state, resource) {
    $_upsertResource(state, resource, false)
  },

  /**
   * Updates a single resource field. If the resource with given id doesn't exist nothing will happen.
   *
   * @param state Current state of this store module
   * @param params.id Id of the resource to be updated
   * @param params.field the resource field that the value should be applied to
   * @param params.value the value that will be attached to the key
   */
  UPDATE_RESOURCE_FIELD(state, params) {
    const fileSource = state.filesSearched || state.files
    const index = fileSource.findIndex(r => r.id === params.id)
    if (index < 0) {
      return
    }

    const resource = fileSource[index]
    const isReactive = has(resource, params.field)
    const newResource = set(resource, params.field, params.value)

    if (isReactive) {
      return
    }

    Vue.set(fileSource, index, newResource)
  },

  UPDATE_CURRENT_PAGE(state, page) {
    state.currentPage = parseInt(page)
  },

  SET_HIDDEN_FILES_VISIBILITY(state, value) {
    state.areHiddenFilesShown = value

    window.localStorage.setItem('oc_hiddenFilesShown', value)
  },

  SET_FILES_PAGE_LIMIT(state, limit) {
    state.filesPageLimit = limit

    window.localStorage.setItem('oc_filesPageLimit', limit)
  }
}

// eslint-disable-next-line camelcase
function $_upsertResource(state, resource, allowInsert) {
  const files = [...state.files]
  const index = files.findIndex(r => r.id === resource.id)
  const found = index > -1

  state.filesSearched = null

  if (!found && !allowInsert) {
    return
  }

  if (found) {
    files.splice(index, 1, resource)
  } else {
    files.push(resource)
  }
  state.files = files
}
