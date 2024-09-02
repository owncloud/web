import { SpaceResource, isShareSpaceResource } from '@ownclouders/web-client'
import { computed, nextTick, Ref, unref } from 'vue'
import { useClientService } from '../../clientService'
import { useRouter } from '../../router'
import { FileAction } from '../types'
import { useGettext } from 'vue3-gettext'
import { resolveFileNameDuplicate } from '../../../helpers/resource'
import { join } from 'path'
import { isLocationSpacesActive } from '../../../router'
import { getIndicators } from '../../../helpers/statusIndicators'
import { useScrollTo } from '../../scrollTo'
import {
  useMessages,
  useModals,
  useResourcesStore,
  useUserStore
} from '../../../composables/piniaStores'
import { storeToRefs } from 'pinia'

export const useFileActionsCreateNewFolder = ({ space }: { space?: Ref<SpaceResource> } = {}) => {
  const { showMessage, showErrorMessage } = useMessages()
  const router = useRouter()
  const { dispatchModal } = useModals()
  const { $gettext } = useGettext()
  const { scrollToResource } = useScrollTo()
  const userRoleStore = useUserStore()

  const resourcesStore = useResourcesStore()
  const { resources, currentFolder, ancestorMetaData } = storeToRefs(resourcesStore)

  const clientService = useClientService()

  const checkNewFolderName = (folderName: string, setError: (error: string) => void) => {
    if (folderName.trim() === '') {
      return setError($gettext('Folder name cannot be empty'))
    }

    if (/[/]/.test(folderName)) {
      return setError($gettext('Folder name cannot contain "/"'))
    }

    if (folderName === '.') {
      return setError($gettext('Folder name cannot be equal to "."'))
    }

    if (folderName === '..') {
      return setError($gettext('Folder name cannot be equal to ".."'))
    }

    const exists = unref(resources).find((file) => file.name === folderName)

    if (exists) {
      return setError($gettext('%{name} already exists', { name: folderName }, true))
    }

    return setError(null)
  }

  const loadIndicatorsForNewFile = computed(() => {
    return (
      isLocationSpacesActive(router, 'files-spaces-generic') && unref(space).driveType !== 'share'
    )
  })

  const addNewFolder = async (folderName: string) => {
    folderName = folderName.trimEnd()

    try {
      const path = join(unref(currentFolder).path, folderName)
      const resource = await clientService.webdav.createFolder(unref(space), { path })

      if (unref(loadIndicatorsForNewFile)) {
        resource.indicators = getIndicators({
          space: unref(space),
          resource,
          ancestorMetaData: unref(ancestorMetaData),
          user: userRoleStore.user
        })
      }

      // FIXME: move to buildResource as soon as it has space context
      if (isShareSpaceResource(unref(space))) {
        resource.remoteItemId = unref(space).id
      }

      resourcesStore.upsertResource(resource)

      showMessage({ title: $gettext('"%{folderName}" was created successfully', { folderName }) })

      await nextTick()
      scrollToResource(resource.id, { forceScroll: true, topbarElement: 'files-app-bar' })
    } catch (error) {
      console.error(error)
      showErrorMessage({
        title: $gettext('Failed to create folder'),
        errors: [error]
      })
    }
  }

  const handler = () => {
    let defaultName = $gettext('New folder')

    if (unref(resources).some((f) => f.name === defaultName)) {
      defaultName = resolveFileNameDuplicate(defaultName, '', unref(resources))
    }

    dispatchModal({
      title: $gettext('Create a new folder'),
      confirmText: $gettext('Create'),
      hasInput: true,
      inputValue: defaultName,
      inputLabel: $gettext('Folder name'),
      onConfirm: addNewFolder,
      onInput: checkNewFolderName
    })
  }

  const actions = computed((): FileAction[] => {
    return [
      {
        name: 'create-folder',
        icon: 'folder',
        handler,
        label: () => {
          return $gettext('New Folder')
        },
        isVisible: () => {
          return unref(currentFolder)?.canCreate()
        },
        class: 'oc-files-actions-create-new-folder'
      }
    ]
  })

  return {
    actions,
    checkNewFolderName,
    addNewFolder
  }
}
