import PQueue from 'p-queue'
import { dirname } from 'path'
import { DavProperties } from 'web-pkg/src/constants'

import { getParentPaths } from '../helpers/path'
import { buildResource, buildShare, buildCollaboratorShare } from '../helpers/resources'
import { $gettext, $gettextInterpolate } from '../gettext'
import { move, copy } from '../helpers/resource'
import { loadPreview } from 'web-pkg/src/helpers/preview'
import { avatarUrl } from '../helpers/user'
import { has } from 'lodash-es'
import { ShareTypes } from 'web-client/src/helpers/share'
import get from 'lodash-es/get'
import { ClipboardActions } from '../helpers/clipboardActions'
import { thumbnailService } from '../services'

const allowSharePermissions = (getters) => {
  return get(getters, `capabilities.files_sharing.resharing`, true)
}

export default {
  loadFiles(context, { currentFolder, files }) {
    if (currentFolder) {
      currentFolder = buildResource(currentFolder)
    }
    files = files.map(buildResource)
    context.commit('LOAD_FILES', { currentFolder, files })
  },
  toggleFileSelection(context, file) {
    if (context.state.selectedIds.includes(file.id)) {
      context.commit('REMOVE_FILE_SELECTION', file)
    } else {
      context.commit('ADD_FILE_SELECTION', file)
    }
  },
  copySelectedFiles(context) {
    context.commit('CLIPBOARD_SELECTED')
    context.commit('SET_CLIPBOARD_ACTION', ClipboardActions.Copy)
    context.dispatch(
      'showMessage',
      {
        title: $gettext('Copied to clipboard!'),
        status: 'success'
      },
      { root: true }
    )
  },
  cutSelectedFiles(context) {
    context.commit('CLIPBOARD_SELECTED')
    context.commit('SET_CLIPBOARD_ACTION', ClipboardActions.Cut)
    context.dispatch(
      'showMessage',
      {
        title: $gettext('Cut to clipboard!'),
        status: 'success'
      },
      { root: true }
    )
  },
  clearClipboardFiles(context) {
    context.commit('CLEAR_CLIPBOARD')
  },
  async pasteSelectedFiles(
    context,
    {
      client,
      createModal,
      hideModal,
      showMessage,
      $gettext,
      $gettextInterpolate,
      $ngettext,
      isPublicLinkContext,
      publicLinkPassword,
      upsertResource
    }
  ) {
    let movedResources = []
    if (context.state.clipboardAction === ClipboardActions.Cut) {
      movedResources = await move(
        context.state.clipboardResources,
        context.state.currentFolder,
        client,
        createModal,
        hideModal,
        showMessage,
        $gettext,
        $gettextInterpolate,
        $ngettext,
        isPublicLinkContext,
        publicLinkPassword
      )
    }
    if (context.state.clipboardAction === ClipboardActions.Copy) {
      movedResources = await copy(
        context.state.clipboardResources,
        context.state.currentFolder,
        client,
        createModal,
        hideModal,
        showMessage,
        $gettext,
        $gettextInterpolate,
        $ngettext,
        isPublicLinkContext,
        publicLinkPassword
      )
    }
    context.commit('CLEAR_CLIPBOARD')
    const loadMovedResource = async (resource) => {
      let loadedResource
      if (isPublicLinkContext) {
        loadedResource = await client.publicFiles.getFileInfo(
          resource.webDavPath,
          publicLinkPassword,
          DavProperties.PublicLink
        )
      } else {
        loadedResource = await client.files.fileInfo(resource.webDavPath, DavProperties.Default)
      }
      upsertResource(buildResource(loadedResource))
    }
    const loadingResources = []
    for (const resource of movedResources) {
      loadingResources.push(loadMovedResource(resource))
    }
    await Promise.all(loadingResources)
  },
  resetFileSelection(context) {
    context.commit('RESET_SELECTION')
  },
  markFavorite(context, payload) {
    const file = payload.file
    const client = payload.client
    const newValue = !file.starred

    return client.files
      .favorite(file.webDavPath, newValue)
      .then(() => {
        context.commit('UPDATE_RESOURCE_FIELD', {
          id: file.id,
          field: 'starred',
          value: newValue
        })
      })
      .catch((error) => {
        throw new Error(error)
      })
  },
  deleteFiles(context, { files, client, isPublicLinkContext, firstRun = true }) {
    const promises = []
    const removedFiles = []
    for (const file of files) {
      let p = null
      if (isPublicLinkContext) {
        p = client.publicFiles.delete(
          file.path,
          null,
          context.rootGetters['runtime/auth/publicLinkPassword']
        )
      } else {
        p = client.files.delete(file.webDavPath)
      }
      const promise = p
        .then(() => {
          removedFiles.push(file)
        })
        .catch((error) => {
          let translated = $gettext('Failed to delete "%{file}"')
          if (error.statusCode === 423) {
            if (firstRun) {
              return context.dispatch('deleteFiles', {
                files: [file],
                client,
                isPublicLinkContext,
                firstRun: false
              })
            }

            translated = $gettext('Failed to delete "%{file}" - the file is locked')
          }
          const title = $gettextInterpolate(translated, { file: file.name }, true)
          context.dispatch(
            'showMessage',
            {
              title: title,
              status: 'danger'
            },
            { root: true }
          )
        })
      promises.push(promise)
    }
    return Promise.all(promises).then(() => {
      context.dispatch('sidebar/close')
      context.commit('REMOVE_FILES', removedFiles)
      context.commit('REMOVE_FILES_FROM_SEARCHED', removedFiles)
      context.commit('RESET_SELECTION')
    })
  },
  async clearTrashBin(context) {
    await context.dispatch('sidebar/close')
    context.commit('CLEAR_FILES')
    context.commit('RESET_SELECTION')
    context.commit('CLEAR_FILES_SEARCHED')
  },
  async removeFilesFromTrashbin(context, files) {
    await context.dispatch('sidebar/close')
    context.commit('REMOVE_FILES', files)
    context.commit('REMOVE_FILES_FROM_SEARCHED', files)
    context.commit('RESET_SELECTION')
  },
  renameFile(context, { file, newValue, client, isPublicLinkContext, isSameResource }) {
    if (file !== undefined && newValue !== undefined && newValue !== file.name) {
      const newPath = file.webDavPath.slice(1, file.webDavPath.lastIndexOf('/') + 1)
      if (isPublicLinkContext) {
        return client.publicFiles
          .move(
            file.webDavPath,
            newPath + newValue,
            context.rootGetters['runtime/auth/publicLinkPassword']
          )
          .then(() => {
            if (!isSameResource) {
              context.commit('RENAME_FILE', { file, newValue, newPath })
            }
          })
      }
      return client.files.move(file.webDavPath, newPath + newValue).then(() => {
        if (!isSameResource) {
          context.commit('RENAME_FILE', { file, newValue, newPath })
        }
      })
    }
  },
  updateCurrentFileShareTypes({ state, getters, commit }) {
    const highlighted = getters.highlightedFile
    if (!highlighted) {
      return
    }
    commit('UPDATE_RESOURCE_FIELD', {
      id: highlighted.id,
      field: 'shareTypes',
      value: computeShareTypes(state.currentFileOutgoingShares)
    })
  },
  async changeShare(
    { commit, dispatch, getters, rootGetters },
    { client, share, permissions, expirationDate, role }
  ) {
    if (!permissions && !role) {
      throw new Error('Nothing changed')
    }

    try {
      const updatedShare = await client.shares.updateShare(share.id, {
        role: role.name,
        permissions,
        expireDate: expirationDate
      })

      commit(
        'CURRENT_FILE_OUTGOING_SHARES_UPSERT',
        buildCollaboratorShare(
          updatedShare.shareInfo,
          getters.highlightedFile,
          allowSharePermissions(rootGetters)
        )
      )
    } catch (error) {
      dispatch(
        'showMessage',
        { title: $gettext('Error while editing the share.'), status: 'danger' },
        { root: true }
      )
    }
  },
  addShare(
    context,
    { client, path, shareWith, shareType, permissions, role, expirationDate, storageId }
  ) {
    if (shareType === ShareTypes.group.value) {
      return client.shares
        .shareFileWithGroup(path, shareWith, {
          permissions,
          role: role.name,
          expirationDate,
          spaceRef: storageId
        })
        .then((share) => {
          context.commit(
            'CURRENT_FILE_OUTGOING_SHARES_UPSERT',
            buildCollaboratorShare(
              share.shareInfo,
              context.getters.highlightedFile,
              allowSharePermissions(context.rootGetters)
            )
          )
          context.dispatch('updateCurrentFileShareTypes')
          context.dispatch('loadIndicators', { client, currentFolder: path })
          return share
        })
        .catch((e) => {
          context.dispatch(
            'showMessage',
            {
              title: $gettext('Error while sharing.'),
              desc: e,
              status: 'danger'
            },
            { root: true }
          )
        })
    }

    const remoteShare = shareType === ShareTypes.remote.value
    return client.shares
      .shareFileWithUser(path, shareWith, {
        remoteUser: remoteShare,
        permissions,
        role: role.name,
        expirationDate,
        spaceRef: storageId
      })
      .then((share) => {
        context.commit(
          'CURRENT_FILE_OUTGOING_SHARES_UPSERT',
          buildCollaboratorShare(
            share.shareInfo,
            context.getters.highlightedFile,
            allowSharePermissions(context.rootGetters)
          )
        )
        context.dispatch('updateCurrentFileShareTypes')
        context.dispatch('loadIndicators', { client, currentFolder: path, storageId })
        return share
      })
      .catch((e) => {
        context.dispatch(
          'showMessage',
          {
            title: $gettext('Error while sharing.'),
            desc: e,
            status: 'danger'
          },
          { root: true }
        )
      })
  },
  deleteShare(context, { client, share, path, storageId }) {
    return client.shares.deleteShare(share.id, {} as any).then(() => {
      context.commit('CURRENT_FILE_OUTGOING_SHARES_REMOVE', share)
      context.dispatch('updateCurrentFileShareTypes')
      context.dispatch('loadIndicators', { client, currentFolder: path, storageId })
    })
  },
  /**
   * Prune all branches of the shares tree that are
   * unrelated to the given path
   */
  pruneSharesTreeOutsidePath(context, path) {
    context.commit('SHARESTREE_PRUNE_OUTSIDE_PATH', path)
  },
  /**
   * Load shares for each parent of the given path.
   * This will add new entries into the shares tree and will
   * not remove unrelated existing ones.
   */
  loadSharesTree(context, { client, path, storageId, includeRoot = false, useCached = true }) {
    context.commit('SHARESTREE_ERROR', null)
    // prune shares tree cache for all unrelated paths, keeping only
    // existing relevant parent entries
    context.dispatch('pruneSharesTreeOutsidePath', path)
    context.commit('INCOMING_SHARES_LOAD', [])
    context.commit('CURRENT_FILE_OUTGOING_SHARES_SET', [])
    context.commit('SHARESTREE_LOADING', true)

    const parentPaths = path === '/' && includeRoot ? ['/'] : getParentPaths(path, true)
    const sharesTree = {}
    const outgoingShares = []
    const incomingShares = []

    const shareQueriesQueue = new PQueue({ concurrency: 2 })
    const shareQueriesPromises = []
    const { highlightedFile } = context.getters

    const getShares = (subPath, indirect, options, outgoing) => {
      const buildMethod = outgoing ? buildShare : buildCollaboratorShare
      const resource = indirect || !highlightedFile ? { type: 'folder' } : highlightedFile
      const arr = outgoing ? outgoingShares : incomingShares
      const permissions = allowSharePermissions(context.rootGetters)
      if (!sharesTree[subPath]) {
        sharesTree[subPath] = []
      }
      return client.shares
        .getShares(subPath, options)
        .then((data) => {
          data.forEach((element) => {
            const share = {
              ...buildMethod(element.shareInfo, resource, permissions),
              outgoing,
              indirect
            }
            sharesTree[subPath].push(share)
            if (!indirect) {
              arr.push(share)
            }
          })
        })
        .catch((error) => {
          console.error('SHARESTREE_ERROR', error)
          context.commit('SHARESTREE_ERROR', error.message)
        })
    }

    if (!path) {
      // space shares
      shareQueriesPromises.push(
        getShares(path, false, { reshares: true, spaceRef: storageId }, true)
      )
    }

    parentPaths.forEach((queryPath) => {
      const indirect = path !== queryPath
      // FIXME: We need the storageId of each parent resource here
      const spaceRef = indirect ? null : storageId
      // no need to fetch cached paths again, only adjust the "indirect" state
      if (context.getters.sharesTree[queryPath] && useCached) {
        sharesTree[queryPath] = context.getters.sharesTree[queryPath].map((s) => {
          if (!indirect) {
            const arr = s.outgoing ? outgoingShares : incomingShares
            arr.push({ ...s, indirect })
          }
          return { ...s, indirect }
        })
        return
      }

      // query the outgoing share information for each of the parent paths
      shareQueriesPromises.push(
        shareQueriesQueue.add(() =>
          getShares(queryPath, indirect, { reshares: true, spaceRef }, true)
        )
      )
      // query the incoming share information for each of the parent paths
      shareQueriesPromises.push(
        shareQueriesQueue.add(() =>
          getShares(queryPath, indirect, { shared_with_me: true, spaceRef }, false)
        )
      )
    })

    return Promise.all(shareQueriesPromises).then(() => {
      context.commit('SHARESTREE_ADD', sharesTree)
      context.commit('SHARESTREE_LOADING', false)
      context.commit('CURRENT_FILE_OUTGOING_SHARES_SET', outgoingShares)
      context.commit('INCOMING_SHARES_LOAD', incomingShares)
    })
  },
  async loadVersions(context, { client, fileId }) {
    let response
    try {
      response = await client.fileVersions.listVersions(fileId)
    } catch (e) {
      console.error(e)
      response = []
    }
    context.commit('SET_VERSIONS', response)
  },

  addLink(context, { path, client, params, storageId }) {
    return new Promise((resolve, reject) => {
      client.shares
        .shareFileWithLink(path, { ...params, spaceRef: storageId })
        .then((data) => {
          const link = buildShare(data.shareInfo, null, allowSharePermissions(context.rootGetters))
          context.commit('CURRENT_FILE_OUTGOING_SHARES_UPSERT', link)
          context.dispatch('updateCurrentFileShareTypes')
          context.dispatch('loadIndicators', { client, currentFolder: path, storageId })
          resolve(link)
        })
        .catch((e) => {
          reject(e)
        })
    })
  },
  updateLink(context, { id, client, params }) {
    return new Promise((resolve, reject) => {
      client.shares
        .updateShare(id, params)
        .then((data) => {
          const link = buildShare(data.shareInfo, null, allowSharePermissions(context.rootGetters))
          context.commit('CURRENT_FILE_OUTGOING_SHARES_UPSERT', link)
          resolve(link)
        })
        .catch((e) => {
          reject(e)
        })
    })
  },
  removeLink(context, { share, client, path, storageId }) {
    client.shares.deleteShare(share.id).then(() => {
      context.commit('CURRENT_FILE_OUTGOING_SHARES_REMOVE', share)
      context.dispatch('updateCurrentFileShareTypes')
      context.dispatch('loadIndicators', { client, currentFolder: path, storageId })
    })
  },

  pushResourcesToDeleteList({ commit }, resources) {
    commit('PUSH_RESOURCES_TO_DELETE_LIST', resources)
  },

  async loadIndicators({ dispatch, commit }, { client, currentFolder, storageId }) {
    // kind of bruteforce for now: remove the shares for the current folder and children, reload shares tree for the current folder.
    // TODO: when we refactor the shares tree we want to modify shares tree nodes incrementally during adding and removing shares, not loading everything new from the backend.
    commit('SHARESTREE_PRUNE_OUTSIDE_PATH', dirname(currentFolder))
    await dispatch('loadSharesTree', { client, path: currentFolder, storageId })
    commit('LOAD_INDICATORS', currentFolder)
  },

  loadAvatars({ commit, rootGetters }, { resource }) {
    if (!rootGetters.capabilities.files_sharing.user.profile_picture) {
      return
    }

    ;['sharedWith', 'owner'].forEach((k) => {
      ;(resource[k] || []).forEach((obj, i) => {
        if (!has(obj, 'avatar')) {
          return
        }
        avatarUrl(
          {
            clientService: this.$clientService,
            username: obj.username,
            server: rootGetters.configuration.server,
            token: rootGetters['runtime/auth/accessToken']
          },
          true
        ).then((url) =>
          commit('UPDATE_RESOURCE_FIELD', {
            id: resource.id,
            field: `${k}.[${i}].avatar`,
            value: url
          })
        )
      })
    })
  },

  async loadPreview({ commit, rootGetters }, { resource, isPublic, dimensions, type }) {
    if (!thumbnailService.available || !thumbnailService.isMimetypeSupported(resource.mimeType)) {
      return
    }

    const preview = await loadPreview(
      {
        resource,
        isPublic,
        dimensions,
        server: rootGetters.configuration.server,
        userId: rootGetters.user.id,
        token: rootGetters['runtime/auth/accessToken']
      },
      true
    )

    if (preview) {
      commit('UPDATE_RESOURCE_FIELD', { id: resource.id, field: type, value: preview })
    }
  }
}

/**
 * @param {Array.<Object>} shares array of shares
 * @return {Array.<Integer>} array of share types
 */
function computeShareTypes(shares) {
  const shareTypes = new Set()
  shares.forEach((share) => {
    shareTypes.add(share.shareType)
  })
  return Array.from(shareTypes)
}
