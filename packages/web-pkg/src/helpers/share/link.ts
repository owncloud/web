import { DateTime } from 'luxon'
import { CapabilityStore } from '../../composables'

// TODO: move to useExpirationRules composable
export type ExpirationRules = { enforced: boolean; default: DateTime; min: DateTime; max: DateTime }

export const getExpirationRules = ({
  capabilityStore,
  currentLanguage
}: {
  capabilityStore: CapabilityStore
  currentLanguage: string
}): ExpirationRules => {
  const expireDate = capabilityStore.sharingPublicExpireDate

  let defaultExpireDate: DateTime = null
  let maxExpireDateFromCaps: DateTime = null

  if (expireDate.days) {
    const days = parseInt(expireDate.days)
    defaultExpireDate = DateTime.now().plus({ days }).endOf('day')
  }

  if (expireDate.enforced) {
    const days = parseInt(expireDate.days)
    maxExpireDateFromCaps = DateTime.now().plus({ days }).endOf('day')
  }

  return {
    enforced: expireDate.enforced,
    default: defaultExpireDate,
    min: DateTime.now().endOf('day'),
    max: maxExpireDateFromCaps
  }
}
