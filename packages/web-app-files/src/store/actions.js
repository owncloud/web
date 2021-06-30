import PQueue from 'p-queue'

import { getParentPaths } from '../helpers/path'
import { shareTypes } from '../helpers/shareTypes'
import { buildResource, buildShare, buildCollaboratorShare } from '../helpers/resources'
import { $gettext, $gettextInterpolate } from '../gettext'
import { loadPreview } from '../helpers/resource'
import { avatarUrl } from '../helpers/user'
import { has } from 'lodash-es'

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
  setFilesSort(context, { field, directionIsDesc }) {
    context.commit('SET_FILES_SORT', { field, directionIsDesc })
  },
  addFileSelection(context, file) {
    context.commit('ADD_FILE_SELECTION', file)
  },
  removeFileSelection(context, file) {
    context.commit('REMOVE_FILE_SELECTION', file)
  },
  toggleFileSelection(context, file) {
    if (context.state.selected.includes(file)) {
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
    client.files
      .favorite(file.path, newValue)
      .then(() => {
        context.commit('FAVORITE_FILE', file)
      })
      .catch(error => {
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
        p = client.files.delete(file.path)
      }
      const promise = p
        .then(() => {
          context.commit('REMOVE_FILE', file)
          context.commit('REMOVE_FILE_SELECTION', file)
          context.commit('REMOVE_FILE_FROM_SEARCHED', file)
        })
        .catch(error => {
          let translated = $gettext('Error while deleting "%{file}"')
          if (error.statusCode === 423) {
            if (firstRun) {
              return context.dispatch('deleteFiles', {
                files: [file],
                client,
                publicPage,
                firstRun: false
              })
            }

            translated = $gettext('Error while deleting "%{file}" - the file is locked')
          }
          const title = $gettextInterpolate(translated, { file: file.name }, true)
          context.dispatch(
            'showMessage',
            {
              title: title,
              status: 'danger',
              autoClose: {
                enabled: true
              }
            },
            { root: true }
          )
        })
      promises.push(promise)
    }
    return Promise.all(promises)
  },
  removeFilesFromTrashbin(context, files) {
    for (const file of files) {
      context.commit('REMOVE_FILE', file)
    }
  },
  renameFile(context, { file, newValue, client, publicPage }) {
    if (file !== undefined && newValue !== undefined && newValue !== file.name) {
      const newPath = file.path.substr(1, file.path.lastIndexOf('/'))
      if (publicPage) {
        return client.publicFiles
          .move(file.path, newPath + newValue, context.getters.publicLinkPassword)
          .then(() => {
            context.commit('RENAME_FILE', { file, newValue, newPath })
          })
      }
      return client.files.move(file.path, newPath + newValue).then(() => {
        context.commit('RENAME_FILE', { file, newValue, newPath })
      })
    }
  },
  searchForFile(context, payload) {
    context.commit('UPDATE_CURRENT_PAGE', 1)

    return new Promise(function(resolve, reject) {
      const client = payload.client
      const searchTerm = payload.searchTerm
      context.commit('SET_SEARCH_TERM', searchTerm)
      // TODO respect user selected listSize from state.config
      // do not search for empty strings
      if (!searchTerm) return
      client.files
        .search(searchTerm, null, context.state.davProperties)
        .then(filesSearched => {
          filesSearched = filesSearched.map(f => {
            return buildResource(f)
          })
          context.commit('LOAD_FILES_SEARCHED', filesSearched)
          resolve(filesSearched)
        })
        .catch(error => {
          // TODO notification missing
          context.dispatch(
            'showMessage',
            {
              title: this.$gettext('Error while searching.'),
              desc: error.message,
              status: 'danger',
              autoClose: {
                enabled: true
              }
            },
            { root: true }
          )
          reject(error)
        })
    })
  },
  loadCurrentFileOutgoingShares(context, { client, path }) {
    context.commit('CURRENT_FILE_OUTGOING_SHARES_SET', [])
    context.commit('CURRENT_FILE_OUTGOING_SHARES_ERROR', null)
    context.commit('CURRENT_FILE_OUTGOING_SHARES_LOADING', true)

    // see https://owncloud.dev/owncloud-sdk/Shares.html
    client.shares
      .getShares(path, { reshares: true })
      .then(data => {
        context.commit(
          'CURRENT_FILE_OUTGOING_SHARES_SET',
          data.map(element => {
            return buildShare(
              element.shareInfo,
              context.getters.highlightedFile,
              !context.rootGetters.isOcis
            )
          })
        )
        context.commit('UPDATE_CURRENT_FILE_SHARE_TYPES')
        context.commit('CURRENT_FILE_OUTGOING_SHARES_LOADING', false)
      })
      .catch(error => {
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
      .then(data => {
        context.commit(
          'INCOMING_SHARES_LOAD',
          data.map(element => {
            return buildCollaboratorShare(
              element.shareInfo,
              context.getters.highlightedFile,
              !context.rootGetters.isOcis
            )
          })
        )
        context.commit('INCOMING_SHARES_LOADING', false)
      })
      .catch(error => {
        context.commit('INCOMING_SHARES_ERROR', error.message)
        context.commit('INCOMING_SHARES_LOADING', false)
      })
  },
  sharesClearState(context, payload) {
    context.commit('CURRENT_FILE_OUTGOING_SHARES_SET', [])
    context.commit('CURRENT_FILE_OUTGOING_SHARES_ERROR', null)
  },
  incomingSharesClearState(context, payload) {
    context.commit('INCOMING_SHARES_LOAD', [])
    context.commit('INCOMING_SHARES_ERROR', null)
  },
  changeShare(
    { commit, getters, rootGetters },
    { client, share, role, permissions, expirationDate }
  ) {
    const params = {
      permissions: permissions,
      expireDate: expirationDate
    }

    if (!params.permissions) {
      return new Promise((resolve, reject) => {
        reject(new Error('Nothing changed'))
      })
    }

    return new Promise((resolve, reject) => {
      client.shares
        .updateShare(share.id, params)
        .then(updatedShare => {
          const share = buildCollaboratorShare(
            updatedShare.shareInfo,
            getters.highlightedFile,
            !rootGetters.isOcis
          )
          commit('CURRENT_FILE_OUTGOING_SHARES_UPDATE', share)
          resolve(share)
        })
        .catch(e => {
          reject(e)
        })
    })
  },
  addShare(context, { client, path, shareWith, shareType, permissions, expirationDate }) {
    if (shareType === shareTypes.group) {
      client.shares
        .shareFileWithGroup(path, shareWith, {
          permissions: permissions,
          expirationDate: expirationDate
        })
        .then(share => {
          context.commit(
            'CURRENT_FILE_OUTGOING_SHARES_ADD',
            buildCollaboratorShare(
              share.shareInfo,
              context.getters.highlightedFile,
              !context.rootGetters.isOcis
            )
          )
          context.commit('UPDATE_CURRENT_FILE_SHARE_TYPES')
          context.commit('LOAD_INDICATORS')
        })
        .catch(e => {
          context.dispatch(
            'showMessage',
            {
              title: $gettext('Error while sharing.'),
              desc: e,
              status: 'danger',
              autoClose: {
                enabled: true
              }
            },
            { root: true }
          )
        })
      return
    }

    const remoteShare = shareType === shareTypes.remote
    client.shares
      .shareFileWithUser(path, shareWith, {
        permissions: permissions,
        remoteUser: remoteShare,
        expirationDate: expirationDate
      })
      .then(share => {
        context.commit(
          'CURRENT_FILE_OUTGOING_SHARES_ADD',
          buildCollaboratorShare(
            share.shareInfo,
            context.getters.highlightedFile,
            !context.rootGetters.isOcis
          )
        )
        context.commit('UPDATE_CURRENT_FILE_SHARE_TYPES')
        context.commit('LOAD_INDICATORS')
      })
      .catch(e => {
        context.dispatch(
          'showMessage',
          {
            title: $gettext('Error while sharing.'),
            desc: e,
            status: 'danger',
            autoClose: {
              enabled: true
            }
          },
          { root: true }
        )
      })
  },
  deleteShare(context, { client, share }) {
    client.shares
      .deleteShare(share.id)
      .then(() => {
        context.commit('CURRENT_FILE_OUTGOING_SHARES_REMOVE', share)
        context.commit('UPDATE_CURRENT_FILE_SHARE_TYPES')
        context.commit('LOAD_INDICATORS')
      })
      .catch(e => {
        console.log(e)
      })
  },
  resetSearch({ commit }) {
    commit('SET_SEARCH_TERM', '')
    commit('UPDATE_CURRENT_PAGE', 1)
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
    parentPaths.forEach(queryPath => {
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
            .then(data => {
              data.forEach(element => {
                sharesTree[queryPath].push({
                  ...buildShare(element.shareInfo, { type: 'folder' }, !context.rootGetters.isOcis),
                  outgoing: true,
                  indirect: true
                })
              })
            })
            .catch(error => {
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
            .then(data => {
              data.forEach(element => {
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
            .catch(error => {
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
  dragOver(context, value) {
    context.commit('DRAG_OVER', value)
  },
  setHighlightedFile(context, file) {
    context.commit('SET_HIGHLIGHTED_FILE', file)
  },
  setPublicLinkPassword(context, password) {
    context.commit('SET_PUBLIC_LINK_PASSWORD', password)
  },

  addLink(context, { path, client, params }) {
    return new Promise((resolve, reject) => {
      client.shares
        .shareFileWithLink(path, params)
        .then(data => {
          const link = buildShare(data.shareInfo, null, !context.rootGetters.isOcis)
          context.commit('CURRENT_FILE_OUTGOING_SHARES_ADD', link)
          context.commit('UPDATE_CURRENT_FILE_SHARE_TYPES')
          context.commit('LOAD_INDICATORS')
          resolve(link)
        })
        .catch(e => {
          reject(e)
        })
    })
  },
  updateLink(context, { id, client, params }) {
    return new Promise((resolve, reject) => {
      client.shares
        .updateShare(id, params)
        .then(data => {
          const link = buildShare(data.shareInfo, null, !context.rootGetters.isOcis)
          context.commit('CURRENT_FILE_OUTGOING_SHARES_UPDATE', link)
          resolve(link)
        })
        .catch(e => {
          reject(e)
        })
    })
  },
  removeLink(context, { share, client }) {
    client.shares
      .deleteShare(share.id)
      .then(() => {
        context.commit('CURRENT_FILE_OUTGOING_SHARES_REMOVE', share)
        context.commit('UPDATE_CURRENT_FILE_SHARE_TYPES')
        context.commit('LOAD_INDICATORS')
      })
      .catch(e => context.commit('CURRENT_FILE_OUTGOING_SHARES_ERROR', e.message))
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
    await dispatch('loadSharesTree', { client, path: currentFolder })
    commit('LOAD_INDICATORS')
  },

  loadAvatars({ commit, rootGetters }, { resource }) {
    ;['sharedWith', 'owner'].forEach(k => {
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
        ).then(url =>
          commit('UPDATE_RESOURCE_FIELD', {
            id: resource.id,
            field: `${k}.[${i}].avatar`,
            value: url
          })
        )
      })
    })
  },

  async loadPreview({ commit, rootGetters }, { resource, isPublic, dimensions }) {
    if (
      rootGetters.previewFileExtensions.length &&
      !rootGetters.previewFileExtensions.includes(resource.extension)
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
      commit('UPDATE_RESOURCE_FIELD', { id: resource.id, field: 'preview', value: preview })
    }
  }
}
