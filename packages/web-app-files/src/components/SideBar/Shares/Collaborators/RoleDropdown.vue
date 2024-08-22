<template>
  <span v-if="selectedRole" class="oc-flex oc-flex-middle">
    <span v-if="availableRoles.length === 1">
      <oc-icon v-if="showIcon" :name="selectedRole.icon" class="oc-mr-s" />
      <span v-text="inviteLabel" />
    </span>
    <div v-else v-oc-tooltip="dropButtonTooltip">
      <oc-button
        :id="roleButtonId"
        class="files-recipient-role-select-btn"
        appearance="raw"
        gap-size="none"
        :disabled="isLocked"
        :aria-label="
          mode === 'create' ? $gettext('Select permission') : $gettext('Edit permission')
        "
      >
        <oc-icon v-if="showIcon" :name="selectedRole.icon" class="oc-mr-s" />
        <span class="oc-text-truncate" v-text="inviteLabel" />
        <oc-icon name="arrow-down-s" />
      </oc-button>
      <oc-contextual-helper
        v-if="isDisabledRole"
        class="oc-ml-xs files-permission-actions-list"
        :list="existingSharePermissions.map((permission) => ({ text: $gettext(permission) }))"
      />
    </div>
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
      <oc-list
        class="files-recipient-role-drop-list"
        :aria-label="$gettext('Select role for the invitation')"
      >
        <li v-for="role in availableRoles" :key="role.id">
          <oc-button
            :id="`files-recipient-role-drop-btn-${role.id}`"
            ref="roleSelect"
            justify-content="space-between"
            class="files-recipient-role-drop-btn oc-p-s"
            :class="{
              'oc-background-primary-gradient': isSelectedRole(role),
              selected: isSelectedRole(role)
            }"
            :appearance="isSelectedRole(role) ? 'raw-inverse' : 'raw'"
            :variation="isSelectedRole(role) ? 'primary' : 'passive'"
            @click="selectRole(role)"
          >
            <span class="oc-flex oc-flex-middle">
              <oc-icon :name="role.icon" class="oc-pl-s oc-pr-m" variation="inherit" />
              <role-item :role="role" />
            </span>
            <span class="oc-flex">
              <oc-icon v-if="isSelectedRole(role)" name="check" variation="inherit" />
            </span>
          </oc-button>
        </li>
      </oc-list>
    </oc-drop>
  </span>
</template>

<script lang="ts">
import get from 'lodash-es/get'
import { storeToRefs } from 'pinia'
import RoleItem from '../Shared/RoleItem.vue'
import * as uuid from 'uuid'
import {
  defineComponent,
  inject,
  PropType,
  ComponentPublicInstance,
  computed,
  ref,
  unref,
  Ref
} from 'vue'
import { useAbility, useUserStore } from '@ownclouders/web-pkg'
import { Resource } from '@ownclouders/web-client'
import { useGettext } from 'vue3-gettext'
import { ShareRole } from '@ownclouders/web-client'
import { $gettext } from '@ownclouders/web-pkg/src/router/utils'

export default defineComponent({
  name: 'RoleDropdown',
  components: { RoleItem },
  props: {
    existingShareRole: {
      type: Object as PropType<ShareRole>,
      required: false,
      default: undefined
    },
    existingSharePermissions: {
      type: Array as PropType<string[]>,
      required: false,
      default: () => []
    },
    domSelector: {
      type: String,
      required: false,
      default: undefined
    },
    mode: {
      type: String,
      required: false,
      default: 'create'
    },
    showIcon: {
      type: Boolean,
      default: false
    },
    isLocked: {
      type: Boolean,
      default: false
    },
    // only show external share roles
    isExternal: {
      type: Boolean,
      default: false
    }
  },
  emits: ['optionChange'],
  setup(props, { emit }) {
    const ability = useAbility()
    const userStore = useUserStore()
    const { user } = storeToRefs(userStore)
    const { $gettext } = useGettext()

    const dropButtonTooltip = computed(() => {
      if (props.isLocked) {
        return $gettext('Resource is temporarily locked, unable to manage share')
      }

      return ''
    })

    const availableInternalRoles = inject<Ref<ShareRole[]>>('availableInternalShareRoles')
    const availableExternalRoles = inject<Ref<ShareRole[]>>('availableExternalShareRoles')
    const availableRoles = computed(() => {
      if (props.isExternal) {
        return unref(availableExternalRoles)
      }
      return unref(availableInternalRoles)
    })

    let initialSelectedRole: ShareRole
    const hasExistingShareRole = computed(() => !!props.existingShareRole)
    const hasExistingSharePermissions = computed(() => !!props.existingSharePermissions.length)
    const isDisabledRole = computed(
      () => !unref(hasExistingShareRole) && unref(hasExistingSharePermissions)
    )
    switch (true) {
      // if no role is set and no permissions are set, we use the first available role as the default
      case !unref(hasExistingShareRole) && !unref(hasExistingSharePermissions):
        initialSelectedRole = unref(availableRoles)[0]
        break
      // in the rare case that a role is disabled and permissions are set aka a disabled unified role ...
      case unref(isDisabledRole):
        // ... we need to create a fake role as an indicator that the permissions are custom
        initialSelectedRole = {
          displayName: $gettext('Custom permissions')
        }
        break
      default:
        initialSelectedRole = props.existingShareRole
        break
    }

    const selectedRole = ref<ShareRole>(initialSelectedRole)
    const isSelectedRole = (role: ShareRole) => {
      return unref(selectedRole).id === role.id
    }

    const selectRole = (role: ShareRole) => {
      selectedRole.value = role
      emit('optionChange', unref(selectedRole))
    }

    return {
      ability,
      user,
      dropButtonTooltip,
      resource: inject<Resource>('resource'),
      selectedRole,
      availableRoles,
      isSelectedRole,
      selectRole,
      isDisabledRole
    }
  },
  computed: {
    roleButtonId() {
      if (this.domSelector) {
        return `files-collaborators-role-button-${this.domSelector}-${uuid.v4()}`
      }
      return 'files-collaborators-role-button-new'
    },
    inviteLabel() {
      return this.$gettext(this.selectedRole?.displayName || '')
    }
  },

  beforeUnmount() {
    window.removeEventListener('keydown', this.cycleRoles)
  },

  mounted() {
    window.addEventListener('keydown', this.cycleRoles)
  },

  methods: {
    $gettext,
    cycleRoles(event: KeyboardEvent) {
      // events only need to be captured if the roleSelect element is visible
      if (!get(this.$refs.rolesDrop, 'tippy.state.isShown', false)) {
        return
      }

      const { code } = event
      const isArrowUp = code === 'ArrowUp'
      const isArrowDown = code === 'ArrowDown'

      // to cycle through the list of roles only up and down keyboard events are allowed
      // if this is not the case we can return early and stop the script execution from here
      if (!isArrowUp && !isArrowDown) {
        return
      }

      // if there is only 1 or no roleSelect we can early return
      // it does not make sense to cycle through it if value is less than 1
      const roleSelect = (this.$refs.roleSelect as ComponentPublicInstance[]) || []

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
      const activateRoleSelect = (idx: number) => roleSelect[idx].$el.focus()

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
    @media (max-width: $oc-breakpoint-medium-default) {
      width: 100%;
    }
    @media (min-width: $oc-breakpoint-medium-default) {
      width: 400px;
    }

    &-list {
      li {
        margin: var(--oc-space-xsmall) 0;

        &:first-child {
          margin-top: 0;
        }
        &:last-child {
          margin-bottom: 0;
        }
      }
    }

    &-btn {
      width: 100%;
      gap: var(--oc-space-medium);

      &:hover,
      &:focus {
        background-color: var(--oc-color-background-hover);
        text-decoration: none;
      }
    }
  }
  &-role-select-btn {
    max-width: 100%;
  }
}
</style>
