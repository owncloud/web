import moment from 'moment'
import copyToClipboard from 'copy-to-clipboard'

// just a dummy function to trick gettext tools
function $gettext(msg) {
  return msg
}

function createPublicLink(ctx) {
  // FIXME: Translate name
  const params = { name: 'Quick action link' }
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
          status: 'success'
        })
        resolve()
      })
      .catch(e => {
        reject(e)
      })
  })
}

export default {
  publicLink: {
    id: 'public-link',
    label: $gettext('Create and copy public link'),
    icon: 'link',
    handler: createPublicLink
  }
}
