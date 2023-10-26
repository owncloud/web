import { DateTime } from 'luxon'
import {
  LinkShareRoles,
  Share,
  linkRoleInternalFolder,
  linkRoleViewerFolder,
  ShareTypes,
  buildShare
} from '@ownclouders/web-client/src/helpers/share'
import { Store } from 'vuex'
import { ClientService, PasswordPolicyService } from '../../services'
import { useClipboard } from '@vueuse/core'
import { Ability } from '@ownclouders/web-client/src/helpers/resource/types'
import { Resource } from '@ownclouders/web-client'
import { Language } from 'vue3-gettext'
import { unref } from 'vue'
import { showQuickLinkPasswordModal } from '../../quickActions'

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

// doCopy creates the requested link and copies the url to the clipboard,
// the copy action uses the clipboard // clipboardItem api to work around the webkit limitations.
//
// https://developer.apple.com/forums/thread/691873
//
// if those apis not available (or like in firefox behind dom.events.asyncClipboard.clipboardItem)
// it has a fallback to the vue-use implementation.
//
// https://webkit.org/blog/10855/
const copyToClipboard = async (quickLinkUrl: string) => {
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
  const { store, language, resource, clientService, passwordPolicyService } = args
  const { $gettext } = language

  const linkSharesForResource = await clientService.owncloudSdk.shares.getShares(resource.path, {
    share_types: ShareTypes?.link?.value?.toString(),
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

  if (unref(isPasswordEnforced)) {
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

export const createQuicklink = async (args: CreateQuicklink): Promise<Share> => {
  const { clientService, resource, store, password, language, ability } = args
  const { $gettext } = language

  const canCreatePublicLink = ability.can('create-all', 'PublicLink')
  const allowResharing = store.state.user.capabilities.files_sharing?.resharing
  const capabilitiesRoleName =
    store.state.user.capabilities.files_sharing?.quick_link?.default_role ||
    linkRoleViewerFolder.name
  const canEdit = store.state.user.capabilities.files_sharing?.public?.can_edit || false
  const canContribute = store.state.user.capabilities.files_sharing?.public?.can_contribute || false
  const alias = store.state.user.capabilities.files_sharing?.public?.alias
  const roleName = !canCreatePublicLink
    ? linkRoleInternalFolder.name
    : capabilitiesRoleName || linkRoleViewerFolder.name
  const permissions = LinkShareRoles.getByName(
    roleName,
    resource.isFolder,
    canEdit,
    canContribute,
    alias
  ).bitmask(allowResharing)
  const params: {
    [key: string]: unknown
  } = {
    name: $gettext('Link'),
    permissions: permissions.toString(),
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
