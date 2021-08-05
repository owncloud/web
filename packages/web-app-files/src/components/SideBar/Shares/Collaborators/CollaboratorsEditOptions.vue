<template>
  <div>
    <hr />
    <oc-button
      id="files-collaborators-role-button"
      appearance="raw"
      justify-content="left"
      gap-size="xsmall"
      aria-describedby="files-recipient-role-btn-sr-hint"
    >
      <translate v-if="selectedRole.name === 'advancedRole'" key="advanced-permissions-select"
        >Invite with custom permissions</translate
      >
      <translate
        v-else
        key="role-select"
        :translate-params="{ name: selectedRole.label.toLowerCase() }"
        >Invite as %{ name }</translate
      >
      <oc-icon name="expand_more" />
    </oc-button>
    <oc-drop toggle="#files-collaborators-role-button" mode="click" close-on-click>
      <template #special>
        <oc-list class="files-recipient-role-drop-list">
          <li v-for="role in roles" :key="role.name">
            <oc-button
              appearance="raw"
              justify-content="space-between"
              class="files-recipient-role-drop-btn oc-py-xs oc-px-s"
              :class="{ selected: role.name === selectedRole.name }"
              @click="selectRole(role)"
            >
              <role-item :role="role" />
              <oc-icon v-if="role.name === selectedRole.name" name="check" />
            </oc-button>
          </li>
        </oc-list>
      </template>
    </oc-drop>
    <translate id="files-recipient-role-btn-sr-hint" tag="p" class="oc-invisible-sr">
      Choose a role for all selected recipients.
    </translate>
    <template v-if="$_ocCollaborators_hasAdditionalPermissions">
      <label v-if="selectedRole.name !== 'advancedRole'" class="oc-label oc-mt-s">
        <translate>Additional permissions</translate>
      </label>
      <additional-permissions
        :available-permissions="selectedRole.additionalPermissions"
        :collaborators-permissions="collaboratorsPermissions"
        :class="{ 'oc-mt-s': selectedRole.name === 'advancedRole' }"
        @permissionChecked="checkAdditionalPermissions"
      />
    </template>
    <hr />
    <div v-if="expirationSupported" class="oc-mt-m">
      <div class="uk-position-relative">
        <oc-datepicker
          id="files-collaborators-collaborator-expiration-input"
          :key="`collaborator-datepicker-${enteredExpirationDate}`"
          :date="enteredExpirationDate"
          :max-datetime="maxExpirationDate"
          :min-datetime="minExpirationDate"
          :label="datePickerLabel"
          @input="setExpirationDate"
        />
        <div
          v-if="canResetExpirationDate"
          id="files-collaborators-collaborator-expiration-delete"
          v-oc-tooltip="expirationDateRemoveTooltip"
          class="uk-position-small uk-position-center-right oc-cursor-pointer"
          uk-close
          @click="resetExpirationDate"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { DateTime } from 'luxon'
import collaboratorsMixins from '../../../../mixins/collaborators'

import RoleItem from '../../Shared/RoleItem.vue'
import AdditionalPermissions from './AdditionalPermissions.vue'

export default {
  name: 'CollaboratorsEditOptions',

  components: {
    RoleItem,
    AdditionalPermissions
  },

  mixins: [collaboratorsMixins],

  props: {
    existingRole: {
      type: Object,
      required: false,
      default: undefined
    },
    collaboratorsPermissions: {
      type: Object,
      required: false,
      default: undefined
    },
    expirationDate: {
      type: Date,
      required: false,
      default: undefined
    },
    existingCollaboratorType: {
      type: [Object, String],
      required: false,
      default: null,
      validator: function(value) {
        return ['user', 'group'].indexOf(value) > -1 || value === null
      }
    }
  },

  data() {
    return {
      selectedRole: null,
      additionalPermissions: null,
      enteredExpirationDate: null
    }
  },

  computed: {
    ...mapGetters(['capabilities']),

    editingUser() {
      return this.existingCollaboratorType === 'user'
    },

    editingGroup() {
      return this.existingCollaboratorType === 'group'
    },

    $_ocCollaborators_hasAdditionalPermissions() {
      return this.selectedRole && this.selectedRole.additionalPermissions
    },

    datePickerLabel() {
      if (this.expirationDateEnforced) {
        return this.$gettext('Expiration date (required)')
      }
      return this.$gettext('Expiration date')
    },

    expirationSupported() {
      return this.userExpirationDate && this.groupExpirationDate
    },

    defaultExpirationDateSet() {
      if (this.editingUser) {
        return this.userExpirationDate.enabled
      }

      if (this.editingGroup) {
        return this.groupExpirationDate.enabled
      }

      return this.userExpirationDate.enabled || this.groupExpirationDate.enabled
    },

    userExpirationDate() {
      return this.capabilities.files_sharing.user.expire_date
    },

    groupExpirationDate() {
      return this.capabilities.files_sharing.group.expire_date
    },

    defaultExpirationDate() {
      if (!this.defaultExpirationDateSet) {
        return null
      }

      const userMaxExpirationDays = parseInt(this.userExpirationDate.days, 10)
      const groupMaxExpirationDays = parseInt(this.groupExpirationDate.days, 10)

      if (this.editingUser) {
        return DateTime.now()
          .plus({ days: userMaxExpirationDays })
          .endOf('day')
          .toISO()
      }

      if (this.editingGroup) {
        return DateTime.now()
          .plus({ days: groupMaxExpirationDays })
          .endOf('day')
          .toISO()
      }

      // Since we are not separating process for adding users and groups as collaborators
      // we are using the one which is smaller as enforced date
      let days = 0

      if (userMaxExpirationDays && groupMaxExpirationDays) {
        days = Math.min(userMaxExpirationDays, groupMaxExpirationDays)
      } else {
        days = userMaxExpirationDays || groupMaxExpirationDays
      }

      return DateTime.now()
        .plus({ days })
        .endOf('day')
        .toISO()
    },

    expirationDateEnforced() {
      if (this.editingUser) {
        return this.userExpirationDate.enforced
      }

      if (this.editingGroup) {
        return this.groupExpirationDate.enforced
      }

      return this.userExpirationDate.enforced || this.groupExpirationDate.enforced
    },

    maxExpirationDate() {
      if (!this.expirationDateEnforced) {
        return null
      }

      return this.defaultExpirationDate
    },

    minExpirationDate() {
      return DateTime.now()
        .plus({ days: 1 })
        .endOf('day')
        .toISO()
    },

    expirationDatePlaceholder() {
      return this.$gettext('Expiration date')
    },

    expirationDateRemoveTooltip() {
      return this.$gettext('Remove expiration date')
    },

    canResetExpirationDate() {
      return !this.expirationDateEnforced && this.enteredExpirationDate
    }
  },

  watch: {
    selectedRole: {
      handler: 'publishChange'
    }
  },

  created() {
    if (
      (this.existingRole && this.existingRole.name === 'advancedRole' && !this.selectedRole) ||
      (this.selectedRole && this.selectedRole.name === 'advancedRole')
    ) {
      this.selectedRole = this.advancedRole
    } else if (this.existingRole && !this.selectedRole) {
      this.selectedRole = this.existingRole
    } else {
      this.selectedRole = this.roles[0]
    }
  },

  mounted() {
    if (this.expirationSupported) {
      if (this.editingUser || this.editingGroup) {
        // FIXME: Datepicker is not displaying correct timezone so for now we add it manually
        this.enteredExpirationDate = this.expirationDate
          ? DateTime.fromJSDate(this.expirationDate)
              .plus({ minutes: DateTime.now().offset })
              .toISO()
          : null
      } else {
        this.enteredExpirationDate = this.defaultExpirationDate
      }
    }
  },

  methods: {
    checkAdditionalPermissions(permissions) {
      this.additionalPermissions = permissions
      this.publishChange()
    },

    setExpirationDate(date) {
      // Expiration date picker is emitting empty string when the component is initialised
      // This ensures it will be null as we treat it everywhere in that way
      this.enteredExpirationDate = date === '' ? null : date
      this.publishChange()
    },

    resetExpirationDate() {
      this.enteredExpirationDate = null
      this.publishChange()
    },

    publishChange() {
      this.$emit('optionChange', {
        role: this.selectedRole,
        permissions: this.additionalPermissions,
        expirationDate: this.enteredExpirationDate
      })
    },

    selectRole(role) {
      this.selectedRole = role
    }
  }
}
</script>

<style lang="scss" scoped>
.files-recipient-role-drop {
  &-list {
    background-color: var(--oc-color-swatch-inverse-default);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);

    &:hover .files-recipient-role-drop-btn.selected:not(:hover),
    &:focus .files-recipient-role-drop-btn.selected:not(:focus) {
      background-color: var(--oc-color-swatch-inverse-default);
      color: var(--oc-color-swatch-passive-default);

      ::v-deep .oc-icon > svg {
        fill: var(--oc-color-swatch-passive-default);
      }
    }
  }

  &-btn {
    border-radius: 0;
    width: 100%;

    &:hover,
    &:focus,
    &.selected {
      background-color: var(--oc-color-swatch-primary-hover);
      color: var(--oc-color-text-inverse);

      ::v-deep .oc-icon > svg {
        fill: var(--oc-color-text-inverse);
      }
    }
  }
}
</style>
