import { mapGetters, mapActions } from 'vuex'
import roles from '../helpers/collaboratorRolesDefinition'

export default {
  computed: {
    ...mapGetters(['getToken']),
    ...mapGetters('Files', ['highlightedFile']),

    ownerRole () {
      return {
        name: 'owner',
        label: this.$gettext('Owner')
      }
    },

    resharerRole () {
      return {
        name: 'resharer',
        label: this.$gettext('Resharer')
      }
    },

    advancedRole () {
      const advancedRole = {
        name: 'advancedRole',
        label: this.$gettext('Advanced permissions'),
        description: this.$gettext('Set detailed permissions'),
        permissions: ['read'],
        additionalPermissions: {
          share: {
            name: 'share',
            description: this.$gettext('Allow re-Sharing')
          },
          update: {
            name: 'update',
            description: this.$gettext('Allow editing')
          }
        }
      }

      if (this.highlightedFile.type === 'folder') {
        const permissions = advancedRole.additionalPermissions
        permissions.create = {
          name: 'create',
          description: this.$gettext('Allow creating')
        }
        permissions.delete = {
          name: 'delete',
          description: this.$gettext('Allow deleting')
        }
      }

      return advancedRole
    },

    roles () {
      const isFolder = this.highlightedFile.type === 'folder'
      const $gettext = this.$gettext
      const collaboratorRoles = roles({ $gettext, isFolder: isFolder })
      collaboratorRoles.advancedRole = this.advancedRole

      return collaboratorRoles
    },
    displayRoles () {
      const result = this.roles
      result[this.resharerRole.name] = this.resharerRole
      result[this.ownerRole.name] = this.ownerRole
      return result
    }
  },
  methods: {
    ...mapActions('Files', ['toggleCollaboratorsEdit']),

    $_ocCollaborators_collaboratorType (type) {
      if (parseInt(type, 10) === 0) return this.$gettext('User')

      if (parseInt(type, 10) === 6) return this.$gettext('Remote user')

      return this.$gettext('Group')
    },
    $_ocCollaborators_switchPermission (permission) {
      this.permissionsChanged = true
      this[permission] = !this[permission]
      this.editing = true
      this.toggleCollaboratorsEdit(true)
    },
    collaboratorOptionChanged ({ role, permissions, propagate = true }) {
      this.selectedRole = role
      this.additionalPermissions = permissions

      if (propagate) {
        this.editing = true
        this.toggleCollaboratorsEdit(true)
      }
    }
  }
}
