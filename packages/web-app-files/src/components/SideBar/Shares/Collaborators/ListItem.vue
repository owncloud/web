<template>
  <div
    :data-testid="`collaborator-${isAnyUserShareType ? 'user' : 'group'}-item-${
      share.sharedWith.displayName
    }`"
    class="files-collaborators-collaborator oc-py-xs"
  >
    <div class="oc-width-1-1 oc-flex oc-flex-middle files-collaborators-collaborator-details">
      <div class="oc-width-2-3 oc-flex oc-flex-middle">
        <div>
          <template v-if="isShareDenied">
            <oc-avatar-item
              :width="36"
              icon-size="medium"
              icon="stop"
              :name="$gettext('Access denied')"
              class="files-collaborators-collaborator-indicator"
            />
          </template>
          <template v-else>
            <avatar-image
              v-if="isAnyUserShareType"
              :userid="share.sharedWith.id"
              :user-name="share.sharedWith.displayName"
              :width="36"
              class="files-collaborators-collaborator-indicator"
            />
            <oc-avatar-item
              v-else
              :width="36"
              icon-size="medium"
              :icon="shareTypeIcon"
              :name="shareTypeKey"
              class="files-collaborators-collaborator-indicator"
            />
          </template>
        </div>
        <div class="files-collaborators-collaborator-name-wrapper oc-pl-s">
          <div class="oc-text-truncate">
            <span
              aria-hidden="true"
              class="files-collaborators-collaborator-name"
              v-text="shareDisplayName"
            />
            <span class="oc-invisible-sr" v-text="screenreaderShareDisplayName" />
            <oc-contextual-helper
              v-if="isExternalShare"
              :text="
                $gettext(
                  'External user, registered with another organization’s account but granted access to your resources. External users can only have “view” or “edit” permission.'
                )
              "
              :title="$gettext('External user')"
            />
          </div>
          <div>
            <div
              v-if="isShareDenied"
              v-oc-tooltip="shareDeniedTooltip"
              class="oc-flex oc-flex-nowrap oc-flex-middle"
              v-text="$gettext('Access denied')"
            />
            <template v-else>
              <div v-if="modifiable" class="oc-flex oc-flex-nowrap oc-flex-middle">
                <role-dropdown
                  :dom-selector="shareDomSelector"
                  :existing-share-role="share.role"
                  :existing-share-permissions="share.permissions"
                  :is-locked="isLocked"
                  :is-external="isExternalShare"
                  class="files-collaborators-collaborator-role"
                  mode="edit"
                  @option-change="shareRoleChanged"
                />
              </div>
              <div v-else-if="share.role">
                <span
                  v-oc-tooltip="$gettext(share.role.description)"
                  class="oc-mr-xs"
                  v-text="$gettext(share.role.displayName)"
                />
              </div>
            </template>
          </div>
        </div>
      </div>
      <div class="oc-flex oc-flex-middle oc-width-1-3 files-collaborators-collaborator-navigation">
        <expiration-date-indicator
          v-if="hasExpirationDate"
          class="files-collaborators-collaborator-expiration oc-mr-xs"
          data-testid="recipient-info-expiration-date"
          :expiration-date="DateTime.fromISO(share.expirationDateTime)"
        />
        <oc-icon
          v-if="!isShareDenied && sharedParentRoute"
          v-oc-tooltip="sharedViaTooltip"
          name="folder-shared"
          fill-type="line"
          class="files-collaborators-collaborator-shared-via oc-mx-xs"
        />
        <edit-dropdown
          class="files-collaborators-collaborator-edit oc-ml-xs"
          data-testid="collaborator-edit"
          :expiration-date="share.expirationDateTime ? share.expirationDateTime : null"
          :share-category="shareCategory"
          :can-edit="modifiable"
          :can-remove="removable"
          :is-share-denied="isShareDenied"
          :is-locked="isLocked"
          :deniable="deniable"
          :shared-parent-route="!isShareDenied ? sharedParentRoute : undefined"
          :access-details="accessDetails"
          @expiration-date-changed="shareExpirationChanged"
          @remove-share="removeShare"
          @set-deny-share="setDenyShare"
          @notify-share="showNotifyShareModal"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { storeToRefs } from 'pinia'
import { DateTime } from 'luxon'

import EditDropdown from './EditDropdown.vue'
import RoleDropdown from './RoleDropdown.vue'
import { CollaboratorShare, ShareRole, ShareTypes } from '@ownclouders/web-client'
import {
  queryItemAsString,
  useMessages,
  useModals,
  useSpacesStore,
  useUserStore,
  useSharesStore
} from '@ownclouders/web-pkg'
import { Resource, extractDomSelector } from '@ownclouders/web-client'
import { computed, defineComponent, inject, PropType, Ref, unref } from 'vue'
import { formatDateFromDateTime } from '@ownclouders/web-pkg'
import { useClientService } from '@ownclouders/web-pkg'
import { RouteLocationNamedRaw } from 'vue-router'
import { useGettext } from 'vue3-gettext'
import { SpaceResource } from '@ownclouders/web-client'
import { isProjectSpaceResource } from '@ownclouders/web-client'
import { ContextualHelperDataListItem } from '@ownclouders/design-system/helpers'
import ExpirationDateIndicator from '../ExpirationDateIndicator.vue'

export default defineComponent({
  name: 'ListItem',
  components: {
    ExpirationDateIndicator,
    EditDropdown,
    RoleDropdown
  },
  props: {
    share: {
      type: Object as PropType<CollaboratorShare>,
      required: true
    },
    isShareDenied: {
      type: Boolean,
      default: false
    },
    modifiable: {
      type: Boolean,
      default: false
    },
    removable: {
      type: Boolean,
      default: false
    },
    sharedParentRoute: {
      type: Object as PropType<RouteLocationNamedRaw>,
      default: null
    },
    resourceName: {
      type: String,
      default: ''
    },
    deniable: {
      type: Boolean,
      default: false
    },
    isLocked: {
      type: Boolean,
      default: false
    },
    isSpaceShare: {
      type: Boolean,
      default: false
    }
  },
  emits: ['onDelete', 'onSetDeny'],
  setup(props, { emit }) {
    const { showMessage, showErrorMessage } = useMessages()
    const userStore = useUserStore()
    const clientService = useClientService()
    const language = useGettext()
    const { $gettext } = language
    const { dispatchModal } = useModals()

    const sharesStore = useSharesStore()
    const { graphRoles } = storeToRefs(sharesStore)
    const { updateShare } = sharesStore
    const { upsertSpace } = useSpacesStore()

    const { user } = storeToRefs(userStore)

    const sharedParentDir = computed(() => {
      return queryItemAsString(props.sharedParentRoute?.params?.driveAliasAndItem).split('/').pop()
    })

    const shareDate = computed(() => {
      return formatDateFromDateTime(DateTime.fromISO(props.share.createdDateTime), language.current)
    })

    const isExternalShare = computed(() => props.share.shareType === ShareTypes.remote.value)

    const setDenyShare = (value: boolean) => {
      emit('onSetDeny', { share: props.share, value })
    }

    const showNotifyShareModal = () => {
      dispatchModal({
        variation: 'warning',
        icon: 'mail-send',
        title: $gettext('Send a reminder'),
        confirmText: $gettext('Send'),
        message: $gettext('Are you sure you want to send a reminder about this share?'),
        onConfirm: notifyShare
      })
    }
    const notifyShare = async () => {
      // FIXME: cern code
      // const response = await clientService.owncloudSdk.shares.notifyShare(props.share.id)
    }

    const sharedViaTooltip = computed(() =>
      $gettext('Shared via the parent folder "%{sharedParentDir}"', {
        sharedParentDir: unref(sharedParentDir)
      })
    )
    return {
      resource: inject<Ref<Resource>>('resource'),
      space: inject<Ref<SpaceResource>>('space'),
      updateShare,
      user,
      clientService,
      sharedParentDir,
      shareDate,
      graphRoles,
      setDenyShare,
      showNotifyShareModal,
      showMessage,
      showErrorMessage,
      upsertSpace,
      isExternalShare,
      sharedViaTooltip,
      DateTime
    }
  },
  computed: {
    shareType() {
      return ShareTypes.getByValue(this.share.shareType)
    },

    shareTypeIcon() {
      return this.shareType.icon
    },

    shareTypeKey() {
      return this.shareType.key
    },

    shareDomSelector() {
      if (!this.share.id) {
        return undefined
      }
      return extractDomSelector(this.share.id)
    },

    isAnyUserShareType() {
      return ShareTypes.user === this.shareType
    },

    shareTypeText() {
      return this.$gettext(this.shareType.label)
    },

    shareCategory() {
      return ShareTypes.isIndividual(this.shareType) ? 'user' : 'group'
    },

    shareDeniedTooltip() {
      return this.$gettext('%{shareType} cannot access %{resourceName}', {
        shareType: this.shareTypeText,
        resourceName: this.resourceName
      })
    },

    shareDisplayName() {
      if (this.user.id === this.share.sharedWith.id) {
        return this.$gettext('%{collaboratorName} (me)', {
          collaboratorName: this.share.sharedWith.displayName
        })
      }
      return this.share.sharedWith.displayName
    },

    screenreaderShareDisplayName() {
      const context = {
        displayName: this.share.sharedWith.displayName
      }

      return this.$gettext('Share receiver name: %{ displayName }', context)
    },

    hasExpirationDate() {
      return !!this.share.expirationDateTime
    },

    expirationDate() {
      return formatDateFromDateTime(
        DateTime.fromISO(this.share.expirationDateTime).endOf('day'),
        this.$language.current
      )
    },
    shareOwnerDisplayName() {
      return this.share.sharedBy.displayName
    },
    accessDetails() {
      const list: ContextualHelperDataListItem[] = []

      list.push({ text: this.$gettext('Name'), headline: true }, { text: this.shareDisplayName })

      list.push({ text: this.$gettext('Type'), headline: true }, { text: this.shareTypeText })
      list.push(
        { text: this.$gettext('Access expires'), headline: true },
        { text: this.hasExpirationDate ? this.expirationDate : this.$gettext('no') }
      )
      list.push({ text: this.$gettext('Shared on'), headline: true }, { text: this.shareDate })

      if (!this.isSpaceShare) {
        list.push(
          { text: this.$gettext('Invited by'), headline: true },
          { text: this.shareOwnerDisplayName }
        )
      }

      return list
    }
  },
  methods: {
    removeShare() {
      this.$emit('onDelete', this.share)
    },

    async shareRoleChanged(role: ShareRole) {
      const expirationDateTime = this.share.expirationDateTime
      try {
        await this.saveShareChanges({ role, expirationDateTime })
      } catch (e) {
        console.error(e)
        this.showErrorMessage({
          title: this.$gettext('Failed to apply new permissions'),
          errors: [e]
        })
      }
    },

    async shareExpirationChanged({ expirationDateTime }: { expirationDateTime: string }) {
      const role = this.share.role
      try {
        await this.saveShareChanges({ role, expirationDateTime })
      } catch (e) {
        console.error(e)
        this.showErrorMessage({
          title: this.$gettext('Failed to apply expiration date'),
          errors: [e]
        })
      }
    },

    async saveShareChanges({
      role,
      expirationDateTime
    }: {
      role: ShareRole
      expirationDateTime?: string
    }) {
      try {
        await this.updateShare({
          clientService: this.$clientService,
          space: this.space,
          resource: this.resource,
          collaboratorShare: this.share,
          options: { roles: [role.id], expirationDateTime }
        })

        if (isProjectSpaceResource(this.resource)) {
          const client = this.clientService.graphAuthenticated
          const space = await client.drives.getDrive(this.resource.id, this.graphRoles)

          this.upsertSpace(space)
        }

        this.showMessage({ title: this.$gettext('Share successfully changed') })
      } catch (e) {
        console.error(e)
        this.showErrorMessage({
          title: this.$gettext('Error while editing the share.'),
          errors: [e]
        })
      }
    }
  }
})
</script>

<style lang="scss" scoped>
.sharee-avatar {
  min-width: 36px;
}

.files-collaborators-collaborator-navigation {
  align-items: center;
  justify-content: end;
}

.files-collaborators-collaborator-role {
  max-width: 100%;
}

.files-collaborators-collaborator-name-wrapper {
  max-width: 100%;
}
</style>
