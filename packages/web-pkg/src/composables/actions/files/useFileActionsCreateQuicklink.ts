import { copyQuicklink } from '../../../helpers/share'
import { ShareStatus } from '@ownclouders/web-client/src/helpers/share'

import { isLocationSharesActive } from '../../../router'
import { computed } from 'vue'
import { useAbility } from '../../ability'
import { useClientService } from '../../clientService'
import { useRouter } from '../../router'
import { useStore } from '../../store'
import { useGettext } from 'vue3-gettext'
import { Store } from 'vuex'
import { FileAction, FileActionOptions } from '../types'
import { usePasswordPolicyService } from '../../passwordPolicyService'
import { useCanShare } from '../../shares'

export const useFileActionsCreateQuickLink = ({
  store
}: {
  store?: Store<any>
} = {}) => {
  store = store || useStore()
  const router = useRouter()
  const language = useGettext()
  const { $gettext } = language
  const ability = useAbility()
  const clientService = useClientService()
  const passwordPolicyService = usePasswordPolicyService()
  const { canShare } = useCanShare()

  const handler = async ({ space, resources }: FileActionOptions) => {
    const [resource] = resources

    await copyQuicklink({
      clientService,
      passwordPolicyService,
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
      icon: 'link',
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
        return canShare(resources[0])
      },
      componentType: 'button',
      class: 'oc-files-actions-create-quicklink-trigger'
    }
  ])

  return {
    actions
  }
}
