import { createQuicklink } from './helpers/share'
import { eventBus } from 'web-pkg/src/services/eventBus'
import { SideBarEventTopics } from 'web-pkg/src/composables/sideBar'
import { Resource } from 'web-client'
import { Language } from 'vue3-gettext'
import { ClientService, PasswordPolicyService } from 'web-pkg'
import { Ability } from 'web-client/src/helpers/resource/types'
import { Store } from 'vuex'

export function canShare(item, store) {
  const { capabilities } = store.state.user
  if (!capabilities.files_sharing || !capabilities.files_sharing.api_enabled) {
    return false
  }
  if (item.isReceivedShare() && !capabilities.files_sharing.resharing) {
    return false
  }
  return item.canShare()
}

export function showQuickLinkPasswordModal({ $gettext, store, passwordPolicyService }, onConfirm) {
  const modal = {
    variation: 'passive',
    title: $gettext('Set password'),
    cancelText: $gettext('Cancel'),
    confirmText: $gettext('Set'),
    hasInput: true,
    inputDescription: $gettext('Passwords for links are required.'),
    inputPasswordPolicy: passwordPolicyService.getPolicy(),
    inputLabel: $gettext('Password'),
    inputType: 'password',
    onCancel: () => store.dispatch('hideModal'),
    onConfirm: async (password) => {
      if (!password || password.trim() === '') {
        store.dispatch('showErrorMessage', {
          title: $gettext('Password cannot be empty')
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

interface QuickLinkContext {
  ability: Ability
  clientService: ClientService
  item: Resource
  language: Language
  store: Store<any>
  passwordPolicyService: PasswordPolicyService
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
    label: ($gettext) => $gettext('Copy link'),
    icon: 'link',
    iconFillType: undefined,
    handler: async ({
      ability,
      clientService,
      item,
      language,
      store,
      passwordPolicyService
    }: QuickLinkContext) => {
      const passwordEnforced =
        store.getters.capabilities?.files_sharing?.public?.password?.enforced_for?.read_only ===
        true

      if (passwordEnforced) {
        return showQuickLinkPasswordModal(
          { store, $gettext: language.$gettext, passwordPolicyService },
          async (password) => {
            await createQuicklink({
              ability,
              clientService,
              language,
              password,
              resource: item,
              store
            })
          }
        )
      }

      await createQuicklink({
        ability,
        clientService,
        language,
        resource: item,
        store
      })
    },
    displayed: canShare
  }
} // FIXME: fix type, then add: satisfies ApplicationQuickActions
