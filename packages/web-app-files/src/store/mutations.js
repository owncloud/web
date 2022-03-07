import Vue from 'vue'
import pickBy from 'lodash-es/pickBy'
import { DateTime } from 'luxon'
import { set, has } from 'lodash-es'
import { getIndicators } from '../helpers/statusIndicators'
import { renameResource } from '../helpers/resources'
import { ShareTypes } from '../helpers/share'

export default {
  UPDATE_FILE_PROGRESS(state, file) {
    const inProgress = [...state.inProgress]

    const fileIndex = inProgress.findIndex((f) => {
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
    const fileIndex = inProgress.findIndex((f) => {
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
  CLEAR_FILES(state) {
    state.files = []
  },
  LOAD_FILES_SEARCHED(state, files) {
    state.filesSearched = files
  },
  REMOVE_FILE_FROM_SEARCHED(state, file) {
    if (!state.filesSearched) {
      return
    }

    state.filesSearched = state.filesSearched.filter((i) => file.id !== i.id)
  },
  CLEAR_FILES_SEARCHED(state) {
    state.filesSearched = null
  },
  SET_FILE_SELECTION(state, files) {
    state.selectedIds = files.map((f) => f.id)
  },
  ADD_FILE_SELECTION(state, file) {
    const selected = [...state.selectedIds]
    const fileIndex = selected.findIndex((id) => {
      return id === file.id
    })
    if (fileIndex === -1) {
      selected.push(file.id)
      state.selectedIds = selected
    }
  },
  REMOVE_FILE_SELECTION(state, file) {
    const selected = [...state.selectedIds]
    if (selected.length > 1) {
      state.selectedIds = selected.filter((id) => file.id !== id)
      return
    }
    state.selectedIds = []
  },
  RESET_SELECTION(state) {
    state.selectedIds = []
  },
  REMOVE_FILE(state, removedFile) {
    state.files = [...state.files].filter((file) => file.id !== removedFile.id)
  },
  RENAME_FILE(state, { file, newValue, newPath }) {
    const resources = [...state.files]
    const fileIndex = resources.findIndex((f) => {
      return f.id === file.id
    })

    renameResource(resources[fileIndex], newValue, newPath)

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
    if (share.shareType === ShareTypes.space.value) {
      state.currentFileOutgoingShares = state.currentFileOutgoingShares.filter(
        (s) => share.id === s.id && share.collaborator.name !== s.collaborator.name
      )
      return
    }
    state.currentFileOutgoingShares = state.currentFileOutgoingShares.filter(
      (s) => share.id !== s.id
    )
  },
  CURRENT_FILE_OUTGOING_SHARES_UPDATE(state, share) {
    let fileIndex
    if (share.shareType === ShareTypes.space.value) {
      fileIndex = state.currentFileOutgoingShares.findIndex((s) => {
        return share.id === s.id && share.collaborator.name === s.collaborator.name
      })
    } else {
      fileIndex = state.currentFileOutgoingShares.findIndex((s) => {
        return s.id === share.id
      })
    }

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
    state.sharesTree = Object.assign({}, state.sharesTree, sharesTree)
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
      const encodedPassword = Buffer.from(password).toString('base64')
      sessionStorage.setItem('publicLinkInfo', encodedPassword)
    } else {
      sessionStorage.removeItem('publicLinkInfo')
    }
  },

  ADD_ACTION_TO_PROGRESS(state, item) {
    state.actionsInProgress.push(item)
  },

  REMOVE_ACTION_FROM_PROGRESS(state, item) {
    const itemIndex = state.actionsInProgress.findIndex((i) => {
      return i === item
    })

    state.actionsInProgress.splice(itemIndex, 1)
  },

  CLEAR_CURRENT_FILES_LIST(state) {
    state.currentFolder = null
    state.selectedIds = []
    // release blob urls
    state.files.forEach((item) => {
      if (item.previewUrl && item.previewUrl.startsWith('blob:')) {
        window.URL.revokeObjectURL(item.previewUrl)
      }
    })
    state.files = []
  },

  SET_VERSIONS(state, versions) {
    state.versions = versions
  },

  TRIGGER_PUBLIC_LINK_EDIT(state, link) {
    // Adjust link for the edit
    link = {
      id: link.id,
      name: link.name,
      permissions: parseInt(link.permissions, 10),
      hasPassword: link.password,
      expireDate:
        link.expiration !== null ? DateTime.fromISO(link.expiration).endOf('day').toISO() : null
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
    let fileSource = state.filesSearched || state.files
    let index = fileSource.findIndex((r) => r.id === params.id)
    if (index < 0) {
      if (state.currentFolder?.id === params.id) {
        fileSource = [state.currentFolder]
        index = 0
      } else {
        return
      }
    }

    const resource = fileSource[index]
    const isReactive = has(resource, params.field)
    const newResource = set(resource, params.field, params.value)

    if (isReactive) {
      return
    }

    Vue.set(fileSource, index, newResource)
  },

  SET_HIDDEN_FILES_VISIBILITY(state, value) {
    state.areHiddenFilesShown = value

    window.localStorage.setItem('oc_hiddenFilesShown', value)
  }
}

// eslint-disable-next-line camelcase
function $_upsertResource(state, resource, allowInsert) {
  const files = [...state.files]
  const index = files.findIndex((r) => r.id === resource.id)
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
