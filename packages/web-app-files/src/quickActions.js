import { DateTime } from 'luxon'
import copyToClipboard from 'copy-to-clipboard'

export function createPublicLink(ctx) {
  const params = { name: ctx.$gettext('Quick action link'), permissions: 1 }
  const capabilities = ctx.store.state.user.capabilities
  const expirationDate = capabilities.files_sharing.public.expire_date

  if (expirationDate.enforced) {
    params.expireDate = DateTime.now()
      .plus({ days: parseInt(expirationDate.days, 10) })
      .endOf('day')
      .toISO()
  }

  // needs check for enforced password for default role (viewer?)
  // and concept to what happens if it is enforced

  if (ctx.storageId) {
    params.spaceRef = `${ctx.storageId}${ctx.item.path}`
  }

  return new Promise((resolve, reject) => {
    ctx.store
      .dispatch('Files/addLink', {
        path: ctx.item.path,
        client: ctx.client,
        params,
        storageId: ctx.storageId
      })
      .then((link) => {
        ctx.store.dispatch('Files/sidebar/openWithPanel', 'sharing-item').then(() => {
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

export async function openSpaceMembersPanel(ctx) {
  await ctx.store.dispatch('Files/sidebar/openWithPanel', 'space-share-item')
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
