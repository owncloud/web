<template>
  <div
    :data-testid="`collaborator-item-${collaborator.collaborator.name}`"
    class="files-collaborators-collaborator uk-flex oc-py-xs"
  >
    <div class="uk-width-2-3 uk-flex uk-flex-start" style="gap: 10px">
      <avatar-image
        v-if="shareTypeName === 'user'"
        :userid="collaborator.collaborator.name"
        :user-name="collaborator.collaborator.displayName"
        :width="48"
        class="sharee-avatar"
      />
      <oc-avatar-item
        v-else
        :width="48"
        icon-size="medium"
        :icon="shareTypeName"
        :name="shareTypeName"
        class="sharee-avatar"
      />
      <div class="oc-text-truncate">
        <p class="oc-text-bold oc-text-truncate oc-m-rm">
          <span aria-hidden="true" class="collaborator-display-name" v-text="shareDisplayName" />
          <span
            aria-hidden="true"
            class="collaborator-additional-info"
            v-text="shareAdditionalInfo"
          />
          <span class="oc-invisible-sr" v-text="screenreaderShareDisplayName" />
        </p>
        <p class="oc-m-rm collaborator-additional-info">
          <span aria-hidden="true" class="share-type" v-text="shareTypeText" />
          <span class="oc-invisible-sr" v-text="screenreaderShareDetails" />
        </p>
        <p v-if="expirationDate" class="oc-mt-rm">
          <span
            v-oc-tooltip="expirationDate"
            aria-hidden="true"
            class="collaborator-expiration"
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
      class="uk-width-1-3 uk-flex uk-flex-nowrap uk-flex-right uk-flex-middle"
    >
      <role-dropdown
        :resource="highlightedFile"
        :collaborator-id="collaborator.id"
        :existing-permissions="collaborator.customPermissions"
        :existing-role="collaborator.role"
        :allow-share-permission="!isOcis"
        @optionChange="collaboratorRoleChanged"
      />
      <edit-dropdown
        class="oc-ml-s"
        :expiration-date="collaborator.expires ? collaborator.expires : null"
        :existing-collaborator-type="collaboratorType"
        @expirationDateChanged="collaboratorExpirationChanged"
        @removeShare="removeShare"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import Mixins from '../../../../mixins'
import { DateTime } from 'luxon'

import EditDropdown from './EditDropdown.vue'
import RoleDropdown from '../RoleDropdown.vue'
import { SharePermissions, ShareType, ShareTypeCategories } from '../../../../helpers/share'

export default {
  name: 'Collaborator',
  components: {
    EditDropdown,
    RoleDropdown
  },
  mixins: [Mixins],
  props: {
    collaborator: {
      type: Object,
      required: true
    },
    modifiable: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapGetters('Files', ['highlightedFile']),
    ...mapGetters(['user', 'isOcis']),

    // FIXME: move to ShareType (needs to be refactored from enum to class)
    shareTypeText() {
      switch (this.shareType) {
        case ShareType.user:
          return this.$gettext('User')
        case ShareType.group:
          return this.$gettext('Group')
        case ShareType.link:
          return this.$gettext('Link')
        case ShareType.guest:
          return this.$gettext('Guest')
        case ShareType.remote:
          return this.$gettext('Federated')
        default:
          return this.$gettext('User')
      }
    },

    shareTypeName() {
      return ShareType[this.shareType]
    },

    shareDisplayName() {
      return this.collaborator.collaborator.displayName
    },

    shareAdditionalInfo() {
      if (this.collaborator.collaborator.additionalInfo === null) {
        return
      }
      return ` (${this.collaborator.collaborator.additionalInfo})`
    },

    collaboratorType() {
      return ShareTypeCategories.getByShareType(this.collaborator.shareType)?.key
    },

    screenreaderShareDisplayName() {
      const translated = this.$gettext('Share receiver name: %{ shareName }')
      return this.$gettextInterpolate(translated, { shareName: this.shareDisplayName })
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

    shareType() {
      return this.collaborator.shareType ? this.collaborator.shareType : 0
    },

    isGroup() {
      return this.collaborator.shareType === ShareType.group
    },

    expirationDate() {
      return DateTime.fromJSDate(this.collaborator.expires)
        .endOf('day')
        .setLocale(this.$language.current)
        .toLocaleString(DateTime.DATETIME_FULL)
    },

    expirationDateRelative() {
      return DateTime.fromJSDate(this.collaborator.expires)
        .endOf('day')
        .setLocale(this.$language.current)
        .toRelative()
    }
  },
  methods: {
    ...mapActions('Files', ['changeShare']),

    removeShare() {
      this.$emit('onDelete', this.collaborator)
    },

    collaboratorRoleChanged({ role, permissions }) {
      // FIXME: this clears the expiration date somehow?!
      const expiryDate = this.collaborator.expires
      this.saveCollaboratorChanges({ role, permissions, expiryDate })
    },

    collaboratorExpirationChanged({ expirationDate }) {
      // FIXME: does this clear the role?!
      const role = this.collaborator.role
      const permissions = this.collaborator.customPermissions
      this.saveCollaboratorChanges({ role, permissions, expirationDate })
    },

    saveCollaboratorChanges({ role, permissions, expirationDate }) {
      const bitmask = role.customPermissions
        ? SharePermissions.permissionsToBitmask(permissions)
        : SharePermissions.permissionsToBitmask(role.permissions(!this.isOcis))
      const expiration = expirationDate || this.expirationDate
      this.changeShare({
        client: this.$client,
        share: this.collaborator,
        permissions: bitmask,
        expirationDate: expiration || ''
      }).catch((errors) => {
        this.errors = errors
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
