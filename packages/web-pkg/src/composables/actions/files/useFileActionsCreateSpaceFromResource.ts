import { Store } from 'vuex'
import { computed, unref } from 'vue'
import { useGettext } from 'vue3-gettext'
import { FileAction, FileActionOptions } from 'web-pkg/src/composables/actions'
import { useAbility, useClientService, useLoadingService, useRouter } from 'web-pkg/src/composables'
import { isPersonalSpaceResource } from 'web-client/src/helpers'
import { isLocationSpacesActive } from 'web-pkg/src/router'
import { useCreateSpace, useSpaceHelpers } from 'web-pkg/src/composables/spaces'
import PQueue from 'p-queue'

export const useFileActionsCreateSpaceFromResource = ({ store }: { store?: Store<any> } = {}) => {
  const { can } = useAbility()
  const { $gettext, $ngettext } = useGettext()
  const loadingService = useLoadingService()
  const { createSpace } = useCreateSpace()
  const { checkSpaceNameModalInput } = useSpaceHelpers()
  const clientService = useClientService()
  const router = useRouter()
  const hasCreatePermission = computed(() => can('create-all', 'Drive'))

  const confirmAction = async ({ spaceName, resources, space }) => {
    const { webdav } = clientService
    store.dispatch('hideModal')
    const queue = new PQueue({ concurrency: 4 })
    const copyOps = []

    try {
      const createdSpace = await createSpace(spaceName)
      store.commit('runtime/spaces/UPSERT_SPACE', createdSpace)

      if (resources.length === 1 && resources[0].isFolder) {
        //If a single folder is selected we copy it's content to the Space's root folder
        resources = (await webdav.listFiles(space, { path: resources[0].path })).children
      }

      for (const resource of resources) {
        copyOps.push(
          queue.add(() => webdav.copyFiles(space, resource, createdSpace, { path: resource.name }))
        )
      }

      await Promise.all(copyOps)
      store.dispatch('Files/resetFileSelection')
      store.dispatch('showMessage', {
        title: $gettext('Space was created successfully')
      })
    } catch (error) {
      console.error(error)
      store.dispatch('showErrorMessage', {
        title: $gettext('Creating space failed…'),
        error
      })
    }
  }
  const handler = ({ resources, space }: FileActionOptions) => {
    const modal = {
      variation: 'passive',
      title: $ngettext(
        'Create Space from "%{resourceName}"',
        'Create Space from selection',
        resources.length,
        {
          resourceName: resources[0].name
        }
      ),
      message: $ngettext(
        'Create Space with the content of "%{resourceName}".',
        'Create Space with the selected files.',
        resources.length,
        {
          resourceName: resources[0].name
        }
      ),
      contextualHelperLabel: $gettext('The marked elements will be copied.'),
      contextualHelperData: {
        title: $gettext('Restrictions'),
        text: $gettext('Shares, versions and tags will not be copied.')
      },
      cancelText: $gettext('Cancel'),
      confirmText: $gettext('Create'),
      hasInput: true,
      inputLabel: $gettext('Space name'),
      onInput: checkSpaceNameModalInput,
      onCancel: () => store.dispatch('hideModal'),
      onConfirm: (spaceName) =>
        loadingService.addTask(() => confirmAction({ spaceName, space, resources }))
    }

    store.dispatch('createModal', modal)
  }

  const actions = computed((): FileAction[] => {
    return [
      {
        name: 'create-space-from-resource',
        icon: 'function',
        handler,
        label: () => {
          return $gettext('Create Space from selection')
        },
        isEnabled: ({ resources, space }) => {
          if (!resources.length) {
            return false
          }

          if (!unref(hasCreatePermission)) {
            return false
          }

          if (
            !isLocationSpacesActive(router, 'files-spaces-generic') ||
            !isPersonalSpaceResource(space)
          ) {
            return false
          }

          return true
        },
        componentType: 'button',
        class: 'oc-files-actions-create-space-from-resource-trigger'
      }
    ]
  })

  return {
    actions
  }
}
