import PQueue from 'p-queue'

import { getParentPaths } from '../helpers/path'
import { dirname } from 'path'
import {
  buildResource,
  buildShare,
  buildCollaboratorShare,
  buildSpaceShare
} from '../helpers/resources'
import { $gettext, $gettextInterpolate } from '../gettext'
import { loadPreview } from '../helpers/resource'
import { avatarUrl } from '../helpers/user'
import { has } from 'lodash-es'
import { ShareTypes, SpacePeopleShareRoles } from '../helpers/share'

export default {
  updateFileProgress({ commit }, progress) {
    commit('UPDATE_FILE_PROGRESS', progress)
  },
  addFileToProgress({ commit }, file) {
    commit('ADD_FILE_TO_PROGRESS', file)
  },

  removeFileFromProgress({ commit }, file) {
    commit('REMOVE_FILE_FROM_PROGRESS', file)
  },

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
  deleteFiles(context, { files, client, publicPage, firstRun = true }) {
    const promises = []
    for (const file of files) {
      let p = null
      if (publicPage) {
        p = client.publicFiles.delete(file.path, null, context.getters.publicLinkPassword)
      } else {
        p = client.files.delete(file.webDavPath)
      }
      const promise = p
        .then(() => {
          context.dispatch('sidebar/close')
          context.commit('REMOVE_FILE', file)
          context.commit('REMOVE_FILE_SELECTION', file)
          context.commit('REMOVE_FILE_FROM_SEARCHED', file)
        })
        .catch((error) => {
          let translated = $gettext('Failed to delete "%{file}"')
          if (error.statusCode === 423) {
            if (firstRun) {
              return context.dispatch('deleteFiles', {
                files: [file],
                client,
                publicPage,
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
    return Promise.all(promises)
  },
  async clearTrashBin(context) {
    await context.dispatch('sidebar/close')
    context.commit('CLEAR_FILES')
    context.commit('RESET_SELECTION')
    context.commit('CLEAR_FILES_SEARCHED')
  },
  async removeFilesFromTrashbin(context, files) {
    await context.dispatch('sidebar/close')
    for (const file of files) {
      context.commit('REMOVE_FILE', file)
      context.commit('REMOVE_FILE_SELECTION', file)
      context.commit('REMOVE_FILE_FROM_SEARCHED', file)
    }
  },
  renameFile(context, { file, newValue, client, publicPage, isSameResource }) {
    if (file !== undefined && newValue !== undefined && newValue !== file.name) {
      const newPath = file.webDavPath.substr(1, file.webDavPath.lastIndexOf('/'))
      if (publicPage) {
        return client.publicFiles
          .move(file.webDavPath, newPath + newValue, context.getters.publicLinkPassword)
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
  loadCurrentFileOutgoingShares(context, { client, path, space }) {
    context.commit('CURRENT_FILE_OUTGOING_SHARES_SET', [])
    context.commit('CURRENT_FILE_OUTGOING_SHARES_ERROR', null)
    context.commit('CURRENT_FILE_OUTGOING_SHARES_LOADING', true)

    if (space) {
      const promises = []
      const spaceShares = []

      for (const permission of space.spacePermissions) {
        for (const {
          user: { id }
        } of permission.grantedTo) {
          promises.push(
            client.users.getUser(id).then((resolved) => {
              spaceShares.push(
                buildSpaceShare(
                  {
                    ...resolved.data,
                    role: permission.roles[0]
                  },
                  space.id
                )
              )
            })
          )
        }
      }

      return Promise.all(promises)
        .then(() => {
          context.commit('CURRENT_FILE_OUTGOING_SHARES_SET', spaceShares)
          context.dispatch('updateCurrentFileShareTypes')
          context.commit('CURRENT_FILE_OUTGOING_SHARES_LOADING', false)
        })
        .catch((error) => {
          context.commit('CURRENT_FILE_OUTGOING_SHARES_ERROR', error.message)
          context.commit('CURRENT_FILE_OUTGOING_SHARES_LOADING', false)
        })
    }

    // see https://owncloud.dev/owncloud-sdk/Shares.html
    client.shares
      .getShares(path, { reshares: true })
      .then((data) => {
        context.commit(
          'CURRENT_FILE_OUTGOING_SHARES_SET',
          data.map((element) => {
            return buildShare(
              element.shareInfo,
              context.getters.highlightedFile,
              !context.rootGetters.isOcis
            )
          })
        )
        context.dispatch('updateCurrentFileShareTypes')
        context.commit('CURRENT_FILE_OUTGOING_SHARES_LOADING', false)
      })
      .catch((error) => {
        context.commit('CURRENT_FILE_OUTGOING_SHARES_ERROR', error.message)
        context.commit('CURRENT_FILE_OUTGOING_SHARES_LOADING', false)
      })
  },
  loadIncomingShares(context, payload) {
    context.commit('INCOMING_SHARES_LOAD', [])
    context.commit('INCOMING_SHARES_ERROR', null)
    context.commit('INCOMING_SHARES_LOADING', true)

    // see https://owncloud.dev/owncloud-sdk/Shares.html
    const client = payload.client
    const path = payload.path
    client.shares
      .getShares(path, { shared_with_me: true })
      .then((data) => {
        context.commit(
          'INCOMING_SHARES_LOAD',
          data.map((element) => {
            return buildCollaboratorShare(
              element.shareInfo,
              context.getters.highlightedFile,
              !context.rootGetters.isOcis
            )
          })
        )
        context.commit('INCOMING_SHARES_LOADING', false)
      })
      .catch((error) => {
        context.commit('INCOMING_SHARES_ERROR', error.message)
        context.commit('INCOMING_SHARES_LOADING', false)
      })
  },
  changeShare({ commit, getters, rootGetters }, { client, share, permissions, expirationDate }) {
    const params = {
      permissions: permissions,
      expireDate: expirationDate
    }

    if (!params.permissions) {
      return new Promise((resolve, reject) => {
        reject(new Error('Nothing changed'))
      })
    }

    if (share.shareType === ShareTypes.space.value) {
      return new Promise((resolve, reject) => {
        client.shares
          .shareSpaceWithUser('', share.collaborator.name, share.id, {
            permissions
          })
          .then(() => {
            const role = SpacePeopleShareRoles.getByBitmask(permissions)
            const shareObj = {
              role: role.inlineLabel,
              onPremisesSamAccountName: share.collaborator.name,
              displayName: share.collaborator.displayName
            }
            const updatedShare = buildSpaceShare(shareObj, share.id)
            commit('CURRENT_FILE_OUTGOING_SHARES_UPDATE', updatedShare)
            resolve(updatedShare)
          })
          .catch((e) => {
            reject(e)
          })
      })
    }

    return new Promise((resolve, reject) => {
      client.shares
        .updateShare(share.id, params)
        .then((updatedShare) => {
          const share = buildCollaboratorShare(
            updatedShare.shareInfo,
            getters.highlightedFile,
            !rootGetters.isOcis
          )
          commit('CURRENT_FILE_OUTGOING_SHARES_UPDATE', share)
          resolve(share)
        })
        .catch((e) => {
          reject(e)
        })
    })
  },
  addShare(
    context,
    { client, path, shareWith, shareType, permissions, expirationDate, spaceId, displayName }
  ) {
    if (shareType === ShareTypes.group.value) {
      client.shares
        .shareFileWithGroup(path, shareWith, {
          permissions: permissions,
          expirationDate: expirationDate
        })
        .then((share) => {
          context.commit(
            'CURRENT_FILE_OUTGOING_SHARES_ADD',
            buildCollaboratorShare(
              share.shareInfo,
              context.getters.highlightedFile,
              !context.rootGetters.isOcis
            )
          )
          context.dispatch('updateCurrentFileShareTypes')
          context.dispatch('loadIndicators', { client, currentFolder: path })
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
      return
    }

    if (shareType === ShareTypes.space.value) {
      client.shares
        .shareSpaceWithUser(path, shareWith, spaceId, {
          permissions
        })
        .then(() => {
          const role = SpacePeopleShareRoles.getByBitmask(permissions)
          const shareObj = {
            role: role.inlineLabel,
            onPremisesSamAccountName: shareWith,
            displayName
          }

          context.commit('CURRENT_FILE_OUTGOING_SHARES_ADD', buildSpaceShare(shareObj, spaceId))
          context.commit('CURRENT_FILE_OUTGOING_SHARES_LOADING', true)

          // FIXME
          return Promise.all([]).then(() => {
            context.commit('CURRENT_FILE_OUTGOING_SHARES_LOADING', false)
          })
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
      return
    }

    const remoteShare = shareType === ShareTypes.remote.value
    client.shares
      .shareFileWithUser(path, shareWith, {
        permissions: permissions,
        remoteUser: remoteShare,
        expirationDate: expirationDate
      })
      .then((share) => {
        context.commit(
          'CURRENT_FILE_OUTGOING_SHARES_ADD',
          buildCollaboratorShare(
            share.shareInfo,
            context.getters.highlightedFile,
            !context.rootGetters.isOcis
          )
        )
        context.dispatch('updateCurrentFileShareTypes')
        context.dispatch('loadIndicators', { client, currentFolder: path })
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
  deleteShare(context, { client, share, resource }) {
    const additionalParams = {}
    if (share.shareType === ShareTypes.space.value) {
      additionalParams.shareWith = share.collaborator.name
    }

    client.shares
      .deleteShare(share.id, additionalParams)
      .then(() => {
        context.commit('CURRENT_FILE_OUTGOING_SHARES_REMOVE', share)

        if (share.shareType !== ShareTypes.space.value) {
          context.dispatch('updateCurrentFileShareTypes')
          context.dispatch('loadIndicators', { client, currentFolder: resource.path })
        } else {
          context.commit('CURRENT_FILE_OUTGOING_SHARES_LOADING', true)

          // FIXME
          return Promise.all([]).then(() => {
            context.commit('CURRENT_FILE_OUTGOING_SHARES_LOADING', false)
          })
        }
      })
      .catch((e) => {
        console.error(e)
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
  loadSharesTree(context, { client, path }) {
    context.commit('SHARESTREE_ERROR', null)
    // prune shares tree cache for all unrelated paths, keeping only
    // existing relevant parent entries
    context.dispatch('pruneSharesTreeOutsidePath', path)

    const parentPaths = getParentPaths(path, true)
    const sharesTree = {}

    if (!parentPaths.length) {
      return Promise.resolve()
    }

    // remove last entry which is the root folder
    parentPaths.pop()

    context.commit('SHARESTREE_LOADING', true)

    const shareQueriesQueue = new PQueue({ concurrency: 2 })
    const shareQueriesPromises = []
    parentPaths.forEach((queryPath) => {
      // skip already cached paths
      if (context.getters.sharesTree[queryPath]) {
        return Promise.resolve()
      }
      sharesTree[queryPath] = []
      // query the outgoing share information for each of the parent paths
      shareQueriesPromises.push(
        shareQueriesQueue.add(() =>
          client.shares
            .getShares(queryPath, { reshares: true })
            .then((data) => {
              data.forEach((element) => {
                sharesTree[queryPath].push({
                  ...buildShare(element.shareInfo, { type: 'folder' }, !context.rootGetters.isOcis),
                  outgoing: true,
                  indirect: true
                })
              })
            })
            .catch((error) => {
              console.error('SHARESTREE_ERROR', error)
              context.commit('SHARESTREE_ERROR', error.message)
              context.commit('SHARESTREE_LOADING', false)
            })
        )
      )
      // query the incoming share information for each of the parent paths
      shareQueriesPromises.push(
        shareQueriesQueue.add(() =>
          client.shares
            .getShares(queryPath, { shared_with_me: true })
            .then((data) => {
              data.forEach((element) => {
                sharesTree[queryPath].push({
                  ...buildCollaboratorShare(
                    element.shareInfo,
                    { type: 'folder' },
                    !context.rootGetters.isOcis
                  ),
                  incoming: true,
                  indirect: true
                })
              })
            })
            .catch((error) => {
              console.error('SHARESTREE_ERROR', error)
              context.commit('SHARESTREE_ERROR', error.message)
              context.commit('SHARESTREE_LOADING', false)
            })
        )
      )
    })

    return Promise.all(shareQueriesPromises).then(() => {
      context.commit('SHARESTREE_ADD', sharesTree)
      context.commit('SHARESTREE_LOADING', false)
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
  dragOver(context, value) {
    context.commit('DRAG_OVER', value)
  },
  setPublicLinkPassword(context, password) {
    context.commit('SET_PUBLIC_LINK_PASSWORD', password)
  },

  addLink(context, { path, client, params }) {
    return new Promise((resolve, reject) => {
      client.shares
        .shareFileWithLink(path, params)
        .then((data) => {
          const link = buildShare(data.shareInfo, null, !context.rootGetters.isOcis)
          context.commit('CURRENT_FILE_OUTGOING_SHARES_ADD', link)
          context.dispatch('updateCurrentFileShareTypes')
          context.dispatch('loadIndicators', { client, currentFolder: path })
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
          const link = buildShare(data.shareInfo, null, !context.rootGetters.isOcis)
          context.commit('CURRENT_FILE_OUTGOING_SHARES_UPDATE', link)
          resolve(link)
        })
        .catch((e) => {
          reject(e)
        })
    })
  },
  removeLink(context, { share, client, resource }) {
    client.shares
      .deleteShare(share.id)
      .then(() => {
        context.commit('CURRENT_FILE_OUTGOING_SHARES_REMOVE', share)
        context.dispatch('updateCurrentFileShareTypes')
        context.dispatch('loadIndicators', { client, currentFolder: resource.path })
      })
      .catch((e) => context.commit('CURRENT_FILE_OUTGOING_SHARES_ERROR', e.message))
  },

  addActionToProgress({ commit }, item) {
    commit('ADD_ACTION_TO_PROGRESS', item)
  },

  removeActionFromProgress({ commit }, item) {
    commit('REMOVE_ACTION_FROM_PROGRESS', item)
  },

  pushResourcesToDeleteList({ commit }, resources) {
    commit('PUSH_RESOURCES_TO_DELETE_LIST', resources)
  },

  clearResourcesToDeleteList({ commit }) {
    commit('CLEAR_RESOURCES_TO_DELETE_LIST')
  },

  async loadIndicators({ dispatch, commit }, { client, currentFolder }) {
    // kind of bruteforce for now: remove the shares for the current folder and children, reload shares tree for the current folder.
    // TODO: when we refactor the shares tree we want to modify shares tree nodes incrementally during adding and removing shares, not loading everything new from the backend.
    commit('SHARESTREE_PRUNE_OUTSIDE_PATH', dirname(currentFolder))
    await dispatch('loadSharesTree', { client, path: currentFolder })
    commit('LOAD_INDICATORS')
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
            username: obj.username,
            server: rootGetters.configuration.server,
            token: rootGetters.getToken
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
    if (
      rootGetters.previewFileExtensions.length &&
      !rootGetters.previewFileExtensions.includes(resource.extension.toLowerCase())
    ) {
      return
    }

    const preview = await loadPreview(
      {
        resource,
        isPublic,
        dimensions,
        server: rootGetters.configuration.server,
        userId: rootGetters.user.id,
        token: rootGetters.getToken
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
