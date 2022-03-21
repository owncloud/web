<template>
  <div
    :data-testid="`collaborator-${isUser || isSpace ? 'user' : 'group'}-item-${
      share.collaborator.name
    }`"
    class="files-collaborators-collaborator oc-flex oc-flex-middle oc-py-xs oc-flex-between"
  >
    <div class="oc-width-2-3 oc-flex oc-flex-middle" style="gap: 10px">
      <avatar-image
        v-if="isUser || isSpace"
        :userid="share.collaborator.name"
        :user-name="share.collaborator.displayName"
        :width="48"
        class="files-collaborators-collaborator-indicator"
      />
      <oc-avatar-item
        v-else
        :width="48"
        icon-size="medium"
        :icon="shareTypeKey"
        :name="shareTypeKey"
        class="files-collaborators-collaborator-indicator"
      />
      <div class="oc-text-truncate">
        <p v-oc-tooltip="shareDisplayNameTooltip" class="oc-text-bold oc-text-truncate oc-m-rm">
          <span
            aria-hidden="true"
            class="files-collaborators-collaborator-name"
            v-text="shareDisplayName"
          />
          <span
            v-if="shareAdditionalInfo"
            aria-hidden="true"
            class="files-collaborators-collaborator-additional-info"
            v-text="shareAdditionalInfo"
          />
          <span class="oc-invisible-sr" v-text="screenreaderShareDisplayName" />
        </p>
        <p class="oc-m-rm oc-flex">
          <span
            aria-hidden="true"
            class="files-collaborators-collaborator-share-type"
            v-text="shareTypeText"
          />
          <span v-if="sharedParentRoute" class="oc-resource-indicators oc-text-truncate">
            <span class="oc-mx-s">·</span>
            <router-link
              v-oc-tooltip="$gettext('Navigate to parent folder')"
              class="parent-folder oc-text-truncate"
              :to="sharedParentRoute"
            >
              <span class="text" v-text="$gettext('via')" />
              <oc-icon name="folder-2" size="small" fill-type="line" class="oc-px-xs" />
              <span class="text oc-text-truncate" v-text="sharedParentDir" />
            </router-link>
          </span>
          <span class="oc-invisible-sr" v-text="screenreaderShareDetails" />
        </p>
        <p v-if="hasExpirationDate" class="oc-m-rm">
          <span
            v-oc-tooltip="expirationDate"
            aria-hidden="true"
            class="files-collaborators-collaborator-expiration"
            data-testid="recipient-info-expiration-date"
            tabindex="0"
            v-text="shareExpirationText"
          />
          <span class="oc-invisible-sr" v-text="screenreaderShareExpiration" />
        </p>
      </div>
    </div>
    <div
      v-if="canEditOrDelete"
      class="oc-width-1-3 oc-flex oc-flex-nowrap oc-flex-right oc-flex-middle"
    >
      <role-dropdown
        :resource="highlightedFile"
        :share-id="share.id"
        :existing-permissions="share.customPermissions"
        :existing-role="share.role"
        :allow-share-permission="hasResharing || isSpace"
        class="files-collaborators-collaborator-role"
        @optionChange="shareRoleChanged"
      />
      <edit-dropdown
        class="files-collaborators-collaborator-edit"
        data-testid="collaborator-edit"
        :expiration-date="share.expires ? share.expires : null"
        :share-category="shareCategory"
        @expirationDateChanged="shareExpirationChanged"
        @removeShare="removeShare"
      />
    </div>
    <div v-else-if="share.role">
      <span class="oc-mr-xs" v-text="share.role.label" />
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions, mapState } from 'vuex'
import Mixins from '../../../../mixins'
import { DateTime } from 'luxon'

import EditDropdown from './EditDropdown.vue'
import RoleDropdown from '../RoleDropdown.vue'
import { SharePermissions, ShareTypes } from '../../../../helpers/share'
import { clientService } from 'web-pkg/src/services'
import { useCapabilityFilesSharingResharing } from 'web-pkg/src/composables'

export default {
  name: 'ListItem',
  components: {
    EditDropdown,
    RoleDropdown
  },
  mixins: [Mixins],
  props: {
    share: {
      type: Object,
      required: true
    },
    modifiable: {
      type: Boolean,
      default: false
    },
    sharedParentRoute: {
      type: Object,
      default: null
    }
  },
  setup() {
    return {
      hasResharing: useCapabilityFilesSharingResharing()
    }
  },
  computed: {
    ...mapGetters('Files', ['highlightedFile']),
    ...mapGetters(['getToken', 'configuration']),
    ...mapState(['user']),

    shareType() {
      return ShareTypes.getByValue(this.share.shareType)
    },

    shareTypeKey() {
      return this.shareType.key
    },

    isGroup() {
      return this.shareType === ShareTypes.group
    },

    isUser() {
      return this.shareType === ShareTypes.user
    },

    isSpace() {
      return this.shareType === ShareTypes.space
    },

    shareTypeText() {
      return this.$gettext(this.shareType.label)
    },

    shareCategory() {
      return ShareTypes.isIndividual(this.shareType) ? 'user' : 'group'
    },

    shareDisplayName() {
      if (this.user.id === this.share.collaborator.name) {
        return this.$gettextInterpolate(this.$gettext('%{collaboratorName} (me)'), {
          collaboratorName: this.share.collaborator.displayName
        })
      }
      return this.share.collaborator.displayName
    },

    shareAdditionalInfo() {
      if (!this.share.collaborator.additionalInfo) {
        return
      }
      return ` (${this.share.collaborator.additionalInfo})`
    },

    shareDisplayNameTooltip() {
      return this.shareDisplayName + (this.shareAdditionalInfo || '')
    },

    screenreaderShareDisplayName() {
      const context = {
        displayName: this.share.collaborator.displayName,
        ...(this.share.collaborator.additionalInfo && {
          additionalInfo: this.share.collaborator.additionalInfo
        })
      }
      let translated = this.$gettext('Share receiver name: %{ displayName }')
      if (this.shareAdditionalInfo) {
        translated = this.$gettext('Share receiver name: %{ displayName } (%{ additionalInfo })')
      }
      return this.$gettextInterpolate(translated, context)
    },

    screenreaderShareDetails() {
      const translated = this.$gettext('Share type: %{ shareType }')
      return this.$gettextInterpolate(translated, { shareType: this.shareTypeText })
    },

    shareExpirationText() {
      const translated = this.$gettext('Expires %{ expiryDateRelative }')
      return this.$gettextInterpolate(translated, {
        expiryDateRelative: this.expirationDateRelative
      })
    },

    screenreaderShareExpiration() {
      const translated = this.$gettext('Share expires %{ expiryDateRelative } (%{ expiryDate })')
      return this.$gettextInterpolate(translated, {
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
      return DateTime.fromJSDate(this.share.expires)
        .endOf('day')
        .setLocale(this.$language.current)
        .toLocaleString(DateTime.DATETIME_FULL)
    },

    expirationDateRelative() {
      return DateTime.fromJSDate(this.share.expires)
        .endOf('day')
        .setLocale(this.$language.current)
        .toRelative()
    },

    graphClient() {
      return clientService.graphAuthenticated(this.configuration.server, this.getToken)
    },

    sharedParentDir() {
      return this.sharedParentRoute?.params?.item.split('/').pop()
    }
  },
  methods: {
    ...mapActions(['showMessage']),
    ...mapActions('Files', ['changeShare']),

    removeShare() {
      this.$emit('onDelete', this.share)
    },

    shareRoleChanged({ role, permissions }) {
      const expirationDate = this.share.expires
      try {
        this.saveShareChanges({ role, permissions, expirationDate })
      } catch (e) {
        console.error(e)
        this.showMessage({
          title: this.$gettext('Failed to apply new permissions'),
          status: 'danger'
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
        this.showMessage({
          title: this.$gettext('Failed to apply expiration date'),
          status: 'danger'
        })
      }
    },

    saveShareChanges({ role, permissions, expirationDate }) {
      const bitmask = role.hasCustomPermissions
        ? SharePermissions.permissionsToBitmask(permissions)
        : SharePermissions.permissionsToBitmask(
            role.permissions(this.hasResharing || this.shareType === ShareTypes.space)
          )
      this.changeShare({
        client: this.$client,
        graphClient: this.graphClient,
        share: this.share,
        permissions: bitmask,
        expirationDate: expirationDate || ''
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.sharee-avatar {
  min-width: 48px;
}
</style>
