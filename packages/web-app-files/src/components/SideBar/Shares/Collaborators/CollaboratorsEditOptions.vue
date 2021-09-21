<template>
  <div class="recipient-edit-options">
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
    <template v-if="expirationSupported">
      <date-picker
        v-model="enteredExpirationDate"
        :min-date="minExpirationDate"
        :max-date="maxExpirationDate"
        :locale="$language.current"
        class="files-recipient-expiration-datepicker"
        data-testid="recipient-datepicker"
      >
        <template #default="{ togglePopover }">
          <oc-button
            id="files-collaborators-expiration-button"
            class="expiration-dialog-btn"
            data-testid="recipient-datepicker-btn"
            appearance="raw"
            justify-content="left"
            gap-size="xsmall"
            @click="togglePopover"
          >
            <translate v-if="!enteredExpirationDate" key="no-expiration-date-label"
              >Set expiration date</translate
            >
            <translate
              v-else
              key="set-expiration-date-label"
              :translate-params="{ expires: relativeExpirationDate }"
            >
              Expires %{expires}
            </translate>
            <oc-icon v-if="!enteredExpirationDate" name="expand_more" />
          </oc-button>
        </template>
      </date-picker>
      <oc-button
        v-if="!expirationDateEnforced && enteredExpirationDate"
        data-testid="recipient-edit-expiration-btn-remove"
        appearance="raw"
        :aria-label="$gettext('Remove expiration date')"
        @click="clearExpirationDate"
      >
        <oc-icon name="close" />
      </oc-button>
    </template>
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
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { DateTime } from 'luxon'
import get from 'lodash-es/get'
import DatePicker from 'v-calendar/lib/components/date-picker.umd'

import collaboratorsMixins from '../../../../mixins/collaborators'

import RoleItem from '../../Shared/RoleItem.vue'
import AdditionalPermissions from './AdditionalPermissions.vue'

export default {
  name: 'CollaboratorsEditOptions',

  components: {
    RoleItem,
    AdditionalPermissions,
    DatePicker
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
      let days = 0

      if (this.editingUser) {
        days = userMaxExpirationDays
      } else if (this.editingGroup) {
        days = groupMaxExpirationDays
      } else if (userMaxExpirationDays && groupMaxExpirationDays) {
        days = Math.min(userMaxExpirationDays, groupMaxExpirationDays)
      } else {
        days = userMaxExpirationDays || groupMaxExpirationDays
      }

      const date = new Date()

      date.setDate(new Date().getDate() + days)

      return date
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
      const date = new Date()

      date.setDate(new Date().getDate() + 1)

      return date
    },

    isAdvancedRoleSelected() {
      return this.isAdvancedRole(this.selectedRole)
    },

    rolesListAriaLabel() {
      return this.$gettext('Sharing roles')
    },

    relativeExpirationDate() {
      return DateTime.fromJSDate(this.enteredExpirationDate)
        .setLocale(this.$language.current)
        .endOf('day')
        .toRelative()
    }
  },

  watch: {
    selectedRole: {
      handler: 'publishChange'
    },

    enteredExpirationDate: {
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
        this.enteredExpirationDate = this.expirationDate
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

    publishChange() {
      this.$emit('optionChange', {
        role: this.selectedRole,
        permissions: this.additionalPermissions,
        expirationDate: DateTime.fromJSDate(this.enteredExpirationDate)
          .endOf('day')
          .toISO()
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
      const isArrowUp = keyCode === 38
      const isArrowDown = keyCode === 40

      // to cycle through the list of roles only up and down keyboard events are allowed
      // if this is not the case we can return early and stop the script execution from here
      if (!isArrowUp && !isArrowDown) {
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
      if (isArrowUp && activeRoleSelectIndex - 1 < 0) {
        activateRoleSelect(roleSelect.length - 1)

        return
      }

      // if the event key is arrow down
      // and the next active role select index would be greater or even to the available amount of role selects
      // then activate the first available role select
      if (isArrowDown && activeRoleSelectIndex + 1 >= roleSelect.length) {
        activateRoleSelect(0)

        return
      }

      // the only missing part is to navigate up or down, this only happens if:
      // the next active role index is greater than 0
      // the next active role index is less than the amount of all available role selects
      activateRoleSelect(activeRoleSelectIndex + (isArrowUp ? -1 : 1))
    },

    disabledExpirationDates(date) {
      return date < this.minExpirationDate || date > this.maxExpirationDate
    },

    clearExpirationDate() {
      this.enteredExpirationDate = null
    }
  }
}
</script>

<style lang="scss" scoped>
.recipient-edit-options {
  align-items: center;
  display: flex;
  gap: var(--oc-space-small);
}

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
      background-color: var(--oc-color-swatch-primary-default);
      color: var(--oc-color-text-inverse);

      ::v-deep .oc-icon > svg {
        fill: var(--oc-color-text-inverse);
      }
    }
  }
}

.files-recipient-expiration-datepicker::v-deep .vc-highlight {
  // `!important` to overwrite the inline style
  background-color: var(--oc-color-swatch-primary-default) !important;
}
</style>
