import { computed, unref } from 'vue'
import { useAbility } from '../ability'
import { getDefaultLinkPermissions } from '../../helpers/share/link'
import { useCapabilityFilesSharingPublicDefaultPermissions } from '../capability'

export const useDefaultLinkPermissions = () => {
  const ability = useAbility()
  const defaultPermissionsCapability = useCapabilityFilesSharingPublicDefaultPermissions()

  const defaultLinkPermissions = computed(() =>
    getDefaultLinkPermissions({
      ability,
      defaultPermissionsCapability: unref(defaultPermissionsCapability)
    })
  )

  return { defaultLinkPermissions }
}
