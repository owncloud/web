import moment from 'moment'
import copyToClipboard from 'copy-to-clipboard'

// just a dummy function to trick gettext tools
function $gettext(msg) {
  return msg
}

function createPublicLink(ctx) {
  // FIXME: Translate name
  const params = { name: 'Quick action link', permissions: 1 }
  const capabilities = ctx.store.state.user.capabilities
  const expirationDate = capabilities.files_sharing.public.expire_date

  if (expirationDate.enabled) {
    params.expireDate = moment()
      .add(parseInt(expirationDate.days, 10), 'days')
      .endOf('day')
      .toISOString()
  }

  return new Promise((resolve, reject) => {
    ctx.client.shares
      .shareFileWithLink(ctx.item.path, params)
      .then(res => {
        copyToClipboard(res.shareInfo.url)
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

function openNewCollaboratorsPanel(ctx) {
  ctx.store.dispatch('Files/setHighlightedFile', ctx.item)

  // Workaround for displaying the new collaborators panel even when one is already opened
  // Creating timeout takes care of the event loop
  setTimeout(() => {
    ctx.store.commit('Files/SET_APP_SIDEBAR_EXPANDED_ACCORDION', 'files-sharing')
    ctx.store.commit('Files/SET_APP_SIDEBAR_ACCORDION_CONTEXT', 'newCollaborator')
  })
}

function canShare(item, store) {
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
