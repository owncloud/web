import { Resource, extractNameWithoutExtension } from 'web-client/src/helpers'
import { Store } from 'vuex'
import { computed, ref, unref } from 'vue'
import { useClientService, useRequest, useRouter, useStore } from 'web-pkg/src/composables'
import { FileAction } from 'web-pkg/src/composables/actions'
import { useGettext } from 'vue3-gettext'
import { resolveFileNameDuplicate } from 'web-app-files/src/helpers/resource'
import { join } from 'path'
import { WebDAV } from 'web-client/src/webdav'
import { isLocationSpacesActive } from 'web-app-files/src/router'
import { getIndicators } from 'web-app-files/src/helpers/statusIndicators'
import { EDITOR_MODE_CREATE, useFileActions } from './useFileActions'
import { urlJoin } from 'web-client/src/utils'
import { configurationManager } from 'web-pkg/src'
import { stringify } from 'qs'

export const useFileActionsCreateNewFile = ({
  store,
  openAction,
  addAppProviderFile,
  extension
}: {
  store?: Store<any>
  openAction?: any
  addAppProviderFile?: boolean
  extension?: string
} = {}) => {
  store = store || useStore()
  const router = useRouter()
  const { $gettext } = useGettext()
  const { makeRequest } = useRequest()

  const { openEditor, triggerDefaultAction } = useFileActions()
  const clientService = useClientService()
  const currentFolder = computed((): Resource => store.getters['Files/currentFolder'])
  const files = computed((): Array<Resource> => store.getters['Files/files'])
  const ancestorMetaData = computed(() => store.getters['Files/ancestorMetaData'])
  const areFileExtensionsShown = computed(
    (): boolean => store.getters['Files/areFileExtensionsShown']
  )
  const storageId = computed(() => unref(currentFolder).storageId)
  const currentSpace = computed(() =>
    store.getters['runtime/spaces/spaces'].find((space) => space.id === unref(storageId))
  )
  const newFileAction = ref(null)

  const capabilities = computed(() => store.getters['capabilities'])

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

  const addAppProviderFileFunc = async (fileName) => {
    // FIXME: this belongs in web-app-external, but the app provider handles file creation differently than other editor extensions. Needs more refactoring.
    if (fileName === '') {
      return
    }
    try {
      const baseUrl = urlJoin(
        configurationManager.serverUrl,
        unref(capabilities).files.app_providers[0].new_url
      )
      const query = stringify({
        parent_container_id: unref(currentFolder).fileId,
        filename: fileName
      })
      const url = `${baseUrl}?${query}`
      const response = await makeRequest('POST', url)
      if (response.status !== 200) {
        throw new Error(`An error has occurred: ${response.status}`)
      }
      const path = join(unref(currentFolder).path, fileName) || ''
      const resource = await (clientService.webdav as WebDAV).getFileInfo(unref(currentSpace), {
        path
      })
      if (unref(loadIndicatorsForNewFile)) {
        resource.indicators = getIndicators({ resource, ancestorMetaData: unref(ancestorMetaData) })
      }
      triggerDefaultAction({ space: unref(currentSpace), resources: [resource] })
      store.commit('Files/UPSERT_RESOURCE', resource)
      store.dispatch('hideModal')
      store.dispatch('showMessage', {
        title: $gettext('"%{fileName}" was created successfully', { fileName })
      })
    } catch (error) {
      console.error(error)
      store.dispatch('showMessage', {
        title: $gettext('Failed to create file'),
        status: 'danger'
      })
    }
  }

  const loadIndicatorsForNewFile = computed(() => {
    return (
      isLocationSpacesActive(router, 'files-spaces-projects') &&
      unref(currentSpace).driveType !== 'share'
    )
  })

  const addNewFile = async (fileName) => {
    if (fileName === '') {
      return
    }

    try {
      const path = join(unref(currentFolder).path, fileName)
      const resource = await (clientService.webdav as WebDAV).putFileContents(unref(currentSpace), {
        path
      })

      if (loadIndicatorsForNewFile) {
        resource.indicators = getIndicators({ resource, ancestorMetaData: unref(ancestorMetaData) })
      }

      store.commit('Files/UPSERT_RESOURCE', resource)

      if (unref(newFileAction)) {
        openEditor(
          unref(newFileAction),
          unref(currentSpace).getDriveAliasAndItem(resource),
          resource.webDavPath,
          resource.fileId,
          EDITOR_MODE_CREATE
        )
        store.dispatch('hideModal')

        return
      }

      store.dispatch('hideModal')
      store.dispatch('showMessage', {
        title: $gettext('"%{fileName}" was created successfully', { fileName })
      })
    } catch (error) {
      console.error(error)
      store.dispatch('showMessage', {
        title: $gettext('Failed to create file'),
        status: 'danger'
      })
    }
  }

  const handler = () => {
    const checkInputValue = (value) => {
      store.dispatch(
        'setModalInputErrorMessage',
        checkNewFileName(areFileExtensionsShown ? value : `${value}.${extension}`)
      )
    }
    let defaultName = $gettext('New file') + `.${extension}`

    if (unref(files).some((f) => f.name === defaultName)) {
      defaultName = resolveFileNameDuplicate(defaultName, extension, unref(files))
    }

    if (!areFileExtensionsShown) {
      defaultName = extractNameWithoutExtension({ name: defaultName, extension } as any)
    }

    // Sets action to be executed after creation of the file
    newFileAction.value = openAction

    const inputSelectionRange = !areFileExtensionsShown
      ? null
      : [0, defaultName.length - (extension.length + 1)]

    const modal = {
      variation: 'passive',
      title: $gettext('Create a new file'),
      cancelText: $gettext('Cancel'),
      confirmText: $gettext('Create'),
      hasInput: true,
      inputValue: defaultName,
      inputLabel: $gettext('File name'),
      inputError: checkNewFileName(
        areFileExtensionsShown ? defaultName : `${defaultName}.${extension}`
      ),
      inputSelectionRange,
      onCancel: () => store.dispatch('hideModal'),
      onConfirm: addAppProviderFile
        ? addAppProviderFileFunc
        : (fileName) => {
            if (!areFileExtensionsShown) {
              fileName = `${fileName}.${extension}`
            }
            addNewFile(fileName)
          },
      onInput: checkInputValue
    }

    store.dispatch('createModal', modal)
  }

  const actions = computed((): FileAction[] => {
    return [
      {
        name: 'create-new-file',
        icon: 'add',
        handler,
        label: () => {
          return $gettext('Create new File')
        },
        isEnabled: ({ resources }) => {
          return true
        },
        canBeDefault: true,
        componentType: 'button',
        class: 'oc-files-actions-create-new-file'
      }
    ]
  })

  return {
    actions
  }
}
