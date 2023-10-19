import { DateTime } from 'luxon'
import {
  LinkShareRoles,
  Share,
  linkRoleInternalFolder,
  linkRoleViewerFolder
} from '@ownclouders/web-client/src/helpers/share'
import { Store } from 'vuex'
import { ClientService } from '../../services'
import { useClipboard } from '@vueuse/core'
import { Ability } from '@ownclouders/web-client/src/helpers/resource/types'
import { Resource } from '@ownclouders/web-client'
import { Language } from 'vue3-gettext'

export interface CreateQuicklink {
  clientService: ClientService
  language: Language
  store: Store<any>
  storageId?: any
  resource: Resource
  password?: string
  ability: Ability
}

export const copyQuicklink = async (args: CreateQuicklink) => {
  const { store, language } = args
  const { $gettext } = language

  // doCopy creates the requested link and copies the url to the clipboard,
  // the copy action uses the clipboard // clipboardItem api to work around the webkit limitations.
  //
  // https://developer.apple.com/forums/thread/691873
  //
  // if those apis not available (or like in firefox behind dom.events.asyncClipboard.clipboardItem)
  // it has a fallback to the vue-use implementation.
  //
  // https://webkit.org/blog/10855/
  const doCopy = async () => {
    if (typeof ClipboardItem && navigator && navigator.clipboard && navigator.clipboard.write) {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/plain': createQuicklink(args).then(
            (link) => new Blob([link.url], { type: 'text/plain' })
          )
        })
      ])
    } else {
      const link = await createQuicklink(args)
      const { copy } = useClipboard({ legacy: true })
      await copy(link.url)
    }
  }

  try {
    await doCopy()
    await store.dispatch('showMessage', {
      title: $gettext('The link has been copied to your clipboard.')
    })
  } catch (e) {
    console.error(e)
    await store.dispatch('showErrorMessage', {
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
  const params: { [key: string]: unknown } = {
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
