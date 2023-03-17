import { DateTime } from 'luxon'
import { LinkShareRoles, Share } from 'web-client/src/helpers/share'
import { Store } from 'vuex'
import { ClientService } from 'web-pkg/src/services'
import { useClipboard } from '@vueuse/core'
import { Ability } from 'web-pkg'
import { Resource } from 'web-client'
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

export const createQuicklink = async (args: CreateQuicklink): Promise<Share> => {
  const { clientService, resource, store, password, language, ability } = args
  const { $gettext } = language

  const canCreatePublicLink = ability.can('create-all', 'PublicLink')
  const allowResharing = store.state.user.capabilities.files_sharing?.resharing
  const capabilitiesRoleName =
    store.state.user.capabilities.files_sharing?.quick_link?.default_role || 'viewer'
  const canEdit = store.state.user.capabilities.files_sharing?.public?.can_edit || false
  const canContribute = store.state.user.capabilities.files_sharing?.public?.can_contribute || false
  const alias = store.state.user.capabilities.files_sharing?.public?.alias
  const roleName = !canCreatePublicLink ? 'none' : capabilitiesRoleName || 'viewer'
  const permissions = LinkShareRoles.getByName(
    roleName,
    resource.isFolder,
    canEdit,
    canContribute,
    alias
  ).bitmask(allowResharing)
  const params: { [key: string]: unknown } = {
    name: $gettext('Quicklink'),
    permissions,
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

  const link = await store.dispatch('Files/addLink', {
    path: resource.path,
    client: clientService.owncloudSdk,
    params,
    storageId: resource.fileId || resource.id
  })

  const { copy } = useClipboard({ legacy: true })
  copy(link.url)

  await store.dispatch('showMessage', {
    title: $gettext('The quicklink has been copied to your clipboard.')
  })

  return link
}
