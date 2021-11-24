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
        <p v-if="expirationDateLocale" class="oc-mt-rm">
          <span
            aria-hidden="true"
            class="collaborator-expiration"
            data-testid="recipient-info-expiration-date"
          >
            {{ shareExpirationText }}
          </span>
          <span class="oc-invisible-sr" v-text="screenreaderShareExpiration" />
        </p>
      </div>
    </div>
    <div
      v-if="canEditOrDelete"
      class="uk-width-1-3 uk-flex uk-flex-nowrap uk-flex-right uk-flex-middle"
    >
      <role-selection
        :collaborator-id="collaborator.id"
        :collaborators-permissions="originalPermissions"
        :existing-role="originalRole"
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
import { shareTypes } from '../../../../helpers/shareTypes'
import CollaboratorsMixins from '../../../../mixins/collaborators'
import Mixins from '../../../../mixins'
import { DateTime } from 'luxon'
import { roleToBitmask, bitmaskToRole } from '../../../../helpers/collaborators'

import EditDropdown from './EditDropdown.vue'
import RoleSelection from '../RoleSelection.vue'

export default {
  name: 'Collaborator',
  components: {
    EditDropdown,
    RoleSelection
  },
  mixins: [Mixins, CollaboratorsMixins],
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

    shareTypeText() {
      switch (this.shareType) {
        case shareTypes.user:
          return this.$gettext('User')
        case shareTypes.group:
          return this.$gettext('Group')
        case shareTypes.link:
          return this.$gettext('Link')
        case shareTypes.guest:
          return this.$gettext('Guest')
        case shareTypes.remote:
          return this.$gettext('Federated')
        default:
          return this.$gettext('User')
      }
    },

    shareTypeName() {
      return Object.keys(shareTypes)[this.shareType]
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
      const collaboratorShareType = this.collaborator.shareType

      if (
        collaboratorShareType === shareTypes.user ||
        collaboratorShareType === shareTypes.guest ||
        collaboratorShareType === shareTypes.remote
      ) {
        return 'user'
      }

      if (collaboratorShareType === shareTypes.group) {
        return 'group'
      }

      return null
    },

    screenreaderShareDisplayName() {
      const translated = this.$gettext('Share-receiver name: %{ shareName }')
      return this.$gettextInterpolate(translated, { shareName: this.shareDisplayName })
    },

    screenreaderShareDetails() {
      const translated = this.$gettext('Share-type: %{ shareType }')
      return this.$gettextInterpolate(translated, { shareType: this.shareTypeText })
    },

    shareExpirationText() {
      const translated = this.$gettext('Expires %{ expiryDate }')
      return this.$gettextInterpolate(translated, { expiryDate: this.expirationDateLocale })
    },

    screenreaderShareExpiration() {
      const translated = this.$gettext('Share expires on %{ expiryDate }')
      return this.$gettextInterpolate(translated, {
        expiryDate: this.expirationDateLocale
      })
    },

    canEditOrDelete() {
      return this.modifiable
    },

    originalPermissions() {
      return Object.entries(this.collaborator.customPermissions)
        .filter(([key, value]) => value > 0)
        .flat()
        .filter((value) => typeof value === 'string')
    },

    originalRole() {
      const role = this.displayRoles.find((r) => r.name === this.collaborator.role.name)

      if (role) {
        return role
      }

      return {
        label: this.$gettext('Unknown Role')
      }
    },

    shareType() {
      return this.collaborator.shareType ? this.collaborator.shareType : 0
    },

    isGroup() {
      return this.collaborator.shareType === this.shareTypes.group
    },

    expirationDateLocale() {
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
      const expiryDate = this.collaborator.expires
      this.saveCollaboratorChanges({ role, permissions, expiryDate })
    },

    collaboratorExpirationChanged({ expirationDate }) {
      const role = this.collaborator.role
      const permissions = this.collaborator.additionalPermissions
      this.saveCollaboratorChanges({ role, permissions, expirationDate })
    },

    saveCollaboratorChanges({ role, permissions, expirationDate }) {
      const roleValue = role || this.selectedRole
      const permissionsValue = permissions || this.additionalPermissions
      const bitmask = roleToBitmask(roleValue, permissionsValue)
      const expiration = expirationDate || this.expirationDate
      this.changeShare({
        client: this.$client,
        share: this.collaborator,
        // Map bitmask to role to get the correct role in case the advanced role was mapped to existing role
        role: bitmaskToRole(bitmask, this.highlightedFile.type === 'folder', !this.isOcis),
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
