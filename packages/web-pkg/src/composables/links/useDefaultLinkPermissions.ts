import { computed } from 'vue'
import { useStore } from '../store'
import { useAbility } from '../ability'
import { getDefaultLinkPermissions } from '../../helpers/share/link'

export const useDefaultLinkPermissions = () => {
  const store = useStore()
  const ability = useAbility()

  const defaultLinkPermissions = computed(() => getDefaultLinkPermissions({ store, ability }))

  return { defaultLinkPermissions }
}
