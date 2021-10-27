<template>
  <div
    :data-testid="`collaborator-item-${collaborator.collaborator.name}`"
    class="files-collaborators-collaborator uk-flex oc-py-xs"
  >
    <div class="uk-width-2-3 uk-flex uk-flex-start" style="gap: 10px">
      <oc-avatar
        v-if="shareTypeName === 'user'"
        :src="''"
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
          <span aria-hidden="true" v-text="shareDisplayName" />
          <span class="oc-invisible-sr" v-text="screenreaderShareDisplayName" />
        </p>
        <p class="oc-m-rm">
          <span aria-hidden="true" v-text="shareTypeText" />
          <span class="oc-invisible-sr" v-text="screenreaderShareDetails" />
          <span v-if="expirationDateLocale">
            <span aria-hidden="true">
              <oc-icon size="small" name="text-calendar" />
              {{ shareExpirationText }}
            </span>
            <span class="oc-invisible-sr" v-text="screenreaderShareExpiration" />
          </span>
        </p>
      </div>
    </div>
    <div v-if="!isOwner && canEditOrDelete" class="uk-width-1-3 uk-flex uk-flex-right uk-flex-top">
      <collaborators-edit-options
        :minimal="true"
        :existing-role="originalRole"
        :expiration-date-input="false"
        :expiration-date="collaborator.expires ? collaborator.expires : null"
        :existing-collaborator-type="collaboratorType"
        @optionChange="collaboratorDropdownChange"
      />
      <show-collaborator-edit-options
        :collaborator="collaborator"
        :expiration-date="collaborator.expires ? collaborator.expires : null"
        @expirationDateChanged="collaboratorDropdownChange"
        @removeShare="removeShare"
        @optionChange="collaboratorDropdownChange"
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

import ShowCollaboratorEditOptions from './ShowCollaboratorEditOptions.vue'
import CollaboratorsEditOptions from './CollaboratorsEditOptions.vue'

export default {
  name: 'Collaborator',
  components: {
    CollaboratorsEditOptions,
    ShowCollaboratorEditOptions
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
  data: function () {
    return {
      removalInProgress: false
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
      const displayName = this.collaborator.collaborator.displayName
      const additionalInfo = this.collaborator.collaborator.additionalInfo
      if (additionalInfo === null) return displayName
      return `${displayName} (${additionalInfo})`
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
      return this.modifiable && !this.removalInProgress
    },

    editShareHint() {
      const translated = this.$gettext('Edit share with %{ currentCollaborator }')
      return this.$gettextInterpolate(
        translated,
        { currentCollaborator: this.collaborator.collaborator.displayName },
        true
      )
    },

    deleteShareHint() {
      const translated = this.$gettext('Delete share with %{ currentCollaborator }')
      return this.$gettextInterpolate(
        translated,
        { currentCollaborator: this.collaborator.collaborator.displayName },
        true
      )
    },

    $_reshareInformation() {
      try {
        this.collaborator.resharers.forEach(function (share) {
          if (typeof share.displayName !== 'string' || !share.displayName) {
            throw Error('displayName of resharer is not a string')
          }
        })
        return this.collaborator.resharers.map((share) => share.displayName).join(', ')
      } catch (e) {
        return null
      }
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

    isOwner() {
      return this.collaborator.role.name === 'owner'
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
      this.removalInProgress = true
      this.$emit('onDelete', this.collaborator)
    },

    collaboratorDropdownChange({ role, permissions, expirationDate }) {
      this.collaboratorOptionChanged({ role, permissions, expirationDate, checkNull: true })
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
