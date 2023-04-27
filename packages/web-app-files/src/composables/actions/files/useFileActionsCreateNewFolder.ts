import { Resource, extractNameWithoutExtension } from 'web-client/src/helpers'
import { Store } from 'vuex'
import { computed, unref } from 'vue'
import { useStore } from 'web-pkg/src/composables'
import { FileAction, FileActionOptions } from 'web-pkg/src/composables/actions'
import { useGettext } from 'vue3-gettext'
import { resolveFileNameDuplicate } from 'web-app-files/src/helpers/resource'

export const useFileActionsCreateNewFolder = ({ store }: { store?: Store<any> } = {}) => {
  store = store || useStore()
  const { $gettext } = useGettext()

  const files = computed((): Array<Resource> => store.getters['Files/files'])
  const areFileExtensionsShown = computed(
    (): boolean => store.getters['Files/areFileExtensionsShown']
  )

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

  const addNewFolder = async (folderName) => {
    /*folderName = folderName.trimEnd()

    try {
      const path = join(this.item, folderName)
      const resource = await (clientService.webdav as WebDAV).createFolder(this.space, {
        path
      })

      if (this.loadIndicatorsForNewFile) {
        resource.indicators = getIndicators({ resource, ancestorMetaData: this.ancestorMetaData })
      }

      this.UPSERT_RESOURCE(resource)
      this.hideModal()

      this.showMessage({
        title: this.$gettextInterpolate(
          this.$gettext('"%{folderName}" was created successfully'),
          {
            folderName
          }
        )
      })
    } catch (error) {
      console.error(error)
      this.showMessage({
        title: this.$gettext('Failed to create folder'),
        status: 'danger'
      })
    }*/
    // TODO
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
      defaultName = resolveFileNameDuplicate(defaultName, isFolder ? '' : ext, files)
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
      onCancel: store.dispatch('hideModal'),
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
