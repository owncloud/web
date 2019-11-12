<template>
  <oc-grid gutter="small" childWidth="1-1">
    <roles-select
      :selectedRole="role"
      @roleSelected="selectRole"
    />
    <div v-if="$_ocCollaborators_currentRoleDescription" class="uk-text-muted" v-text="$_ocCollaborators_currentRoleDescription"></div>
    <hr v-if="$_ocCollaborators_hasAdditionalPermissions" class="divider" />
    <label class="oc-label" v-if="$_ocCollaborators_hasAdditionalPermissions">
      <translate>Additional permissions</translate>
    </label>
    <additional-permissions
      :availablePermissions="role.additionalPermissions"
      :collaboratorsPermissions="collaboratorsPermissions"
      @permissionChecked="checkAdditionalPermissions"
    />
    <hr v-if="$_ocCollaborators_expirationSupported" class="divider" />
    <oc-grid v-if="$_ocCollaborators_expirationSupported" gutter="small">
      <div class="uk-width-1-1">
          <label class="oc-label" for="files-collaborator-new-collaborator-expiration">
            <translate>Expiration date</translate>
            <translate class="uk-text-meta uk-remove-margin">(optional)</translate>
          </label>
          <oc-text-input type="date" class="uk-width-1-1 oc-button-role" id="files-collaborator-new-collaborator-expiration" :value="expirationDate">04 - 07 - 2019</oc-text-input>
      </div>
    </oc-grid>
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
    },
    expirationDate: {
      type: String,
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
    $_ocCollaborators_expirationSupported () {
      return false
    },

    $_ocCollaborators_currentRoleDescription () {
      if (this.selectedRole && this.selectedRole.name !== 'advancedRole') {
        return this.selectedRole.description
      }
      return ''
    },

    $_ocCollaborators_hasAdditionalPermissions () {
      if (this.selectedRole && this.selectedRole.name !== 'advancedRole') {
        return Object.keys(this.selectedRole.additionalPermissions).length > 0
      }
      return false
    },

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

      this.$emit('optionChange', { role: this.selectedRole, permissions: this.additionalPermissions, expirationDate: this.expirationDate, propagate: propagate })
    },

    checkAdditionalPermissions (permissions) {
      this.additionalPermissions = permissions

      this.$emit('optionChange', { role: this.selectedRole, permissions: this.additionalPermissions, expirationDate: this.expirationDate })
    }
  }
}
</script>
