import { MessageStore, CapabilityStore, ConfigStore } from '@ownclouders/web-pkg'
import { avatarUrl } from '../helpers/user'
import { has } from 'lodash-es'
import {
  buildResource,
  isProjectSpaceResource,
  Resource,
  SpaceResource
} from '@ownclouders/web-client/src/helpers'
import { ClientService, LoadingTaskCallbackArguments } from '@ownclouders/web-pkg'
import { Language } from 'vue3-gettext'
import { eventBus } from '@ownclouders/web-pkg'
import { AncestorMetaData, SharesStore } from '@ownclouders/web-pkg'

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
      messageStore: MessageStore
      sharesStore: SharesStore
    } & Language
  ) {
    const {
      $gettext,
      $ngettext,
      space,
      files,
      clientService,
      loadingCallbackArgs,
      sharesStore,
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
                sharesStore,
                firstRun: false
              })
            }

            title = $gettext('Failed to delete "%{file}" - the file is locked', { file: file.name })
          }
          options.messageStore.showErrorMessage({ title, errors: [error] })
        })
        .finally(() => {
          setProgress({ total: files.length, current: i + 1 })
        })
      promises.push(promise)
    }
    return Promise.all(promises).then(() => {
      context.commit('REMOVE_FILES', removedFiles)
      context.commit('RESET_SELECTION')
      sharesStore.pruneShares()

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
        options.messageStore.showMessage({ title })
      }
    })
  },
  clearTrashBin(context) {
    context.commit('CLEAR_FILES')
    context.commit('RESET_SELECTION')
  },
  removeFilesFromTrashbin(context, files) {
    context.commit('REMOVE_FILES', files)
    context.commit('RESET_SELECTION')
  },
  updateFileShareTypes({ getters, commit, rootState }, { path, outgoingShares }) {
    const file = [...getters.files, getters.currentFolder].find((f) => f?.path === path)
    if (!file || isProjectSpaceResource(file)) {
      return
    }

    commit('UPDATE_RESOURCE_FIELD', {
      id: file.id,
      field: 'shareTypes',
      value: computeShareTypes(outgoingShares.filter((s) => !s.indirect))
    })

    const ancestorEntry =
      (rootState.runtime.ancestorMetaData.ancestorMetaData as AncestorMetaData)[file.path] ?? null
    if (ancestorEntry) {
      commit(
        'runtime/ancestorMetaData/UPDATE_ANCESTOR_FIELD',
        {
          path: ancestorEntry.path,
          field: 'shareTypes',
          value: computeShareTypes(outgoingShares.filter((s) => !s.indirect))
        },
        { root: true }
      )
    }
  },
  loadAvatars(
    { commit },
    {
      resource,
      clientService,
      capabilityStore,
      configStore
    }: {
      resource: Resource
      clientService: ClientService
      capabilityStore: CapabilityStore
      configStore: ConfigStore
    }
  ) {
    if (!capabilityStore.sharingUserProfilePicture) {
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
            server: configStore.serverUrl
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
