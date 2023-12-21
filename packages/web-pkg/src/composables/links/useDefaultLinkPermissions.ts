import { computed } from 'vue'
import { useAbility } from '../ability'
import { getDefaultLinkPermissions } from '../../helpers/share/link'
import { useCapabilityStore } from '../piniaStores'

export const useDefaultLinkPermissions = () => {
  const capabilityStore = useCapabilityStore()
  const ability = useAbility()

  const defaultLinkPermissions = computed(() =>
    getDefaultLinkPermissions({
      ability,
      defaultPermissionsCapability: capabilityStore.sharingPublicDefaultPermissions
    })
  )

  return { defaultLinkPermissions }
}
