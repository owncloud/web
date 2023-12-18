<template>
  <div
    :data-testid="`collaborator-${isAnyUserShareType ? 'user' : 'group'}-item-${
      share.collaborator.name
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
              :userid="share.collaborator.name"
              :user-name="share.collaborator.displayName"
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
        <div class="oc-pl-s oc-text-truncate">
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
              <div v-if="canEditOrDelete" class="oc-flex oc-flex-nowrap oc-flex-middle">
                <role-dropdown
                  :dom-selector="shareDomSelector"
                  :existing-permissions="share.customPermissions"
                  :existing-role="share.role"
                  :allow-share-permission="hasResharing || isAnySpaceShareType"
                  class="files-collaborators-collaborator-role"
                  mode="edit"
                  @option-change="shareRoleChanged"
                />
              </div>
              <div v-else-if="share.role">
                <span
                  v-oc-tooltip="$gettext(share.role.description(false))"
                  class="oc-mr-xs"
                  v-text="$gettext(share.role.label)"
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
          :expiration-date="share.expires ? share.expires : null"
          :share-category="shareCategory"
          :can-edit-or-delete="canEditOrDelete"
          :is-share-denied="isShareDenied"
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
          v-bind="isAnySpaceShareType ? accessDetailsPropsSpace : accessDetailsProps"
          mode="manual"
          :target="`#edit-drop-down-${editDropDownToggleId}`"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { mapActions, mapState } from 'vuex'
import { DateTime } from 'luxon'

import EditDropdown from './EditDropdown.vue'
import RoleDropdown from './RoleDropdown.vue'
import { Share, SharePermissions, ShareTypes } from '@ownclouders/web-client/src/helpers/share'
import {
  queryItemAsString,
  useCapabilityFilesSharingResharing,
  useCapabilityFilesSharingResharingDefault,
  useModals,
  useStore
} from '@ownclouders/web-pkg'
import { extractDomSelector } from '@ownclouders/web-client/src/helpers/resource'
import { computed, defineComponent, PropType } from 'vue'
import * as uuid from 'uuid'
import { formatDateFromDateTime, formatRelativeDateFromDateTime } from '@ownclouders/web-pkg'
import { useClientService } from '@ownclouders/web-pkg'
import { OcInfoDrop, OcDrop } from 'design-system/src/components'
import { RouteLocationNamedRaw } from 'vue-router'
import { useGettext } from 'vue3-gettext'

export default defineComponent({
  name: 'ListItem',
  components: {
    EditDropdown,
    RoleDropdown
  },
  props: {
    share: {
      type: Object as PropType<Share>,
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
    }
  },
  emits: ['onDelete', 'onSetDeny'],
  setup(props, { emit }) {
    const store = useStore()
    const clientService = useClientService()
    const { $gettext } = useGettext()
    const { registerModal } = useModals()

    const sharedParentDir = computed(() => {
      return queryItemAsString(props.sharedParentRoute?.params?.driveAliasAndItem)
        .split('/')
        .pop()
    })

    const setDenyShare = (value) => {
      emit('onSetDeny', { share: props.share, value })
    }

    const showNotifyShareModal = () => {
      registerModal({
        variation: 'warning',
        icon: 'mail-send',
        title: $gettext('Send a reminder'),
        confirmText: $gettext('Send'),
        message: $gettext('Are you sure you want to send a reminder about this share?'),
        onConfirm: notifyShare
      })
    }
    const notifyShare = async () => {
      try {
        const response = await clientService.owncloudSdk.shares.notifyShare(props.share.id)
        store.dispatch('showMessage', {
          title: $gettext('Success'),
          desc: $gettext('Email reminder sent to %{ recipient }', { recipient: response[0] }),
          status: 'success'
        })
      } catch (error) {
        console.error(error)
        store.dispatch('showErrorMessage', {
          title: $gettext('An error occurred'),
          desc: $gettext('Email notification could not be sent'),
          error
        })
      }
    }

    return {
      hasResharing: useCapabilityFilesSharingResharing(),
      resharingDefault: useCapabilityFilesSharingResharingDefault(),
      clientService,
      sharedParentDir,
      setDenyShare,
      showNotifyShareModal
    }
  },
  computed: {
    ...mapState(['user']),

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
      return [ShareTypes.user, ShareTypes.spaceUser].includes(this.shareType)
    },

    isAnySpaceShareType() {
      return [ShareTypes.spaceUser, ShareTypes.spaceGroup].includes(this.shareType)
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
      if (this.user.id === this.share.collaborator.name) {
        return this.$gettext('%{collaboratorName} (me)', {
          collaboratorName: this.share.collaborator.displayName
        })
      }
      return this.share.collaborator.displayName
    },

    shareAdditionalInfo() {
      return this.share.collaborator.additionalInfo
    },

    shareDisplayNameTooltip() {
      return (
        this.shareDisplayName + (this.shareAdditionalInfo ? `(${this.shareAdditionalInfo})` : '')
      )
    },

    screenreaderShareDisplayName() {
      const context = {
        displayName: this.share.collaborator.displayName,
        ...(this.share.collaborator.additionalInfo && {
          additionalInfo: this.share.collaborator.additionalInfo
        })
      }
      if (this.shareAdditionalInfo) {
        return this.$gettext('Share receiver name: %{ displayName } (%{ additionalInfo })', context)
      }

      return this.$gettext('Share receiver name: %{ displayName }', context)
    },

    screenreaderShareExpiration() {
      return this.$gettext('Share expires %{ expiryDateRelative } (%{ expiryDate })', {
        expiryDateRelative: this.expirationDateRelative,
        expiryDate: this.expirationDate
      })
    },

    canEditOrDelete() {
      return this.modifiable
    },

    hasExpirationDate() {
      return this.share.expires
    },

    expirationDate() {
      return formatDateFromDateTime(
        DateTime.fromJSDate(this.share.expires).endOf('day'),
        this.$language.current
      )
    },

    expirationDateRelative() {
      return formatRelativeDateFromDateTime(
        DateTime.fromJSDate(this.share.expires).endOf('day'),
        this.$language.current
      )
    },

    editDropDownToggleId() {
      return uuid.v4()
    },
    shareDate() {
      return formatDateFromDateTime(
        DateTime.fromSeconds(parseInt(this.share.stime)),
        this.$language.current
      )
    },
    shareOwnerDisplayName() {
      return this.share.owner.displayName
    },
    shareOwnerAdditionalInfo() {
      return this.share.owner.additionalInfo
    },
    accessDetailsPropsSpace() {
      const list = []

      list.push({ text: this.$gettext('Name'), headline: true }, { text: this.shareDisplayName })

      if (this.shareAdditionalInfo) {
        list.push(
          { text: this.$gettext('Additional info'), headline: true },
          { text: this.shareAdditionalInfo }
        )
      }

      list.push({ text: this.$gettext('Type'), headline: true }, { text: this.shareTypeText })

      return {
        title: this.$gettext('Access details'),
        list
      }
    },
    accessDetailsProps() {
      const list = []

      list.push({ text: this.$gettext('Name'), headline: true }, { text: this.shareDisplayName })

      if (this.shareAdditionalInfo) {
        list.push(
          { text: this.$gettext('Additional info'), headline: true },
          { text: this.shareAdditionalInfo }
        )
      }

      list.push({ text: this.$gettext('Type'), headline: true }, { text: this.shareTypeText })
      list.push(
        { text: this.$gettext('Access expires'), headline: true },
        { text: this.hasExpirationDate ? this.expirationDate : this.$gettext('no') }
      )
      list.push({ text: this.$gettext('Shared on'), headline: true }, { text: this.shareDate })
      list.push(
        { text: this.$gettext('Invited by'), headline: true },
        {
          text: this.shareOwnerAdditionalInfo
            ? `${this.shareOwnerDisplayName} (${this.shareOwnerAdditionalInfo})`
            : this.shareOwnerDisplayName
        }
      )

      return {
        title: this.$gettext('Access details'),
        list
      }
    }
  },
  methods: {
    ...mapActions(['showMessage', 'showErrorMessage']),
    ...mapActions('Files', ['changeShare']),
    ...mapActions('runtime/spaces', ['changeSpaceMember']),

    removeShare() {
      this.$emit('onDelete', this.share)
    },

    showAccessDetails() {
      ;(
        (this.$refs.accessDetailsDrop as InstanceType<typeof OcInfoDrop>).$refs
          .drop as InstanceType<typeof OcDrop>
      ).show()
    },

    shareRoleChanged({ role, permissions }) {
      const expirationDate = this.share.expires
      try {
        this.saveShareChanges({ role, permissions, expirationDate })
      } catch (e) {
        console.error(e)
        this.showErrorMessage({
          title: this.$gettext('Failed to apply new permissions'),
          error: e
        })
      }
    },

    shareExpirationChanged({ expirationDate }) {
      const role = this.share.role
      const permissions = this.share.customPermissions
      try {
        this.saveShareChanges({ role, permissions, expirationDate })
      } catch (e) {
        console.error(e)
        this.showErrorMessage({
          title: this.$gettext('Failed to apply expiration date'),
          error: e
        })
      }
    },

    saveShareChanges({ role, permissions, expirationDate }) {
      const bitmask = role.hasCustomPermissions
        ? SharePermissions.permissionsToBitmask(permissions)
        : SharePermissions.permissionsToBitmask(
            role.permissions(
              (this.hasResharing && this.resharingDefault) || this.isAnySpaceShareType
            )
          )
      const changeMethod = this.isAnySpaceShareType ? this.changeSpaceMember : this.changeShare

      try {
        changeMethod({
          client: this.$client,
          graphClient: this.clientService.graphAuthenticated,
          share: this.share,
          permissions: bitmask,
          expirationDate: expirationDate || '',
          role
        })
        this.showMessage({ title: this.$gettext('Share successfully changed') })
      } catch (e) {
        console.error(e)
        this.showErrorMessage({
          title: this.$gettext('Error while editing the share.'),
          error: e
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
</style>
