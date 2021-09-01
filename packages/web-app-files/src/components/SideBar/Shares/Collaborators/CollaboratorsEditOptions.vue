<template>
  <div>
    <hr />
    <oc-button
      id="files-collaborators-role-button"
      appearance="raw"
      justify-content="left"
      gap-size="xsmall"
    >
      <translate v-if="isAdvancedRoleSelected" key="advanced-permissions-select"
        >Invite with custom permissions</translate
      >
      <translate v-else key="role-select" :translate-params="{ name: selectedRole.inlineLabel }"
        >Invite as %{ name }</translate
      >
      <oc-icon name="expand_more" />
    </oc-button>
    <oc-drop ref="rolesDrop" toggle="#files-collaborators-role-button" mode="click" close-on-click>
      <template #special>
        <oc-list class="files-recipient-role-drop-list" :aria-label="rolesListAriaLabel">
          <li v-for="role in roles" :key="role.name">
            <oc-button
              ref="roleSelect"
              appearance="raw"
              justify-content="space-between"
              class="files-recipient-role-drop-btn oc-py-xs oc-px-s"
              :class="{ selected: isSelectedRole(role) }"
              @click="selectRole(role)"
            >
              <role-item :role="role" />
              <oc-icon v-if="isSelectedRole(role)" name="check" />
            </oc-button>
          </li>
        </oc-list>
      </template>
    </oc-drop>
    <template v-if="$_ocCollaborators_hasAdditionalPermissions">
      <label v-if="!isAdvancedRoleSelected" class="oc-label oc-mt-s">
        <translate>Additional permissions</translate>
      </label>
      <additional-permissions
        :available-permissions="selectedRole.additionalPermissions"
        :collaborators-permissions="collaboratorsPermissions"
        :class="{ 'oc-mt-s': isAdvancedRoleSelected }"
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
      <hr />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { DateTime } from 'luxon'
import get from 'lodash-es/get'

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
        return ['user', 'group'].includes(value) || value === null
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
    },

    isAdvancedRoleSelected() {
      return this.isAdvancedRole(this.selectedRole)
    },

    rolesListAriaLabel() {
      return this.$gettext('Sharing roles')
    }
  },

  watch: {
    selectedRole: {
      handler: 'publishChange'
    }
  },

  created() {
    if (
      (this.existingRole && this.isAdvancedRole(this.existingRole) && !this.selectedRole) ||
      (this.selectedRole && this.isAdvancedRoleSelected)
    ) {
      this.selectedRole = this.advancedRole
    } else if (this.existingRole && !this.selectedRole) {
      this.selectedRole = this.existingRole
    } else {
      this.selectedRole = this.roles[0]
    }
  },

  beforeDestroy() {
    window.removeEventListener('keydown', this.cycleRoles)
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

    window.addEventListener('keydown', this.cycleRoles)
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
    },

    isSelectedRole(role) {
      return this.selectedRole.name === role.name
    },

    isAdvancedRole(role) {
      return role.name === 'advancedRole'
    },

    cycleRoles(event) {
      // events only need to be captured if the roleSelect element is visible
      if (!get(this.$refs.rolesDrop, 'tippy.state.isShown', false)) {
        return
      }

      const { keyCode } = event
      const isKeyUpEvent = keyCode === 38
      const isKeyDownEvent = keyCode === 40

      // to cycle through the list of roles only up and down keyboard events are allowed
      // if this is not the case we can return early and stop the script execution from here
      if (!isKeyUpEvent && !isKeyDownEvent) {
        return
      }

      // if there is only 1 or no roleSelect we can early return
      // it does not make sense to cycle through it if value is less than 1
      const roleSelect = this.$refs.roleSelect || []

      if (roleSelect.length <= 1) {
        return
      }

      // obtain active role select in following priority chain:
      // first try to get the focused select
      // then try to get the selected select
      // and if none of those applies we fall back to the first role select
      const activeRoleSelect =
        roleSelect.find(rs => rs.$el === document.activeElement) ||
        roleSelect.find(rs => rs.$el.classList.contains('selected')) ||
        roleSelect[0]
      const activeRoleSelectIndex = roleSelect.indexOf(activeRoleSelect)
      const activateRoleSelect = idx => roleSelect[idx].$el.focus()

      // if the event key is arrow up
      // and the next active role select index would be less than 0
      // then activate the last available role select
      if (isKeyUpEvent && activeRoleSelectIndex - 1 < 0) {
        activateRoleSelect(roleSelect.length - 1)

        return
      }

      // if the event key is arrow down
      // and the next active role select index would be greater or even to the available amount of role selects
      // then activate the first available role select
      if (isKeyDownEvent && activeRoleSelectIndex + 1 >= roleSelect.length) {
        activateRoleSelect(0)

        return
      }

      // the only missing part is to navigate up or down, this only happens if:
      // the next active role index is greater than 0
      // the next active role index is less than the amount of all available role selects
      activateRoleSelect(activeRoleSelectIndex + (isKeyUpEvent ? -1 : 1))
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
