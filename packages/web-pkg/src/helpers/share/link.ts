import { DateTime } from 'luxon'
import { SharePermissionBit } from '@ownclouders/web-client/src/helpers/share'
import { Store } from 'vuex'
import { Ability } from '@ownclouders/web-client/src/helpers/resource/types'
import { getLocaleFromLanguage } from '../locale'
import { PublicExpirationCapability } from '@ownclouders/web-client/src/ocs/capabilities'

// TODO: move to useDefaultLinkPermissions composable
export const getDefaultLinkPermissions = ({
  ability,
  store
}: {
  ability: Ability
  store: Store<any>
}) => {
  const canCreatePublicLink = ability.can('create-all', 'PublicLink')
  if (!canCreatePublicLink) {
    return SharePermissionBit.Internal
  }

  let defaultPermissions: number =
    store.state.user.capabilities.files_sharing?.public?.default_permissions
  if (defaultPermissions === undefined) {
    defaultPermissions = SharePermissionBit.Read
  }

  return defaultPermissions
}

// TODO: move to useExpirationRules composable
export type ExpirationRules = { enforced: boolean; default: DateTime; min: DateTime; max: DateTime }

export const getExpirationRules = ({
  store,
  currentLanguage
}: {
  store: Store<any>
  currentLanguage: string
}): ExpirationRules => {
  const expireDate: PublicExpirationCapability =
    store.getters.capabilities.files_sharing.public.expire_date

  let defaultExpireDate: DateTime = null
  let maxExpireDateFromCaps: DateTime = null

  if (expireDate.days) {
    const days = parseInt(expireDate.days)
    defaultExpireDate = DateTime.now()
      .setLocale(getLocaleFromLanguage(currentLanguage))
      .plus({ days })
      .toJSDate()
  }

  if (expireDate.enforced) {
    const days = parseInt(expireDate.days)
    maxExpireDateFromCaps = DateTime.now()
      .setLocale(getLocaleFromLanguage(currentLanguage))
      .plus({ days })
      .toJSDate()
  }

  return {
    enforced: expireDate.enforced,
    default: defaultExpireDate,
    min: DateTime.now().setLocale(getLocaleFromLanguage(currentLanguage)).toJSDate(),
    max: maxExpireDateFromCaps
  }
}
