import { createQuicklink } from 'web-pkg/src/helpers/share'
import { eventBus } from 'web-pkg/src/services/eventBus'
import { SideBarEventTopics } from 'web-pkg/src/composables/sideBar'
import { Resource } from 'web-client'
import { Language } from 'vue3-gettext'
import { ClientService } from 'web-pkg'
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
    onInput: () => store.dispatch('setModalInputErrorMessage', ''),
    onPasswordChallengeCompleted: () => store.dispatch('setModalConfirmButtonDisabled', false),
    onPasswordChallengeFailed: () => store.dispatch('setModalConfirmButtonDisabled', true),
    onCancel: () => store.dispatch('hideModal'),
    onConfirm: async (password) => {
      onConfirm(password)
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
    handler: async ({ ability, clientService, item, language, store }: QuickLinkContext) => {
      const passwordEnforced =
        store.getters.capabilities?.files_sharing?.public?.password?.enforced_for?.read_only ===
        true

      if (passwordEnforced) {
        return showQuickLinkPasswordModal(
          { store, $gettext: language.$gettext },
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
