<template>
  <oc-grid gutter="small" childWidth="1-1">
    <roles-select
      :selectedRole="role"
      @roleSelected="selectRole"
    />
    <additional-permissions
      :availablePermissions="role.additionalPermissions"
      :collaboratorsPermissions="collaboratorsPermissions"
      @permissionChecked="checkAdditionalPermissions"
    />
  </oc-grid>
</template>

<script>
import collaboratorsMixins from '../../mixins/collaborators'

const RolesSelect = () => import('./RolesSelect.vue')
const AdditionalPermissions = () => import('./AdditionalPermissions.vue')

export default {
  name: 'CollaboratorsEditOptions',
  mixins: [
    collaboratorsMixins
  ],
  props: {
    existingRole: {
      type: Object,
      required: false
    },
    collaboratorsPermissions: {
      type: Object,
      required: false
    }
  },
  components: {
    RolesSelect,
    AdditionalPermissions
  },
  data () {
    return {
      selectedRole: null,
      additionalPermissions: null
    }
  },
  computed: {
    role () {
      // Returns default role
      if (!this.existingRole && !this.selectedRole) {
        const defaultRole = this.roles[Object.keys(this.roles)[0]]
        this.selectRole(defaultRole, false)
        return defaultRole
      }

      if (
        (
          this.existingRole && this.existingRole.name === 'advancedRole' && !this.selectedRole
        ) || (
          this.selectedRole && this.selectedRole.name === 'advancedRole'
        )
      ) {
        this.selectRole(this.advancedRole, false)
        return this.advancedRole
      }

      if (this.existingRole && !this.selectedRole) {
        this.selectRole(this.existingRole, false)
        return this.existingRole
      }

      return this.selectedRole
    }
  },
  methods: {
    selectRole (role, propagate = true) {
      this.selectedRole = role

      this.$emit('optionChange', { role: this.selectedRole, permissions: this.additionalPermissions, propagate: propagate })
    },

    checkAdditionalPermissions (permissions) {
      this.additionalPermissions = permissions

      this.$emit('optionChange', { role: this.selectedRole, permissions: this.additionalPermissions })
    }
  }
}
</script>
