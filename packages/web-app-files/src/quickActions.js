import { DateTime } from 'luxon'
import copyToClipboard from 'copy-to-clipboard'

export function createPublicLink(ctx) {
  // FIXME: Translate name
  const params = { name: ctx.$gettext('Quick action link'), permissions: 1 }
  const capabilities = ctx.store.state.user.capabilities
  const expirationDate = capabilities.files_sharing.public.expire_date

  if (expirationDate.enabled) {
    params.expireDate = DateTime.now()
      .plus({ days: parseInt(expirationDate.days, 10) })
      .endOf('day')
      .toISO()
  }

  return new Promise((resolve, reject) => {
    ctx.store
      .dispatch('Files/addLink', { path: ctx.item.path, client: ctx.client, params })
      .then((link) => {
        ctx.store.dispatch('Files/sidebar/openWithPanel', 'links-item').then(() => {
          copyToClipboard(link.url)
          ctx.store.dispatch('showMessage', {
            title: ctx.$gettext('Public link created'),
            desc: ctx.$gettext(
              'Public link was created successfully and copied into your clipboard.'
            )
          })
        })
        resolve()
      })
      .catch((e) => {
        reject(e)
      })
  })
}

export async function openNewCollaboratorsPanel(ctx) {
  await ctx.store.dispatch('Files/sidebar/openWithPanel', 'sharing-item')
}

export function canShare(item, store) {
  return (
    store.state.user.capabilities.files_sharing &&
    store.state.user.capabilities.files_sharing.api_enabled &&
    item.canShare()
  )
}

export default {
  collaborators: {
    id: 'collaborators',
    label: ($gettext) => $gettext('Add people'),
    icon: 'user-add',
    handler: openNewCollaboratorsPanel,
    displayed: canShare
  },
  publicLink: {
    id: 'public-link',
    label: ($gettext) => $gettext('Create and copy public link'),
    icon: 'link',
    handler: createPublicLink,
    displayed: canShare
  }
}
