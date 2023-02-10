<template>
  <span v-if="selectedRole" class="oc-flex oc-flex-middle">
    <span v-if="availableRoles.length === 1">
      <span v-if="!existingRole" v-text="inviteLabel" />
      <span v-else>{{ $gettext(selectedRole.label) }}</span>
    </span>
    <oc-button
      v-else
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
      v-if="availableRoles.length > 1"
      ref="rolesDrop"
      :toggle="'#' + roleButtonId"
      mode="click"
      padding-size="small"
      class="files-recipient-role-drop"
      offset="0"
      close-on-click
    >
      <oc-list class="files-recipient-role-drop-list" :aria-label="rolesListAriaLabel">
        <li v-for="role in availableRoles" :key="role.key">
          <oc-button
            :id="`files-recipient-role-drop-btn-${role.name}`"
            ref="roleSelect"
            appearance="raw"
            justify-content="space-between"
            class="files-recipient-role-drop-btn oc-p-s"
            :class="{
              'oc-background-primary-gradient': isSelectedRole(role),
              selected: isSelectedRole(role)
            }"
            :variation="isSelectedRole(role) ? 'inverse' : 'passive'"
            @click="selectRole(role)"
          >
            <span class="oc-flex oc-flex-middle">
              <oc-icon :name="role.icon" class="oc-pl-s oc-pr-m" />
              <role-item
                :role="role"
                :allow-share-permission="allowSharePermission && resharingDefault"
              />
            </span>
            <span class="oc-flex">
              <oc-icon v-if="isSelectedRole(role)" name="check" />
            </span>
          </oc-button>
        </li>
      </oc-list>
    </oc-drop>
    <oc-drop
      v-if="availableRoles.length > 1"
      ref="customPermissionsDrop"
      class="files-recipient-custom-permissions-drop"
      mode="manual"
      :target="'#' + roleButtonId"
      padding-size="remove"
    >
      <h4
        class="oc-text-bold oc-m-rm oc-px-m oc-pt-m oc-pb-s"
        v-text="$gettext(customPermissionsRole.label)"
      />
      <oc-list>
        <li
          v-for="permission in availablePermissions"
          :key="`files-collaborators-permission-${permission.key}`"
          class="oc-my-s oc-px-m"
        >
          <oc-checkbox
            :id="`files-collaborators-permission-${permission.key}`"
            :key="`files-collaborators-permission-checkbox-${permission.key}`"
            v-model="customPermissions"
            size="large"
            :data-testid="`files-collaborators-permission-${permission.key}`"
            :label="$gettext(permission.label)"
            :option="permission"
            :disabled="isPermissionDisabled(permission)"
            class="oc-mr-xs files-collaborators-permission-checkbox"
          />
        </li>
      </oc-list>
      <div
        class="files-recipient-custom-permissions-drop-cancel-confirm-btns oc-px-m oc-py-s oc-mt-m oc-rounded-bottom"
      >
        <oc-button
          size="small"
          class="files-recipient-custom-permissions-drop-cancel"
          @click="cancelCustomPermissions"
          v-text="$gettext('Cancel')"
        /><oc-button
          size="small"
          variation="primary"
          appearance="filled"
          class="files-recipient-custom-permissions-drop-confirm oc-ml-s"
          @click="confirmCustomPermissions"
          v-text="$gettext('Apply')"
        />
      </div>
    </oc-drop>
  </span>
</template>

<script lang="ts">
import get from 'lodash-es/get'
import RoleItem from '../Shared/RoleItem.vue'
import {
  PeopleShareRoles,
  SharePermissions,
  ShareRole,
  SpacePeopleShareRoles
} from 'web-client/src/helpers/share'
import * as uuid from 'uuid'
import { defineComponent, inject, PropType } from 'vue'
import {
  useCapabilityFilesSharingAllowCustomPermissions,
  useCapabilityFilesSharingCanDenyAccess,
  useCapabilityFilesSharingResharingDefault,
  useStore
} from 'web-pkg/src/composables'
import { Resource } from 'web-client'

export default defineComponent({
  name: 'RoleDropdown',
  components: { RoleItem },
  props: {
    existingRole: {
      type: Object as PropType<ShareRole>,
      required: false,
      default: undefined
    },
    existingPermissions: {
      type: Array,
      required: false,
      default: () => []
    },
    domSelector: {
      type: String,
      required: false,
      default: undefined
    },
    allowSharePermission: {
      type: Boolean,
      required: true
    }
  },
  emits: ['optionChange'],
  setup() {
    const store = useStore()
    return {
      resource: inject<Resource>('resource'),
      incomingParentShare: inject<Resource>('incomingParentShare'),
      hasRoleDenyAccess: useCapabilityFilesSharingCanDenyAccess(store),
      hasRoleCustomPermissions: useCapabilityFilesSharingAllowCustomPermissions(store),
      resharingDefault: useCapabilityFilesSharingResharingDefault(store)
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
      if (this.domSelector) {
        return `files-collaborators-role-button-${this.domSelector}-${uuid.v4()}`
      }
      return 'files-collaborators-role-button-new'
    },
    rolesListAriaLabel() {
      return this.$gettext('Select role for the invitation')
    },
    inviteLabel() {
      if (this.selectedRole.hasCustomPermissions) {
        return this.$gettext('Invite with custom permissions')
      } else if (this.selectedRole.permissions().includes(SharePermissions.denied)) {
        return this.$gettext('Deny access')
      } else {
        const name = this.$gettext(this.selectedRole.inlineLabel) || ''
        return this.$gettext('Invite as %{ name }', { name })
      }
    },
    customPermissionsRole() {
      return PeopleShareRoles.custom(this.resource.isFolder)
    },
    resourceIsSharable() {
      return this.allowSharePermission && this.resource.canShare()
    },
    availableRoles() {
      if (this.resourceIsSpace) {
        return SpacePeopleShareRoles.list()
      }

      if (this.incomingParentShare && this.resourceIsSharable) {
        return PeopleShareRoles.filterByBitmask(
          parseInt(this.incomingParentShare.permissions),
          this.resource.isFolder,
          this.allowSharePermission,
          this.hasRoleCustomPermissions
        )
      }

      const canDeny = this.resource.canDeny() && this.hasRoleDenyAccess
      return PeopleShareRoles.list(this.resource.isFolder, this.hasRoleCustomPermissions, canDeny)
    },
    availablePermissions() {
      if (this.incomingParentShare && this.resourceIsSharable) {
        return SharePermissions.bitmaskToPermissions(parseInt(this.incomingParentShare.permissions))
      }
      return this.customPermissionsRole.permissions(this.allowSharePermission)
    },
    resourceIsSpace() {
      return this.resource.type === 'space'
    },
    defaultCustomPermissions() {
      return [...this.selectedRole.permissions(this.allowSharePermission && this.resharingDefault)]
    }
  },

  created() {
    this.applyRoleAndPermissions()
  },

  beforeUnmount() {
    window.removeEventListener('keydown', this.cycleRoles)
  },

  mounted() {
    window.addEventListener('keydown', this.cycleRoles)
  },

  methods: {
    applyRoleAndPermissions() {
      if (this.existingRole) {
        this.selectedRole = this.existingRole
      } else if (this.resourceIsSpace) {
        this.selectedRole = SpacePeopleShareRoles.list()[0]
      } else {
        const canDeny = this.resource.canDeny() && this.hasRoleDenyAccess
        this.selectedRole = PeopleShareRoles.list(
          this.resource.isFolder,
          this.hasRoleCustomPermissions,
          canDeny
        )[0]
      }

      this.customPermissions = this.selectedRole.hasCustomPermissions
        ? this.existingPermissions
        : this.defaultCustomPermissions
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
      this.customPermissions = role.permissions(this.allowSharePermission && this.resharingDefault)
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
        this.allowSharePermission && this.resharingDefault
      )
      this.publishChange()
    },

    cancelCustomPermissions() {
      this.customPermissions = this.existingPermissions.length
        ? this.existingPermissions
        : this.defaultCustomPermissions
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
})
</script>

<style lang="scss" scoped>
.files-recipient {
  &-role-drop {
    width: 400px;

    &-list {
      &:hover .files-recipient-role-drop-btn.selected:not(:hover),
      &:focus .files-recipient-role-drop-btn.selected:not(:focus) {
        color: var(--oc-color-swatch-passive-default);

        ::v-deep .oc-icon > svg {
          fill: var(--oc-color-swatch-passive-default);
        }
      }

      li {
        margin: var(--oc-space-xsmall) 0;
      }
    }

    &-btn {
      width: 100%;
      gap: var(--oc-space-medium);

      &:hover,
      &:focus {
        background-color: var(--oc-color-background-hover);
        color: var(--oc-color-swatch-passive-default);
        text-decoration: none;
      }

      &.selected {
        color: var(--oc-color-swatch-inverse-default) !important;

        ::v-deep .oc-icon > svg {
          fill: var(--oc-color-swatch-inverse-default) !important;
        }
      }
    }
  }

  &-custom-permissions-drop-cancel-confirm-btns {
    background: var(--oc-color-background-hover);
    text-align: right;
  }
}

.files-collaborators-permission-checkbox::v-deep {
  .oc-checkbox {
    border: 2px solid var(--oc-color-border);
  }

  label {
    margin-left: var(--oc-space-small);
  }
}
</style>
