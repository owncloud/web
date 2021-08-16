import { DateTime } from 'luxon'
import copyToClipboard from 'copy-to-clipboard'
import { bus } from 'web-pkg/src/instance'

// just a dummy function to trick gettext tools
function $gettext(msg) {
  return msg
}

export function createPublicLink(ctx) {
  // FIXME: Translate name
  const params = { name: $gettext('Quick action link'), permissions: 1 }
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
      .then(link => {
        bus.emit('app.files.sidebar.show')
        ctx.store.commit('Files/SET_APP_SIDEBAR_ACTIVE_PANEL', 'links-item')
        copyToClipboard(link.url)
        ctx.store.dispatch('showMessage', {
          title: $gettext('Public link created'),
          desc: $gettext(
            'Public link has been successfully created and copied into your clipboard.'
          ),
          status: 'success',
          autoClose: {
            enabled: true
          }
        })
        resolve()
      })
      .catch(e => {
        reject(e)
      })
  })
}

export function openNewCollaboratorsPanel(ctx) {
  bus.emit('app.files.sidebar.show')
  ctx.store.commit('Files/SET_APP_SIDEBAR_ACTIVE_PANEL', 'sharing-item')
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
    label: $gettext('Add people'),
    icon: 'group-add',
    handler: openNewCollaboratorsPanel,
    displayed: canShare
  },
  publicLink: {
    id: 'public-link',
    label: $gettext('Create and copy public link'),
    icon: 'link-add',
    handler: createPublicLink,
    displayed: canShare
  }
}
