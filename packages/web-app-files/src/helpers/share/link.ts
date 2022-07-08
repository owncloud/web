import { DateTime } from 'luxon'
import { Share } from './share'
import { Store } from 'vuex'
import { clientService } from 'web-pkg/src/services'
import copyToClipboard from 'copy-to-clipboard'

const $gettext = (str) => {
  return str
}

interface CreateQuicklink {
  store: Store<any>
  storageId?: any
  resource: any
  password?: string
}

export const createQuicklink = async (args: CreateQuicklink): Promise<Share> => {
  const params: { [key: string]: unknown } = {
    name: $gettext('Quicklink'),
    permissions: 1,
    quicklink: true
  }

  if (args.password) {
    params.password = args.password
  }

  const { storageId, resource, store } = args
  const expirationDate = store.state.user.capabilities.files_sharing.public.expire_date

  if (expirationDate.enforced) {
    params.expireDate = DateTime.now()
      .plus({ days: parseInt(expirationDate.days, 10) })
      .endOf('day')
      .toISO()
  }

  // needs check for enforced password for default role (viewer?)
  // and concept to what happens if it is enforced

  if (storageId) {
    params.spaceRef = `${storageId}${resource.path}`
  }

  const link = await store.dispatch('Files/addLink', {
    path: resource.path,
    client: clientService.owncloudSdk,
    params,
    storageId
  })

  copyToClipboard(link.url)

  await store.dispatch('showMessage', {
    title: $gettext('Quicklink copied into your clipboard')
  })

  return link
}
