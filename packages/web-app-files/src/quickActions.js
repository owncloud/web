import { $gettext } from './gettext'
import { createQuicklink } from './helpers/share'
import { bus } from 'web-pkg/src/instance'
import { SideBarEventTopics } from './composables/sideBar'

export function canShare(item, store) {
  const { capabilities } = store.state.user
  if (item.path === store.getters.homeFolder) {
    return false
  }
  if (!capabilities.files_sharing || !capabilities.files_sharing.api_enabled) {
    return false
  }
  if (item.isReceivedShare() && !capabilities.files_sharing.resharing) {
    return false
  }
  return item.canShare()
}

export function showQuickLinkPasswordModal(ctx, onConfirm) {
  const modal = {
    variation: 'passive',
    title: $gettext('Set password'),
    cancelText: $gettext('Cancel'),
    confirmText: $gettext('Set'),
    hasInput: true,
    inputDescription: $gettext('Passwords for links are required.'),
    inputLabel: $gettext('Password'),
    inputType: 'password',
    onCancel: () => ctx.store.dispatch('hideModal'),
    onConfirm: async (password) => {
      if (!password || password.trim() === '') {
        ctx.store.dispatch('showMessage', {
          title: $gettext('Password cannot be empty'),
          status: 'danger'
        })
      } else {
        await ctx.store.dispatch('hideModal')
        onConfirm(password)
      }
    },
    onInput: (password) => {
      if (password.trim() === '') {
        return ctx.store.dispatch('setModalInputErrorMessage', $gettext('Password cannot be empty'))
      }
      return ctx.store.dispatch('setModalInputErrorMessage', null)
    }
  }

  return ctx.store.dispatch('createModal', modal)
}

export default {
  collaborators: {
    id: 'collaborators',
    label: ($gettext) => $gettext('Add people'),
    icon: 'user-add',
    handler: () => bus.publish(SideBarEventTopics.openWithPanel, 'sharing-item#peopleShares'),
    displayed: canShare
  },
  quicklink: {
    id: 'quicklink',
    label: ($gettext) => $gettext('Copy quicklink'),
    icon: 'link',
    handler: async (ctx) => {
      const passwordEnforced =
        ctx.store.getters.capabilities?.files_sharing?.public?.password?.enforced_for?.read_only ===
        true

      if (passwordEnforced) {
        return showQuickLinkPasswordModal(ctx, async (password) => {
          await createQuicklink({ ...ctx, resource: ctx.item, password })
          bus.publish(SideBarEventTopics.openWithPanel, 'sharing-item#linkShares')
        })
      }

      await createQuicklink({ ...ctx, resource: ctx.item })
      bus.publish(SideBarEventTopics.openWithPanel, 'sharing-item#linkShares')
    },
    displayed: canShare
  }
}
