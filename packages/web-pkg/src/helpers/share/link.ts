import { DateTime } from 'luxon'
import {
  Share,
  ShareTypes,
  buildShare,
  SharePermissionBit
} from '@ownclouders/web-client/src/helpers/share'
import { Store } from 'vuex'
import { ClientService, PasswordPolicyService } from '../../services'
import { useClipboard } from '@vueuse/core'
import { Ability } from '@ownclouders/web-client/src/helpers/resource/types'
import { Resource } from '@ownclouders/web-client'
import { Language } from 'vue3-gettext'
import { unref } from 'vue'
import { getLocaleFromLanguage } from '../locale'
import { PublicExpirationCapability } from '@ownclouders/web-client/src/ocs/capabilities'

export interface CreateQuicklink {
  clientService: ClientService
  language: Language
  store: Store<any>
  storageId?: any
  resource: Resource
  password?: string
  ability: Ability
}

export interface CopyQuickLink extends CreateQuicklink {
  passwordPolicyService: PasswordPolicyService
}

export function showQuickLinkPasswordModal({ $gettext, store, passwordPolicyService }, onConfirm) {
  const modal = {
    variation: 'passive',
    title: $gettext('Set password'),
    cancelText: $gettext('Cancel'),
    confirmText: $gettext('Set'),
    hasInput: true,
    inputDescription: $gettext('Passwords for links are required.'),
    inputPasswordPolicy: passwordPolicyService.getPolicy(),
    inputGeneratePasswordMethod: () => passwordPolicyService.generatePassword(),
    inputLabel: $gettext('Password'),
    inputType: 'password',
    onInput: () => store.dispatch('setModalInputErrorMessage', ''),
    onPasswordChallengeCompleted: () => store.dispatch('setModalConfirmButtonDisabled', false),
    onPasswordChallengeFailed: () => store.dispatch('setModalConfirmButtonDisabled', true),
    onCancel: () => store.dispatch('hideModal'),
    onConfirm: async (password) => {
      onConfirm(password)
    }
  }

  return store.dispatch('createModal', modal)
}

// doCopy creates the requested link and copies the url to the clipboard,
// the copy action uses the clipboard // clipboardItem api to work around the webkit limitations.
//
// https://developer.apple.com/forums/thread/691873
//
// if those apis not available (or like in firefox behind dom.events.asyncClipboard.clipboardItem)
// it has a fallback to the vue-use implementation.
//
// https://webkit.org/blog/10855/
const copyToClipboard = (quickLinkUrl: string) => {
  if (typeof ClipboardItem && navigator?.clipboard?.write) {
    return navigator.clipboard.write([
      new ClipboardItem({
        'text/plain': new Blob([quickLinkUrl], { type: 'text/plain' })
      })
    ])
  } else {
    const { copy } = useClipboard({ legacy: true })
    return copy(quickLinkUrl)
  }
}
export const copyQuicklink = async (args: CopyQuickLink) => {
  const { ability, store, language, resource, clientService, passwordPolicyService } = args
  const { $gettext } = language

  const linkSharesForResource = await clientService.owncloudSdk.shares.getShares(resource.path, {
    share_types: ShareTypes?.link?.value?.toString(),
    spaceRef: `${resource.storageId}!${resource.nodeId}`,
    include_tags: false
  })

  const existingQuickLink = linkSharesForResource
    .map((share: any) => buildShare(share.shareInfo, null, null))
    .find((share: Share) => share.quicklink === true)

  if (existingQuickLink) {
    try {
      await copyToClipboard(existingQuickLink.url)
      return store.dispatch('showMessage', {
        title: $gettext('The link has been copied to your clipboard.')
      })
    } catch (e) {
      console.error(e)
      return store.dispatch('showErrorMessage', {
        title: $gettext('Copy link failed'),
        error: e
      })
    }
  }

  const isPasswordEnforced =
    store.getters.capabilities?.files_sharing?.public?.password?.enforced_for?.read_only === true

  const permissions = getDefaultLinkPermissions({ ability, store })

  if (unref(isPasswordEnforced) && permissions > SharePermissionBit.Internal) {
    return showQuickLinkPasswordModal(
      { $gettext, store, passwordPolicyService },
      async (password: string) => {
        try {
          const quickLink = await createQuicklink({ ...args, password })
          await store.dispatch('hideModal')
          await copyToClipboard(quickLink.url)
          return store.dispatch('showMessage', {
            title: $gettext('The link has been copied to your clipboard.')
          })
        } catch (e) {
          console.log(e)

          // Human-readable error message is provided, for example when password is on banned list
          if (e.statusCode === 400) {
            return store.dispatch('setModalInputErrorMessage', $gettext(e.message))
          }

          return store.dispatch('showErrorMessage', {
            title: $gettext('Copy link failed'),
            error: e
          })
        }
      }
    )
  }

  try {
    const quickLink = await createQuicklink(args)
    await copyToClipboard(quickLink.url)
    return store.dispatch('showMessage', {
      title: $gettext('The link has been copied to your clipboard.')
    })
  } catch (e) {
    console.error(e)
    return store.dispatch('showErrorMessage', {
      title: $gettext('Copy link failed'),
      error: e
    })
  }
}

export const createQuicklink = (args: CreateQuicklink): Promise<Share> => {
  const { clientService, resource, store, password, language, ability } = args
  const { $gettext } = language

  const params: Record<string, unknown> = {
    name: $gettext('Link'),
    permissions: getDefaultLinkPermissions({ ability, store }).toString(),
    quicklink: true
  }

  if (password) {
    params.password = password
  }

  const expirationDate = store.state.user.capabilities.files_sharing.public.expire_date

  if (expirationDate.enforced) {
    params.expireDate = DateTime.now()
      .plus({ days: parseInt(expirationDate.days, 10) })
      .endOf('day')
      .toISO()
  }

  // needs check for enforced password for default role (viewer?)
  // and concept to what happens if it is enforced

  params.spaceRef = resource.fileId || resource.id

  return store.dispatch('Files/addLink', {
    path: resource.path,
    client: clientService.owncloudSdk,
    params,
    storageId: resource.fileId || resource.id
  })
}

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
