import { Store } from 'vuex'
import { computed, unref } from 'vue'
import { useGettext } from 'vue3-gettext'
import { FileAction, FileActionOptions } from 'web-pkg/src/composables/actions'
import {
  configurationManager,
  useAbility,
  useClientService,
  useLoadingService,
  useRouter
} from 'web-pkg'
import { buildSpace, isPersonalSpaceResource } from 'web-client/src/helpers'
import { isLocationSpacesActive } from 'web-app-files/src/router'
import { WebDAV } from 'web-client/src/webdav'
import { Drive } from 'web-client/src/generated'

export const useFileActionsCreateSpaceFromResource = ({ store }: { store?: Store<any> } = {}) => {
  const { can } = useAbility()
  const { $gettext, $ngettext } = useGettext()
  const loadingService = useLoadingService()
  const router = useRouter()
  const clientService = useClientService()
  const hasCreatePermission = computed(() => can('create-all', 'Space'))

  const confirmAction = async ({ spaceName, resources, space }) => {
    store.dispatch('hideModal')
    const client = clientService.graphAuthenticated

    try {
      const { data: createdSpace } = await client.drives.createDrive({ name: spaceName }, {})
      const spaceResource = buildSpace({
        ...createdSpace,
        serverUrl: configurationManager.serverUrl
      })
      store.commit('runtime/spaces/UPSERT_SPACE', spaceResource)

      await (clientService.webdav as WebDAV).createFolder(spaceResource, { path: '.space' })
      const markdown = await (clientService.webdav as WebDAV).putFileContents(spaceResource, {
        path: '.space/readme.md',
        content: $gettext('Here you can add a description for this Space.')
      })

      const { data: updatedSpace } = await client.drives.updateDrive(
        createdSpace.id,
        {
          special: [
            {
              specialFolder: {
                name: 'readme'
              },
              id: markdown.id as string
            }
          ]
        } as Drive,
        {}
      )
      store.commit('runtime/spaces/UPDATE_SPACE_FIELD', {
        id: createdSpace.id,
        field: 'spaceReadmeData',
        value: updatedSpace.special.find((special) => special.specialFolder.name === 'readme')
      })
      store.commit('runtime/spaces/UPDATE_SPACE_FIELD', {
        id: createdSpace.id,
        field: 'spaceQuota',
        value: updatedSpace.quota
      })

      store.dispatch('showMessage', {
        title: $gettext('Space was created successfully')
      })
    } catch (error) {
      console.error(error)
      store.dispatch('showMessage', {
        title: $gettext('Creating space failed…'),
        status: 'danger'
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
        'Create Space with the content of "%{resourceName}". The content will be copied',
        'Create Space with the selected files. The content will be copied',
        resources.length,
        {
          resourceName: resources[0].name
        }
      ),
      cancelText: $gettext('Cancel'),
      confirmText: $gettext('Create'),
      hasInput: true,
      inputLabel: $gettext('Space name'),
      onInput: checkSpaceName,
      onCancel: () => store.dispatch('hideModal'),
      onConfirm: (spaceName) =>
        loadingService.addTask(() => confirmAction({ spaceName, space, resources }))
    }

    store.dispatch('createModal', modal)
  }

  const checkSpaceName = (name) => {
    if (name.trim() === '') {
      return store.dispatch('setModalInputErrorMessage', $gettext('Space name cannot be empty'))
    }
    if (name.length > 255) {
      return store.dispatch(
        'setModalInputErrorMessage',
        $gettext('Space name cannot exceed 255 characters')
      )
    }
    if (/[/\\.:?*"><|]/.test(name)) {
      return store.dispatch(
        'setModalInputErrorMessage',
        $gettext('Space name cannot contain the following characters: / \\\\ . : ? * " > < |\'')
      )
    }
    store.dispatch('setModalInputErrorMessage', null)
  }

  const actions = computed((): FileAction[] => {
    return [
      {
        name: 'create-space-from-resource',
        icon: 'layout-grid',
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
