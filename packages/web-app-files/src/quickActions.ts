import { createQuicklink } from './helpers/share'
import { eventBus } from 'web-pkg/src/services/eventBus'
import { SideBarEventTopics } from 'web-pkg/src/composables/sideBar'

export function canShare(item, store) {
  // CERNBox do not allow actions above home/project root
  const elems = item.path?.split('/').filter(Boolean) //"/eos/project/c/cernbox"
  if (elems.length < 5) {
    return false
  }
  const { capabilities } = store.state.user
  if (!capabilities.files_sharing || !capabilities.files_sharing.api_enabled) {
    return false
  }
  if (item.isReceivedShare() && !capabilities.files_sharing.resharing) {
    return false
  }
  return item.canShare()
}

export function showQuickLinkPasswordModal({ $gettext, store }, onConfirm) {
  const modal = {
    variation: 'passive',
    title: $gettext('Set password'),
    cancelText: $gettext('Cancel'),
    confirmText: $gettext('Set'),
    hasInput: true,
    inputDescription: $gettext('Passwords for links are required.'),
    inputLabel: $gettext('Password'),
    inputType: 'password',
    onCancel: () => store.dispatch('hideModal'),
    onConfirm: async (password) => {
      if (!password || password.trim() === '') {
        store.dispatch('showMessage', {
          title: $gettext('Password cannot be empty'),
          status: 'danger'
        })
      } else {
        await store.dispatch('hideModal')
        onConfirm(password)
      }
    },
    onInput: (password) => {
      if (password.trim() === '') {
        return store.dispatch('setModalInputErrorMessage', $gettext('Password cannot be empty'))
      }
      return store.dispatch('setModalInputErrorMessage', null)
    }
  }

  return store.dispatch('createModal', modal)
}

export default {
  collaborators: {
    id: 'collaborators',
    label: ($gettext) => $gettext('Add people'),
    icon: 'user-add',
    iconFillType: undefined,
    handler: () => eventBus.publish(SideBarEventTopics.openWithPanel, 'sharing#peopleShares'),
    displayed: canShare
  },
  quicklink: {
    id: 'quicklink',
    label: ($gettext) => $gettext('Copy quicklink'),
    icon: 'link',
    iconFillType: undefined,
    handler: async (ctx) => {
      const passwordEnforced =
        ctx.store.getters.capabilities?.files_sharing?.public?.password?.enforced_for?.read_only ===
        true

      if (passwordEnforced) {
        return showQuickLinkPasswordModal(ctx, async (password) => {
          await createQuicklink({ ...ctx, resource: ctx.item, password })
        })
      }

      await createQuicklink({ ...ctx, resource: ctx.item })
    },
    displayed: canShare
  }
}
