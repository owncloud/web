import { createQuicklink } from './helpers/share'

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
  quicklink: {
    id: 'quicklink',
    label: ($gettext) => $gettext('Copy quicklink'),
    icon: 'link',
    handler: async (ctx) => {
      await createQuicklink({ ...ctx, resource: ctx.item })
      await ctx.store.dispatch('Files/sidebar/openWithPanel', 'sharing-item')
    },
    displayed: canShare
  }
}
