import { Resource, extractNameWithoutExtension } from 'web-client/src/helpers'
import { Store } from 'vuex'
import { computed, unref } from 'vue'
import { useClientService, useRouter, useStore } from 'web-pkg/src/composables'
import { FileAction, FileActionOptions } from 'web-pkg/src/composables/actions'
import { useGettext } from 'vue3-gettext'
import { resolveFileNameDuplicate } from 'web-app-files/src/helpers/resource'
import { join } from 'path'
import { WebDAV } from 'web-client/src/webdav'
import { isLocationSpacesActive } from 'web-app-files/src/router'
import { getIndicators } from 'web-app-files/src/helpers/statusIndicators'

export const useFileActionsCreateNewFolder = ({ store }: { store?: Store<any> } = {}) => {
  store = store || useStore()
  const router = useRouter()
  const { $gettext } = useGettext()

  const clientService = useClientService()
  const currentFolder = computed((): Resource => store.getters['Files/currentFolder'])
  const files = computed((): Array<Resource> => store.getters['Files/files'])
  const ancestorMetaData = computed(() => store.getters['Files/ancestorMetaData'])
  const areFileExtensionsShown = computed(
    (): boolean => store.getters['Files/areFileExtensionsShown']
  )

  const storageId = unref(currentFolder).storageId
  const currentSpace = store.getters['runtime/spaces/spaces'].find(
    (space) => space.id === storageId
  ) //TODO is this the way to replace this.space ( ͡° ͜ʖ ͡°)?

  const checkNewFolderName = (folderName) => {
    if (folderName.trim() === '') {
      return $gettext('Folder name cannot be empty')
    }

    if (/[/]/.test(folderName)) {
      return $gettext('Folder name cannot contain "/"')
    }

    if (folderName === '.') {
      return $gettext('Folder name cannot be equal to "."')
    }

    if (folderName === '..') {
      return $gettext('Folder name cannot be equal to ".."')
    }

    const exists = unref(files).find((file) => file.name === folderName)

    if (exists) {
      const translated = $gettext('%{name} already exists')
      return $gettext(translated, { name: folderName }, true)
    }

    return null
  }

  const checkNewFileName = (fileName) => {
    if (fileName === '') {
      return $gettext('File name cannot be empty')
    }

    if (/[/]/.test(fileName)) {
      return $gettext('File name cannot contain "/"')
    }

    if (fileName === '.') {
      return $gettext('File name cannot be equal to "."')
    }

    if (fileName === '..') {
      return $gettext('File name cannot be equal to ".."')
    }

    if (/\s+$/.test(fileName)) {
      return $gettext('File name cannot end with whitespace')
    }

    const exists = unref(files).find((file) => file.name === fileName)

    if (exists) {
      const translated = $gettext('%{name} already exists')
      return $gettext(translated, { name: fileName }, true)
    }

    return null
  }

  const addAppProviderFileFunc = async (fileName) => {}

  const loadIndicatorsForNewFile = computed(() => {
    return (
      isLocationSpacesActive(router, 'files-spaces-projects') && currentSpace.driveType !== 'share'
    )
  })

  const addNewFolder = async (folderName) => {
    folderName = folderName.trimEnd()

    try {
      const path = join(unref(currentFolder).path, folderName) // TODO: Why was this.item used here isn't it just the currentFolderPath?
      const resource = await (clientService.webdav as WebDAV).createFolder(currentSpace, {
        path
      })

      if (unref(loadIndicatorsForNewFile)) {
        resource.indicators = getIndicators({ resource, ancestorMetaData: unref(ancestorMetaData) })
      }

      store.commit('Files/UPSERT_RESOURCE', resource)
      store.dispatch('hideModal')

      store.dispatch('showMessage', {
        title: $gettext('"%{folderName}" was created successfully', { folderName })
      })
    } catch (error) {
      console.error(error)
      store.dispatch('showMessage', {
        title: $gettext('Failed to create folder'),
        status: 'danger'
      })
    }
  }

  const handler = ({ space, resources }: FileActionOptions) => {
    const checkInputValue = (value) => {
      /*this.setModalInputErrorMessage(
        isFolder
          ? this.checkNewFolderName(value)
          : this.checkNewFileName(this.areFileExtensionsShown ? value : `${value}.${ext}`) //TODO
      )*/
    }
    const addAppProviderFile = false
    const isFolder = true
    const ext = ''
    let defaultName = isFolder ? $gettext('New folder') : $gettext('New file') + `.${ext}`

    if (unref(files).some((f) => f.name === defaultName)) {
      defaultName = resolveFileNameDuplicate(defaultName, isFolder ? '' : ext, unref(files))
    }

    if (!areFileExtensionsShown) {
      defaultName = extractNameWithoutExtension({ name: defaultName, extension: ext } as any)
    }

    // Sets action to be executed after creation of the file
    if (!isFolder) {
      //this.newFileAction = openAction // TODO
    }

    const inputSelectionRange =
      isFolder || !areFileExtensionsShown ? null : [0, defaultName.length - (ext.length + 1)]

    const modal = {
      variation: 'passive',
      title: isFolder ? $gettext('Create a new folder') : $gettext('Create a new file'),
      cancelText: $gettext('Cancel'),
      confirmText: $gettext('Create'),
      hasInput: true,
      inputValue: defaultName,
      inputLabel: isFolder ? $gettext('Folder name') : $gettext('File name'),
      inputError: isFolder
        ? checkNewFolderName(defaultName)
        : checkNewFileName(areFileExtensionsShown ? defaultName : `${defaultName}.${ext}`),
      inputSelectionRange,
      onCancel: () => store.dispatch('hideModal'),
      onConfirm: isFolder
        ? addNewFolder
        : addAppProviderFile
        ? addAppProviderFileFunc
        : (fileName) => {
            /*if (!this.areFileExtensionsShown) {
              fileName = `${fileName}.${ext}`
            }
            this.addNewFile(fileName)*/
            //TODO
          },
      onInput: checkInputValue
    }

    store.dispatch('createModal', modal)
  }

  const actions = computed((): FileAction[] => {
    return [
      {
        name: 'create-folder',
        icon: 'add',
        handler,
        label: () => {
          return $gettext('Create new Folder')
        },
        isEnabled: ({ resources }) => {
          return true
        },
        canBeDefault: true,
        componentType: 'button',
        class: 'oc-files-actions-download-archive-trigger'
      }
    ]
  })

  return {
    actions
  }
}
