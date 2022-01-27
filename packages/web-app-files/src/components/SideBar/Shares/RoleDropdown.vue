<template>
  <span v-if="selectedRole" class="oc-flex oc-flex-middle">
    <oc-button
      :id="roleButtonId"
      class="files-recipient-role-select-btn"
      appearance="raw"
      gap-size="none"
    >
      <span v-if="!existingRole" v-text="inviteLabel" />
      <span v-else>{{ $gettext(selectedRole.label) }}</span>
      <oc-icon name="arrow-down-s" />
    </oc-button>
    <oc-drop
      ref="rolesDrop"
      :toggle="'#' + roleButtonId"
      mode="click"
      padding-size="remove"
      close-on-click
    >
      <oc-list class="files-recipient-role-drop-list" :aria-label="rolesListAriaLabel">
        <li v-for="role in availableRoles" :key="role.key">
          <oc-button
            :id="`files-recipient-role-drop-btn-${role.name}`"
            ref="roleSelect"
            appearance="raw"
            justify-content="space-between"
            class="files-recipient-role-drop-btn oc-py-xs oc-px-s"
            :class="{ selected: isSelectedRole(role) }"
            @click="selectRole(role)"
          >
            <role-item :role="role" :allow-share-permission="allowSharePermission" />
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
      <h4 class="oc-text-bold oc-text-initial" v-text="$gettext(customPermissionsRole.label)" />
      <oc-list class="oc-mb">
        <li
          v-for="permission in availablePermissions"
          :key="`files-collaborators-permission-${permission.key}`"
          class="oc-my-xs"
        >
          <oc-checkbox
            :id="`files-collaborators-permission-${permission.key}`"
            :key="`files-collaborators-permission-checkbox-${permission.key}`"
            v-model="customPermissions"
            :data-testid="`files-collaborators-permission-${permission.key}`"
            :label="$gettext(permission.label)"
            :option="permission"
            :disabled="isPermissionDisabled(permission)"
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
import { mapGetters } from 'vuex'
import get from 'lodash-es/get'
import RoleItem from '../Shared/RoleItem.vue'
import {
  PeopleShareRoles,
  SharePermissions,
  ShareRole,
  SpacePeopleShareRoles
} from '../../../helpers/share'
import * as uuid from 'uuid'

export default {
  name: 'RoleDropdown',
  components: { RoleItem },
  props: {
    resource: {
      type: Object,
      required: true
    },
    existingRole: {
      type: ShareRole,
      required: false,
      default: undefined
    },
    existingPermissions: {
      type: Array,
      required: false,
      default: () => []
    },
    shareId: {
      type: String,
      required: false,
      default: undefined
    },
    allowSharePermission: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      selectedRole: null,
      customPermissions: []
    }
  },
  computed: {
    ...mapGetters(['capabilities']),

    roleButtonId() {
      if (this.shareId) {
        return `files-collaborators-role-button-${this.shareId}-${uuid.v4()}`
      }
      return 'files-collaborators-role-button-new'
    },
    rolesListAriaLabel() {
      return this.$gettext('Select role for the invitation')
    },
    inviteLabel() {
      if (this.selectedRole.hasCustomPermissions) {
        return this.$gettext('Invite with custom permissions')
      } else {
        return this.$gettextInterpolate(this.$gettext('Invite as %{ name }'), {
          name: this.selectedRole.inlineLabel || ''
        })
      }
    },
    customPermissionsRole() {
      return PeopleShareRoles.custom(this.resource.isFolder)
    },
    availableRoles() {
      if (this.resourceIsSpace) {
        return SpacePeopleShareRoles.list()
      }
      return PeopleShareRoles.list(
        this.resource.isFolder,
        this.capabilities.files_sharing.allow_custom !== false
      )
    },
    availablePermissions() {
      return this.customPermissionsRole.permissions(this.allowSharePermission)
    },
    resourceIsSpace() {
      return this.resource.type === 'space'
    }
  },

  created() {
    this.applyRoleAndPermissions()
  },

  beforeDestroy() {
    window.removeEventListener('keydown', this.cycleRoles)
  },

  mounted() {
    this.applyRoleAndPermissions()
    window.addEventListener('keydown', this.cycleRoles)
  },

  methods: {
    applyRoleAndPermissions() {
      if (this.existingRole) {
        this.selectedRole = this.existingRole
      } else if (this.resourceIsSpace) {
        this.selectedRole = SpacePeopleShareRoles.list()[0]
      } else {
        this.selectedRole = PeopleShareRoles.list(this.resource.isFolder)[0]
      }

      if (this.selectedRole.hasCustomPermissions) {
        this.customPermissions = this.existingPermissions
      } else {
        this.customPermissions = [...this.selectedRole.permissions(this.allowSharePermission)]
      }
    },

    publishChange() {
      this.$emit('optionChange', {
        role: this.selectedRole,
        permissions: this.customPermissions
      })
    },

    selectRole(role) {
      if (role.hasCustomPermissions) {
        this.$refs.customPermissionsDrop.show()
        return
      }
      this.selectedRole = role
      this.customPermissions = role.permissions(this.allowSharePermission)
      this.publishChange()
    },

    isSelectedRole(role) {
      return this.selectedRole.name === role.name
    },

    isPermissionDisabled(permission) {
      return permission.bit === SharePermissions.read.bit
    },

    confirmCustomPermissions() {
      this.$refs.customPermissionsDrop.hide()
      const bitmask = SharePermissions.permissionsToBitmask(this.customPermissions)
      this.selectedRole = PeopleShareRoles.getByBitmask(
        bitmask,
        this.resource.isFolder,
        this.allowSharePermission
      )
      this.publishChange()
    },

    cancelCustomPermissions() {
      this.customPermissions = this.existingPermissions
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
