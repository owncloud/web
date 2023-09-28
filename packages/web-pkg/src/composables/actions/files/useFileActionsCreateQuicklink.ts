import quickActions, { canShare } from '../../../quickActions'
import { createQuicklink } from '../../../helpers/share'
import { ShareStatus } from 'web-client/src/helpers/share'

import { isLocationSharesActive } from '../../../router'
import { computed } from 'vue'
import { useAbility } from '../../ability'
import { useClientService } from '../../clientService'
import { useRouter } from '../../router'
import { useStore } from '../../store'
import { useGettext } from 'vue3-gettext'
import { Store } from 'vuex'
import { FileAction, FileActionOptions } from '../types'

export const useFileActionsCreateQuickLink = ({ store }: { store?: Store<any> } = {}) => {
  store = store || useStore()
  const router = useRouter()
  const language = useGettext()
  const { $gettext } = language
  const ability = useAbility()
  const clientService = useClientService()

  const handler = async ({ space, resources }: FileActionOptions) => {
    const [resource] = resources
    await createQuicklink({
      clientService,
      resource,
      storageId: space?.id || resource?.fileId || resource?.id,
      store,
      language,
      ability
    })
  }

  const actions = computed((): FileAction[] => [
    {
      name: 'create-quicklink',
      icon: quickActions.quicklink.icon,
      iconFillType: quickActions.quicklink.iconFillType,
      label: () => $gettext('Copy link'),
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
