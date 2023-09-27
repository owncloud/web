import { Store } from 'vuex'
import { isSameResource } from '../../../helpers/resource'
import { isLocationTrashActive, isLocationSharesActive } from '../../../router'
import { Resource } from 'web-client'
import { dirname, join } from 'path'
import { WebDAV } from 'web-client/src/webdav'
import {
  SpaceResource,
  isShareSpaceResource,
  extractNameWithoutExtension
} from 'web-client/src/helpers'
import { createFileRouteOptions } from 'web-pkg/src/helpers/router'
import { renameResource as _renameResource } from 'web-client/src/helpers'
import { computed, unref } from 'vue'
import {
  useClientService,
  useConfigurationManager,
  useLoadingService,
  useRouter,
  useStore
} from 'web-pkg/src/composables'
import { useGettext } from 'vue3-gettext'
import { FileAction, FileActionOptions } from 'web-pkg/src/composables/actions'
import { useCapabilityFilesSharingCanRename } from 'web-pkg/src/composables/capability'

export const useFileActionsRename = ({ store }: { store?: Store<any> } = {}) => {
  store = store || useStore()
  const router = useRouter()
  const { $gettext } = useGettext()
  const clientService = useClientService()
  const loadingService = useLoadingService()
  const canRename = useCapabilityFilesSharingCanRename()
  const configurationManager = useConfigurationManager()

  const checkNewName = (resource, newName, parentResources = undefined) => {
    const newPath =
      resource.path.substring(0, resource.path.length - resource.name.length) + newName

    if (!newName) {
      return store.dispatch('setModalInputErrorMessage', $gettext('The name cannot be empty'))
    }

    if (/[/]/.test(newName)) {
      return store.dispatch('setModalInputErrorMessage', $gettext('The name cannot contain "/"'))
    }

    if (newName === '.') {
      return store.dispatch(
        'setModalInputErrorMessage',
        $gettext('The name cannot be equal to "."')
      )
    }

    if (newName === '..') {
      return store.dispatch(
        'setModalInputErrorMessage',
        $gettext('The name cannot be equal to ".."')
      )
    }

    if (/\s+$/.test(newName)) {
      return store.dispatch(
        'setModalInputErrorMessage',
        $gettext('The name cannot end with whitespace')
      )
    }

    const exists = store.getters['Files/files'].find(
      (file) => file.path === newPath && resource.name !== newName
    )
    if (exists) {
      const translated = $gettext('The name "%{name}" is already taken')
      return store.dispatch(
        'setModalInputErrorMessage',
        $gettext(translated, { name: newName }, true)
      )
    }

    if (parentResources) {
      const exists = parentResources.find(
        (file) => file.path === newPath && resource.name !== newName
      )

      if (exists) {
        const translated = $gettext('The name "%{name}" is already taken')

        return store.dispatch(
          'setModalInputErrorMessage',
          $gettext(translated, { name: newName }, true)
        )
      }
    }

    store.dispatch('setModalInputErrorMessage', null)
  }

  const renameResource = async (space: SpaceResource, resource: Resource, newName: string) => {
    store.dispatch('toggleModalConfirmButton')
    let currentFolder = store.getters['Files/currentFolder']

    try {
      const newPath = join(dirname(resource.path), newName)
      await (clientService.webdav as WebDAV).moveFiles(space, resource, space, {
        path: newPath
      })
      store.dispatch('hideModal')

      const isCurrentFolder = isSameResource(resource, currentFolder)

      if (isShareSpaceResource(space) && resource.isReceivedShare()) {
        space.rename(newName)

        if (isCurrentFolder) {
          currentFolder = { ...currentFolder } as Resource
          currentFolder.name = newName
          store.commit('Files/SET_CURRENT_FOLDER', currentFolder)
          return router.push(
            createFileRouteOptions(space, {
              path: '',
              fileId: resource.fileId
            })
          )
        }

        const sharedResource = { ...resource }
        sharedResource.name = newName
        store.commit('Files/UPSERT_RESOURCE', sharedResource)
        return
      }

      if (isCurrentFolder) {
        currentFolder = { ...currentFolder } as Resource
        _renameResource(space, currentFolder, newPath)
        store.commit('SET_CURRENT_FOLDER', currentFolder)
        return router.push(
          createFileRouteOptions(space, {
            path: newPath,
            fileId: resource.fileId
          })
        )
      }
      const fileResource = { ...resource } as Resource
      _renameResource(space, fileResource, newPath)
      store.commit('Files/UPSERT_RESOURCE', fileResource)
    } catch (error) {
      console.error(error)
      store.dispatch('toggleModalConfirmButton')
      let title = $gettext(
        'Failed to rename "%{file}" to "%{newName}"',
        { file: resource.name, newName },
        true
      )
      if (error.statusCode === 423) {
        title = $gettext(
          'Failed to rename "%{file}" to "%{newName}" - the file is locked',
          { file: resource.name, newName },
          true
        )
      }
      store.dispatch('showErrorMessage', {
        title,
        error
      })
    }
  }

  const handler = async ({ space, resources }: FileActionOptions) => {
    const currentFolder = store.getters['Files/currentFolder']
    let parentResources
    if (isSameResource(resources[0], currentFolder)) {
      const parentPath = dirname(currentFolder.path)
      parentResources = (
        await (clientService.webdav as WebDAV).listFiles(space, {
          path: parentPath
        })
      ).children
    }

    const areFileExtensionsShown = store.state.Files.areFileExtensionsShown
    const confirmAction = (newName) => {
      if (!areFileExtensionsShown) {
        newName = `${newName}.${resources[0].extension}`
      }

      return renameResource(space, resources[0], newName)
    }
    const checkName = (newName) => {
      if (!areFileExtensionsShown) {
        newName = `${newName}.${resources[0].extension}`
      }
      checkNewName(resources[0], newName, parentResources)
    }
    const nameWithoutExtension = extractNameWithoutExtension(resources[0])
    const modalTitle =
      !resources[0].isFolder && !areFileExtensionsShown ? nameWithoutExtension : resources[0].name

    const title = resources[0].isFolder
      ? $gettext('Rename folder %{name}', { name: modalTitle })
      : $gettext('Rename file %{name}', { name: modalTitle })

    const inputValue =
      !resources[0].isFolder && !areFileExtensionsShown ? nameWithoutExtension : resources[0].name

    const inputSelectionRange =
      resources[0].isFolder || !areFileExtensionsShown ? null : [0, nameWithoutExtension.length]

    const modal = {
      variation: 'passive',
      title,
      cancelText: $gettext('Cancel'),
      confirmText: $gettext('Rename'),
      hasInput: true,
      inputValue,
      inputSelectionRange,
      inputLabel: resources[0].isFolder ? $gettext('Folder name') : $gettext('File name'),
      onCancel: () => store.dispatch('hideModal'),
      onConfirm: (args) => loadingService.addTask(() => confirmAction(args)),
      onInput: checkName
    }

    store.dispatch('createModal', modal)
  }

  const actions = computed((): FileAction[] => [
    {
      name: 'rename',
      icon: 'pencil',
      label: () => {
        return $gettext('Rename')
      },
      handler,
      isEnabled: ({ resources }) => {
        if (isLocationTrashActive(router, 'files-trash-generic')) {
          return false
        }
        if (isLocationSharesActive(router, 'files-shares-with-me') && !unref(canRename)) {
          return false
        }
        if (resources.length !== 1) {
          return false
        }

        // FIXME: Remove this check as soon as renaming shares works as expected
        // see https://github.com/owncloud/ocis/issues/4866
        const rootShareIncluded = configurationManager.options.routing.fullShareOwnerPaths
          ? resources.some((r) => r.shareRoot && r.path)
          : resources.some((r) => r.shareId && r.path === '/')
        if (rootShareIncluded) {
          return false
        }

        if (resources.length === 1 && resources[0].locked) {
          return false
        }

        const renameDisabled = resources.some((resource) => {
          return !resource.canRename()
        })
        return !renameDisabled
      },
      componentType: 'button',
      class: 'oc-files-actions-rename-trigger'
    }
  ])

  return {
    actions,
    // HACK: exported for unit tests:
    checkNewName,
    renameResource
  }
}
