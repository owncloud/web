import { Store } from 'vuex'
import { computed } from 'vue'
import { useGettext } from 'vue3-gettext'
import { FileAction, FileActionOptions } from '../../actions'
import { CreateLinkModal } from '../../../components'
import { useAbility } from '../../ability'
import { isProjectSpaceResource } from '@ownclouders/web-client/src/helpers'

export const useFileActionsCreateLink = ({ store }: { store?: Store<any> } = {}) => {
  const { $gettext, $ngettext } = useGettext()
  const ability = useAbility()

  const handler = ({ resources }: FileActionOptions) => {
    const modal = {
      variation: 'passive',
      title: $ngettext(
        'Create link for "%{resourceName}"',
        'Create links for the selected items',
        resources.length,
        { resourceName: resources[0].name }
      ),
      customComponent: CreateLinkModal,
      customComponentAttrs: { resources },
      hideActions: true
    }

    store.dispatch('createModal', modal)
  }

  const actions = computed((): FileAction[] => {
    return [
      {
        name: 'create-links',
        icon: 'link',
        handler,
        label: () => {
          return $gettext('Create links')
        },
        isEnabled: ({ resources }) => {
          if (!resources.length) {
            return false
          }

          for (const resource of resources) {
            if (!resource.canShare({ user: store.getters.user, ability })) {
              return false
            }

            if (isProjectSpaceResource(resource) && resource.disabled) {
              return false
            }
          }

          return true
        },
        componentType: 'button',
        class: 'oc-files-actions-create-links'
      }
    ]
  })

  return {
    actions
  }
}
