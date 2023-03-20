import PQueue from 'p-queue'

import { getParentPaths } from '../helpers/path'
import { buildShare, buildCollaboratorShare } from '../helpers/resources'
import { ResourceTransfer, TransferType } from '../helpers/resource'
import { loadPreview } from 'web-pkg/src/helpers/preview'
import { avatarUrl } from '../helpers/user'
import { has } from 'lodash-es'
import { ShareTypes } from 'web-client/src/helpers/share'
import get from 'lodash-es/get'
import { ClipboardActions } from '../helpers/clipboardActions'
import { thumbnailService } from '../services'
import {
  buildResource,
  isProjectSpaceResource,
  Resource,
  SpaceResource
} from 'web-client/src/helpers'
import { WebDAV } from 'web-client/src/webdav'
import { ClientService, LoadingTaskCallbackArguments } from 'web-pkg/src/services'
import { Language } from 'vue3-gettext'
import { DavProperty } from 'web-client/src/webdav/constants'
import { AncestorMetaData } from 'web-app-files/src/helpers/resource/ancestorMetaData'

const allowSharePermissions = (getters) => {
  return (
    get(getters, `capabilities.files_sharing.resharing`, true) &&
    get(getters, `capabilities.files_sharing.resharing_default`, true)
  )
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
  copySelectedFiles(context, options: { space: SpaceResource; resources: Resource[] } & Language) {
    const { $gettext } = options
    context.commit('CLIPBOARD_SELECTED', options)
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
  cutSelectedFiles(context, options: { space: SpaceResource; resources: Resource[] } & Language) {
    const { $gettext } = options
    context.commit('CLIPBOARD_SELECTED', options)
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
      targetSpace,
      clientService,
      loadingService,
      createModal,
      hideModal,
      showMessage,
      $gettext,
      $gettextInterpolate,
      $ngettext
    }
  ) {
    const copyMove = new ResourceTransfer(
      context.state.clipboardSpace,
      context.state.clipboardResources,
      targetSpace,
      context.state.currentFolder,
      clientService,
      loadingService,
      createModal,
      hideModal,
      showMessage,
      $gettext,
      $ngettext,
      $gettextInterpolate
    )
    let movedResources = []
    if (context.state.clipboardAction === ClipboardActions.Cut) {
      movedResources = await copyMove.perform(TransferType.MOVE)
    }
    if (context.state.clipboardAction === ClipboardActions.Copy) {
      movedResources = await copyMove.perform(TransferType.COPY)
    }

    await loadingService.addTask(
      () => {
        context.commit('CLEAR_CLIPBOARD')
        const loadingResources = []
        const fetchedResources = []
        for (const resource of movedResources) {
          loadingResources.push(
            (async () => {
              const movedResource = await (clientService.webdav as WebDAV).getFileInfo(
                targetSpace,
                resource
              )
              fetchedResources.push(movedResource)
            })()
          )
        }

        return Promise.all(loadingResources).then(() => {
          context.commit('UPSERT_RESOURCES', fetchedResources)
        })
      },
      { debounceTime: 0 }
    )
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
  deleteFiles(
    context,
    options: {
      space: SpaceResource
      files: Resource[]
      clientService: ClientService
      loadingCallbackArgs: LoadingTaskCallbackArguments
      firstRun: boolean
    } & Language
  ) {
    const {
      $gettext,
      interpolate: $gettextInterpolate,
      space,
      files,
      clientService,
      loadingCallbackArgs,
      firstRun = true
    } = options
    const { setProgress } = loadingCallbackArgs
    const promises = []
    const removedFiles = []
    for (const [i, file] of files.entries()) {
      const promise = clientService.webdav
        .deleteFile(space, file)
        .then(() => {
          removedFiles.push(file)
        })
        .catch((error) => {
          let translated = $gettext('Failed to delete "%{file}"')
          if (error.statusCode === 423) {
            if (firstRun) {
              return context.dispatch('deleteFiles', {
                ...options,
                space,
                files: [file],
                clientService,
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
        .finally(() => {
          setProgress({ total: files.length, current: i + 1 })
        })
      promises.push(promise)
    }
    return Promise.all(promises).then(() => {
      context.commit('REMOVE_FILES', removedFiles)
      context.commit('REMOVE_FILES_FROM_SEARCHED', removedFiles)
      context.commit('RESET_SELECTION')
    })
  },
  clearTrashBin(context) {
    context.commit('CLEAR_FILES')
    context.commit('RESET_SELECTION')
    context.commit('CLEAR_FILES_SEARCHED')
  },
  removeFilesFromTrashbin(context, files) {
    context.commit('REMOVE_FILES', files)
    context.commit('REMOVE_FILES_FROM_SEARCHED', files)
    context.commit('RESET_SELECTION')
  },
  updateCurrentFileShareTypes({ state, getters, commit }) {
    const highlighted = getters.highlightedFile
    if (!highlighted || isProjectSpaceResource(highlighted)) {
      return
    }
    commit('UPDATE_RESOURCE_FIELD', {
      id: highlighted.id,
      field: 'shareTypes',
      value: computeShareTypes(state.outgoingShares.filter((s) => !s.indirect))
    })

    const ancestorEntry = state.ancestorMetaData[highlighted.path] ?? null
    if (ancestorEntry) {
      commit('UPDATE_ANCESTOR_FIELD', {
        path: ancestorEntry.path,
        field: 'shareTypes',
        value: computeShareTypes(state.outgoingShares.filter((s) => !s.indirect))
      })
    }
  },
  async changeShare(
    { commit, dispatch, getters, rootGetters },
    { $gettext, client, share, permissions, expirationDate, role }
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

      const builtShare = buildCollaboratorShare(
        updatedShare.shareInfo,
        getters.highlightedFile,
        allowSharePermissions(rootGetters)
      )
      commit('OUTGOING_SHARES_UPSERT', { ...builtShare, outgoing: true })
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
    { $gettext, client, path, shareWith, shareType, permissions, role, expirationDate, storageId }
  ) {
    const isGroupShare = shareType === ShareTypes.group.value
    const options = {
      permissions,
      role: role.name,
      expirationDate,
      spaceRef: storageId,
      remoteUser: undefined
    }

    if (!isGroupShare) {
      options.remoteUser = shareType === ShareTypes.remote.value
    }

    const shareMethod = isGroupShare ? 'shareFileWithGroup' : 'shareFileWithUser'
    return client.shares[shareMethod](path, shareWith, options)
      .then((share) => {
        const builtShare = buildCollaboratorShare(
          share.shareInfo,
          context.getters.highlightedFile,
          allowSharePermissions(context.rootGetters)
        )
        context.commit('OUTGOING_SHARES_UPSERT', { ...builtShare, outgoing: true })
        context.dispatch('updateCurrentFileShareTypes')
        context.commit('LOAD_INDICATORS', path)
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
  deleteShare(context, { client, share, path, loadIndicators = false }) {
    return client.shares.deleteShare(share.id, {} as any).then(() => {
      context.commit('OUTGOING_SHARES_REMOVE', share)
      context.dispatch('updateCurrentFileShareTypes')
      if (loadIndicators) {
        context.commit('LOAD_INDICATORS', path)
      }
    })
  },
  async loadShares(context, { client, path, storageId, useCached = true }) {
    if (context.state.sharesLoading) {
      await context.state.sharesLoading
    }
    let resolvePromise
    const promise = new Promise((resolve) => {
      resolvePromise = resolve
    })
    context.commit('SHARES_LOADING', promise)
    promise.then(() => {
      context.commit('SHARES_LOADING', false)
    })

    const parentPaths = path === '/' ? ['/'] : getParentPaths(path, true)
    const currentlyLoadedShares = [...context.state.outgoingShares, ...context.state.incomingShares]
    const shares = []

    const shareQueriesQueue = new PQueue({ concurrency: 2 })
    const shareQueriesPromises = []
    const { highlightedFile } = context.getters

    const getShares = (subPath, indirect, options, outgoing) => {
      const buildMethod = outgoing ? buildShare : buildCollaboratorShare
      const resource = indirect || !highlightedFile ? { type: 'folder' } : highlightedFile
      const permissions = allowSharePermissions(context.rootGetters)
      return client.shares
        .getShares(subPath, options)
        .then((data) => {
          data.forEach((element) => {
            shares.push({
              ...buildMethod(element.shareInfo, resource, permissions),
              outgoing,
              indirect
            })
          })
        })
        .catch((error) => {
          console.error('SHARESTREE_ERROR', error)
        })
    }

    if (!path) {
      // space shares
      shareQueriesPromises.push(
        getShares(path, false, { reshares: true, spaceRef: storageId }, true)
      )
    }

    parentPaths.forEach((queryPath) => {
      const ancestorMetaData = context.state.ancestorMetaData[queryPath] ?? null
      const indirect = path !== queryPath
      const spaceRef = indirect ? ancestorMetaData?.id : storageId
      // no need to fetch cached shares again, only adjust the "indirect" state
      if (useCached && currentlyLoadedShares.length) {
        const cached = currentlyLoadedShares.filter((s) => s.path === queryPath)
        if (cached.length) {
          shares.push(...cached.map((c) => ({ ...c, indirect })))
          return
        }
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

    return Promise.allSettled(shareQueriesPromises).then(() => {
      context.commit(
        'OUTGOING_SHARES_SET',
        shares.filter((s) => s.outgoing)
      )
      context.commit(
        'INCOMING_SHARES_SET',
        shares.filter((s) => !s.outgoing)
      )
      resolvePromise()
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
          context.commit('OUTGOING_SHARES_UPSERT', { ...link, outgoing: true })
          context.dispatch('updateCurrentFileShareTypes')
          context.commit('LOAD_INDICATORS', path)
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
          context.commit('OUTGOING_SHARES_UPSERT', { ...link, outgoing: true })
          resolve(link)
        })
        .catch((e) => {
          reject(e)
        })
    })
  },
  removeLink(context, { share, client, path, loadIndicators = false }) {
    return client.shares.deleteShare(share.id).then(() => {
      context.commit('OUTGOING_SHARES_REMOVE', share)
      context.dispatch('updateCurrentFileShareTypes')
      if (loadIndicators) {
        context.commit('LOAD_INDICATORS', path)
      }
    })
  },

  loadAvatars(
    { commit, rootGetters },
    {
      resource,
      clientService
    }: {
      resource: Resource
      clientService: ClientService
    }
  ) {
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
            clientService,
            username: obj.username,
            server: rootGetters.configuration.server
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

  async loadPreview(
    { commit, rootGetters },
    { clientService, resource, isPublic, dimensions, type }
  ) {
    if (!thumbnailService.available || !thumbnailService.isMimetypeSupported(resource.mimeType)) {
      return
    }

    const preview = await loadPreview(
      {
        clientService,
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
  },

  loadAncestorMetaData({ commit, state }, { folder, space, client }) {
    const ancestorMetaData: AncestorMetaData = {
      [folder.path]: {
        id: folder.fileId,
        shareTypes: folder.shareTypes,
        parentFolderId: folder.parentFolderId,
        spaceId: space.id,
        path: folder.path
      }
    }
    const promises = []
    const davProperties = [DavProperty.FileId, DavProperty.ShareTypes, DavProperty.FileParent]
    const parentPaths = getParentPaths(folder.path)

    for (const path of parentPaths) {
      const cachedData = state.ancestorMetaData[path] ?? null
      if (cachedData?.spaceId === space.id) {
        ancestorMetaData[path] = cachedData
        continue
      }

      promises.push(
        client.listFiles(space, { path }, { depth: 0, davProperties }).then(({ resource }) => {
          ancestorMetaData[path] = {
            id: resource.fileId,
            shareTypes: resource.shareTypes,
            parentFolderId: resource.parentFolderId,
            spaceId: space.id,
            path
          }
        })
      )
    }

    return Promise.all(promises).then(() => {
      commit('SET_ANCESTOR_META_DATA', ancestorMetaData)
    })
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
