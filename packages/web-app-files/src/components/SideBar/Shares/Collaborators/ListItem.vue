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
          <div v-oc-tooltip="shareDisplayNameTooltip" class="oc-text-truncate">
            <span
              aria-hidden="true"
              class="files-collaborators-collaborator-name"
              v-text="shareDisplayName"
            />
            <span class="oc-invisible-sr" v-text="screenreaderShareDisplayName" />
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
                  :existing-role="share.role"
                  :is-locked="isLocked"
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
        <div
          v-if="sharedParentRoute && !isShareDenied"
          class="oc-resource-indicators oc-text-truncate"
        >
          <router-link
            v-oc-tooltip="$gettext('Navigate to parent folder')"
            class="parent-folder oc-text-truncate"
            :to="sharedParentRoute"
          >
            <span class="text" v-text="$gettext('via')" />
            <oc-icon name="folder-2" size="small" fill-type="line" class="oc-px-xs" />
            <span class="text oc-text-truncate" v-text="sharedParentDir" />
          </router-link>
        </div>
        <span v-if="hasExpirationDate">
          <oc-icon
            v-oc-tooltip="expirationDate"
            class="files-collaborators-collaborator-expiration"
            data-testid="recipient-info-expiration-date"
            :aria-label="expirationDate"
            name="calendar-event"
            fill-type="line"
          />
          <span class="oc-invisible-sr" v-text="screenreaderShareExpiration" />
        </span>
        <edit-dropdown
          :id="`edit-drop-down-${editDropDownToggleId}`"
          class="files-collaborators-collaborator-edit"
          data-testid="collaborator-edit"
          :expiration-date="share.expirationDateTime ? share.expirationDateTime : null"
          :share-category="shareCategory"
          :can-edit-or-delete="modifiable"
          :is-share-denied="isShareDenied"
          :is-locked="isLocked"
          :deniable="deniable"
          @expiration-date-changed="shareExpirationChanged"
          @remove-share="removeShare"
          @set-deny-share="setDenyShare"
          @show-access-details="showAccessDetails"
          @notify-share="showNotifyShareModal"
        />
        <oc-info-drop
          ref="accessDetailsDrop"
          class="share-access-details-drop"
          v-bind="accessDetailsProps"
          mode="manual"
          :target="`#edit-drop-down-${editDropDownToggleId}`"
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
import { computed, defineComponent, inject, PropType, Ref } from 'vue'
import * as uuid from 'uuid'
import { formatDateFromDateTime, formatRelativeDateFromDateTime } from '@ownclouders/web-pkg'
import { useClientService } from '@ownclouders/web-pkg'
import { OcInfoDrop, OcDrop } from 'design-system/src/components'
import { RouteLocationNamedRaw } from 'vue-router'
import { useGettext } from 'vue3-gettext'
import { SpaceResource } from '@ownclouders/web-client'
import { isProjectSpaceResource } from '@ownclouders/web-client'
import { ContextualHelperDataListItem } from 'design-system/src/helpers'

export default defineComponent({
  name: 'ListItem',
  components: {
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

    const { updateShare } = useSharesStore()
    const { upsertSpace, upsertSpaceMember } = useSpacesStore()

    const { user } = storeToRefs(userStore)

    const sharedParentDir = computed(() => {
      return queryItemAsString(props.sharedParentRoute?.params?.driveAliasAndItem)
        .split('/')
        .pop()
    })

    const shareDate = computed(() => {
      return formatDateFromDateTime(DateTime.fromISO(props.share.createdDateTime), language.current)
    })

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

    return {
      resource: inject<Ref<Resource>>('resource'),
      space: inject<Ref<SpaceResource>>('space'),
      updateShare,
      user,
      clientService,
      sharedParentDir,
      shareDate,
      setDenyShare,
      showNotifyShareModal,
      showMessage,
      showErrorMessage,
      upsertSpace,
      upsertSpaceMember
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

    shareDisplayNameTooltip() {
      return this.shareDisplayName
    },

    screenreaderShareDisplayName() {
      const context = {
        displayName: this.share.sharedWith.displayName
      }

      return this.$gettext('Share receiver name: %{ displayName }', context)
    },

    screenreaderShareExpiration() {
      return this.$gettext('Share expires %{ expiryDateRelative } (%{ expiryDate })', {
        expiryDateRelative: this.expirationDateRelative,
        expiryDate: this.expirationDate
      })
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

    expirationDateRelative() {
      return formatRelativeDateFromDateTime(
        DateTime.fromISO(this.share.expirationDateTime).endOf('day'),
        this.$language.current
      )
    },

    editDropDownToggleId() {
      return uuid.v4()
    },
    shareOwnerDisplayName() {
      return this.share.sharedBy.displayName
    },
    accessDetailsProps() {
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

      return {
        title: this.$gettext('Access details'),
        list
      }
    }
  },
  methods: {
    removeShare() {
      this.$emit('onDelete', this.share)
    },

    showAccessDetails() {
      ;(
        (this.$refs.accessDetailsDrop as InstanceType<typeof OcInfoDrop>).$refs
          .drop as InstanceType<typeof OcDrop>
      ).show()
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
        const share = await this.updateShare({
          clientService: this.$clientService,
          space: this.space,
          resource: this.resource,
          collaboratorShare: this.share,
          options: { roles: [role.id], expirationDateTime }
        })

        if (isProjectSpaceResource(this.resource)) {
          const client = this.clientService.graphAuthenticated
          const space = await client.drives.getDrive(this.resource.id)

          this.upsertSpace(space)
          this.upsertSpaceMember({ member: share })
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

.share-access-details-drop {
  dl {
    display: grid;
    grid-template-columns: max-content auto;
  }

  dt {
    grid-column-start: 1;
  }

  dd {
    grid-column-start: 2;
    margin-left: var(--oc-space-medium);
  }
}

.files-collaborators-collaborator-expiration {
  margin-top: 5px;
}

.files-collaborators-collaborator-navigation {
  justify-content: end;
}

.files-collaborators-collaborator-role {
  max-width: 100%;
}

.files-collaborators-collaborator-name-wrapper {
  max-width: 100%;
}
</style>
