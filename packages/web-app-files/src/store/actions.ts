import PQueue from 'p-queue'

import { getParentPaths } from '@ownclouders/web-pkg'
import {
  buildShare,
  buildCollaboratorShare,
  ShareTypes
} from '@ownclouders/web-client/src/helpers/share'
import { ResourceTransfer, TransferType } from '../helpers/resource'
import { avatarUrl } from '../helpers/user'
import { has } from 'lodash-es'
import get from 'lodash-es/get'
import { ClipboardActions } from '@ownclouders/web-pkg'
import {
  buildResource,
  isProjectSpaceResource,
  Resource,
  SpaceResource
} from '@ownclouders/web-client/src/helpers'
import { WebDAV } from '@ownclouders/web-client/src/webdav'
import { ClientService, LoadingTaskCallbackArguments } from '@ownclouders/web-pkg'
import { Language } from 'vue3-gettext'
import { eventBus } from '@ownclouders/web-pkg'
import { AncestorMetaData } from '@ownclouders/web-pkg'

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
  copySelectedFiles(context, options: { resources: Resource[] } & Language) {
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
      showErrorMessage,
      $gettext,
      $ngettext,
      sourceSpace,
      resources
    }
  ) {
    const copyMove = new ResourceTransfer(
      sourceSpace,
      resources,
      targetSpace,
      context.state.currentFolder,
      clientService,
      loadingService,
      createModal,
      hideModal,
      showMessage,
      showErrorMessage,
      $gettext,
      $ngettext
    )
    let movedResourcesPromise
    if (context.state.clipboardAction === ClipboardActions.Cut) {
      movedResourcesPromise = copyMove.perform(TransferType.MOVE)
    }
    if (context.state.clipboardAction === ClipboardActions.Copy) {
      movedResourcesPromise = copyMove.perform(TransferType.COPY)
    }
    return movedResourcesPromise.then((movedResources) => {
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
        const currentFolder = context.getters.currentFolder
        context.commit('UPSERT_RESOURCES', fetchedResources)
        context.commit('LOAD_INDICATORS', currentFolder.path)
      })
    })
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
        if (!newValue) {
          eventBus.publish('app.files.list.removeFromFavorites', file.id)
        }
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
      $ngettext,
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
          let title = $gettext('Failed to delete "%{file}"', { file: file.name })
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

            title = $gettext('Failed to delete "%{file}" - the file is locked', { file: file.name })
          }
          context.dispatch(
            'showErrorMessage',
            {
              title,
              error
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
      context.commit('PRUNE_SHARES')

      if (removedFiles.length) {
        const title =
          removedFiles.length === 1 && files.length === 1
            ? $gettext('"%{item}" was moved to trash bin', { item: removedFiles[0].name })
            : $ngettext(
                '%{itemCount} item was moved to trash bin',
                '%{itemCount} items were moved to trash bin',
                removedFiles.length,
                { itemCount: removedFiles.length.toString() },
                true
              )
        context.dispatch('showMessage', { title }, { root: true })
      }
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
  updateFileShareTypes({ state, getters, commit, rootState }, path) {
    const file = [...getters.files, getters.currentFolder].find((f) => f?.path === path)
    if (!file || isProjectSpaceResource(file)) {
      return
    }

    commit('UPDATE_RESOURCE_FIELD', {
      id: file.id,
      field: 'shareTypes',
      value: computeShareTypes(state.outgoingShares.filter((s) => !s.indirect))
    })

    const ancestorEntry =
      (rootState.runtime.ancestorMetaData.ancestorMetaData as AncestorMetaData)[file.path] ?? null
    if (ancestorEntry) {
      commit(
        'runtime/ancestorMetaData/UPDATE_ANCESTOR_FIELD',
        {
          path: ancestorEntry.path,
          field: 'shareTypes',
          value: computeShareTypes(state.outgoingShares.filter((s) => !s.indirect))
        },
        { root: true }
      )
    }
  },
  async changeShare(
    { commit, dispatch, getters, rootGetters },
    { client, share, permissions, expirationDate, role }
  ) {
    if (!permissions && !role) {
      throw new Error('Nothing changed')
    }

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
  },
  async addShare(
    context,
    {
      client,
      path,
      shareWith,
      shareType,
      permissions,
      role,
      expirationDate,
      storageId,
      notify = undefined,
      shareWithUser = undefined,
      shareWithProvider = undefined
    }
  ) {
    const isGroupShare = shareType === ShareTypes.group.value
    const options = {
      permissions,
      role: role.name,
      expirationDate,
      spaceRef: storageId,
      remoteUser: undefined,
      ...(notify && { notify }),
      ...(shareWithUser && { shareWithUser }),
      ...(shareWithProvider && { shareWithProvider })
    }

    if (!isGroupShare) {
      options.remoteUser = shareType === ShareTypes.remote.value
    }

    const shareMethod = isGroupShare ? 'shareFileWithGroup' : 'shareFileWithUser'
    const share = await client.shares[shareMethod](path, shareWith, options)
    const builtShare = buildCollaboratorShare(
      share.shareInfo,
      context.getters.highlightedFile,
      allowSharePermissions(context.rootGetters)
    )
    if (context.state.sharesLoading) {
      await Promise.resolve(context.state.sharesLoading)
    }
    context.commit('OUTGOING_SHARES_UPSERT', { ...builtShare, outgoing: true })
    context.dispatch('updateFileShareTypes', path)
    context.commit('LOAD_INDICATORS', path)
  },
  async deleteShare(context, { client, share, path, loadIndicators = false }) {
    await client.shares.deleteShare(share.id, {} as any)
    if (context.state.sharesLoading) {
      await Promise.resolve(context.state.sharesLoading)
    }
    context.commit('OUTGOING_SHARES_REMOVE', share)
    context.dispatch('updateFileShareTypes', path)
    if (loadIndicators) {
      context.commit('LOAD_INDICATORS', path)
    }
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
      const ancestorMetaData =
        (context.rootState.runtime.ancestorMetaData.ancestorMetaData as AncestorMetaData)[
          queryPath
        ] ?? null
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
  async loadVersions(context, { client, fileId }: { client: WebDAV; fileId: Resource['fileId'] }) {
    let response
    try {
      response = await client.listFileVersions(fileId)
    } catch (e) {
      console.error(e)
      response = []
    }
    context.commit('SET_VERSIONS', response)
  },

  addLink(
    { commit, dispatch, getters, rootGetters, state, rootState },
    { path, client, params, storageId }
  ) {
    return new Promise((resolve, reject) => {
      client.shares
        .shareFileWithLink(path, { ...params, spaceRef: storageId })
        .then(async (data) => {
          const link = buildShare(data.shareInfo, null, allowSharePermissions(rootGetters))
          if (state.sharesLoading) {
            await Promise.resolve(state.sharesLoading)
          }

          const fileIsSelected =
            getters.selectedFiles.some(({ fileId }) => fileId === storageId) ||
            (getters.selectedFiles.length === 0 && getters.currentFolder.fileId === storageId)

          commit('OUTGOING_SHARES_UPSERT', { ...link, outgoing: true, indirect: !fileIsSelected })
          dispatch('updateFileShareTypes', path)

          if (!fileIsSelected) {
            // we might need to update the share types for the ancestor resource as well
            const ancestor =
              (rootState.runtime.ancestorMetaData.ancestorMetaData as AncestorMetaData)[path] ??
              null
            if (ancestor) {
              const { shareTypes } = ancestor
              if (!shareTypes.includes(ShareTypes.link.value)) {
                commit(
                  'runtime/ancestorMetaData/UPDATE_ANCESTOR_FIELD',
                  {
                    path: ancestor.path,
                    field: 'shareTypes',
                    value: [...shareTypes, ShareTypes.link.value]
                  },
                  { root: true }
                )
              }
            }
          }
          commit('LOAD_INDICATORS', path)
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
    return client.shares.deleteShare(share.id).then(async () => {
      if (context.state.sharesLoading) {
        await Promise.resolve(context.state.sharesLoading)
      }
      context.commit('OUTGOING_SHARES_REMOVE', share)
      context.dispatch('updateFileShareTypes', path)
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

  async loadPreview({ commit }, { previewService, space, resource, dimensions, type, processor }) {
    const preview = await previewService.loadPreview(
      { space, resource, dimensions, processor },
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
