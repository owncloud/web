import quickActions, { canShare } from '../../quickActions'
import { createQuicklink } from '../../helpers/share'
import { ShareStatus } from 'web-client/src/helpers/share'

import { isLocationSharesActive } from '../../router'
import { computed } from 'vue'
import { useAbility, useRouter, useStore } from 'web-pkg/src/composables'
import { useGettext } from 'vue3-gettext'
import { Store } from 'vuex'
import { Action } from 'web-pkg/src/composables/actions'

export const useCreateQuickLink = ({ store }: { store?: Store<any> } = {}) => {
  store = store || useStore()
  const router = useRouter()
  const { $gettext } = useGettext()
  const ability = useAbility()

  const handler = async ({ space, resources }) => {
    const [resource] = resources
    await createQuicklink({
      resource,
      storageId: space?.id || resource?.fileId || resource?.id,
      store,
      $gettext,
      ability
    })
  }

  const actions = computed((): Action[] => [
    {
      name: 'create-quicklink',
      icon: quickActions.quicklink.icon,
      iconFillType: quickActions.quicklink.iconFillType,
      label: () => $gettext('Copy quicklink'),
      handler,
      isEnabled: ({ resources }) => {
        if (resources.length !== 1) {
          return false
        }
        if (isLocationSharesActive(router, 'files-shares-with-me')) {
          if (resources[0].status !== ShareStatus.accepted) {
            return false
          }
        }
        return canShare(resources[0], store)
      },
      componentType: 'button',
      class: 'oc-files-actions-create-quicklink-trigger'
    }
  ])

  return {
    actions
  }
}
