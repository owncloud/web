<template>
  <span>
    <oc-button
      :id="roleButtonId"
      class="files-recipient-role-select-btn"
      appearance="raw"
      gap-size="none"
    >
      <span v-if="!existingRole" v-text="inviteLabel" />
      <span v-else>{{ selectedRole.label }}</span>
      <oc-icon name="expand_more" />
    </oc-button>
    <oc-drop
      ref="rolesDrop"
      :toggle="'#' + roleButtonId"
      mode="click"
      padding-size="remove"
      close-on-click
    >
      <oc-list class="files-recipient-role-drop-list" :aria-label="rolesListAriaLabel">
        <li v-for="role in roles" :key="role.name">
          <oc-button
            :id="`files-recipient-role-drop-btn-${role.name}`"
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
    </oc-drop>
    <oc-drop
      ref="customPermissionsDrop"
      class="files-recipient-custom-permissions-drop"
      mode="manual"
      :target="'#' + roleButtonId"
      padding-size="small"
    >
      <h4 class="oc-text-bold oc-text-initial" v-text="customPermissionsDropTitle" />
      <oc-list class="oc-mb">
        <li class="oc-my-xs">
          <oc-checkbox
            :label="readingRoleCheckboxLabel"
            :value="true"
            :disabled="true"
            class="oc-mr-xs files-collaborators-permission-checkbox"
          />
        </li>
        <li
          v-for="permission in advancedRole.additionalPermissions"
          :key="permission.name"
          class="oc-my-xs"
        >
          <oc-checkbox
            :id="`files-collaborators-permission-${permission.name}`"
            :key="permission.name"
            v-model="customPermissions"
            :data-testid="`files-collaborators-permission-${permission.name}`"
            :label="permission.description"
            :option="permission.name"
            class="oc-mr-xs files-collaborators-permission-checkbox"
          />
        </li>
      </oc-list>
      <div class="files-recipient-custom-permissions-drop-cancel-confirm-btns">
        <oc-button size="small" @click="cancelCustomPermissions" v-text="$gettext('Cancel')" />
        <oc-button
          size="small"
          variation="primary"
          appearance="filled"
          @click="confirmCustomPermissions"
          v-text="$gettext('Apply')"
        />
      </div>
    </oc-drop>
  </span>
</template>

<script>
import get from 'lodash-es/get'
import collaboratorsMixins from '../../../mixins/collaborators'
import RoleItem from '../Shared/RoleItem.vue'

export default {
  name: 'RoleSelection',
  components: { RoleItem },
  mixins: [collaboratorsMixins],
  props: {
    existingRole: {
      type: Object,
      required: false,
      default: undefined
    },
    collaboratorsPermissions: {
      type: Array,
      required: false,
      default: () => []
    },
    collaboratorId: {
      type: String,
      required: false,
      default: undefined
    }
  },
  data() {
    return {
      selectedRole: null,
      customPermissions: []
    }
  },
  computed: {
    roleButtonId() {
      if (this.collaboratorId) {
        return `files-collaborators-role-button-${this.collaboratorId}`
      }
      return 'files-collaborators-role-button-new'
    },
    readingRoleCheckboxLabel() {
      return this.$gettext('Read')
    },
    customPermissionsDropTitle() {
      return this.$gettext('Custom permissions')
    },
    rolesListAriaLabel() {
      return this.$gettext('Select role for the share')
    },
    inviteLabel() {
      if (this.selectedRole?.name === 'advancedRole') {
        return this.$gettext('Invite with custom permissions')
      } else {
        return this.$gettextInterpolate('Invite as %{ name }', {
          name: this.selectedRole?.inlineLabel || ''
        })
      }
    }
  },

  created() {
    if (this.existingRole) {
      this.selectedRole = this.existingRole
      this.customPermissions = this.collaboratorsPermissions
    } else {
      this.selectedRole = this.roles[0]
    }
  },

  beforeDestroy() {
    window.removeEventListener('keydown', this.cycleRoles)
  },

  mounted() {
    window.addEventListener('keydown', this.cycleRoles)
  },

  methods: {
    publishChange() {
      this.$emit('optionChange', {
        role: this.selectedRole,
        permissions: this.customPermissions
      })
    },

    selectRole(role) {
      if (role.name === 'advancedRole') {
        this.$refs.customPermissionsDrop.show()
        return
      }
      this.selectedRole = role
      this.publishChange()
    },

    isSelectedRole(role) {
      return this.selectedRole?.name === role.name
    },

    confirmCustomPermissions() {
      this.$refs.customPermissionsDrop.hide()
      this.selectedRole = this.advancedRole
      this.publishChange()
    },

    cancelCustomPermissions() {
      this.customPermissions = this.collaboratorsPermissions
      this.$refs.customPermissionsDrop.hide()
      this.$refs.rolesDrop.show()
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
        roleSelect.find((rs) => rs.$el === document.activeElement) ||
        roleSelect.find((rs) => rs.$el.classList.contains('selected')) ||
        roleSelect[0]
      const activeRoleSelectIndex = roleSelect.indexOf(activeRoleSelect)
      const activateRoleSelect = (idx) => roleSelect[idx].$el.focus()

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
    }
  }
}
</script>

<style lang="scss" scoped>
.files-recipient {
  &-role-drop {
    &-list {
      &:hover .files-recipient-role-drop-btn.selected:not(:hover),
      &:focus .files-recipient-role-drop-btn.selected:not(:focus) {
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
      &:focus {
        color: var(--oc-color-text-default) !important;
      }

      &.selected {
        background-color: var(--oc-color-swatch-primary-default) !important;
        color: var(--oc-color-text-inverse) !important;

        ::v-deep .oc-icon > svg {
          fill: var(--oc-color-text-inverse) !important;
        }
      }
    }
  }
}
</style>
