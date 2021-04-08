import { mapGetters } from 'vuex'
import roles from '../helpers/collaboratorRolesDefinition'
import { shareTypes } from '../helpers/shareTypes'

export default {
  computed: {
    ...mapGetters(['getToken', 'user', 'isOcis']),
    ...mapGetters('Files', ['highlightedFile']),

    ownerRole() {
      return {
        name: 'owner',
        label: this.$gettext('Owner')
      }
    },

    resharerRole() {
      return {
        name: 'resharer',
        label: this.$gettext('Resharer')
      }
    },

    advancedRole() {
      const advancedRole = {
        name: 'advancedRole',
        label: this.$gettext('Advanced permissions'),
        description: this.$gettext('Set detailed permissions'),
        permissions: ['read'],
        additionalPermissions: {
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

      if (!this.isOcis) {
        advancedRole.additionalPermissions.share = {
          name: 'share',
          description: this.$gettext('Allow sharing')
        }
      }

      return advancedRole
    },

    roles() {
      const isFolder = this.highlightedFile.type === 'folder'
      const $gettext = this.$gettext
      const collaboratorRoles = roles({
        $gettext,
        isFolder: isFolder,
        allowSharePerm: !this.isOcis
      })
      collaboratorRoles.push(this.advancedRole)

      return collaboratorRoles
    },

    displayRoles() {
      const result = this.roles

      result.push(this.resharerRole, this.ownerRole)

      return result
    }
  },
  methods: {
    collaboratorOptionChanged({ role, permissions, expirationDate }) {
      this.selectedRole = role
      this.additionalPermissions = permissions
      this.expirationDate = expirationDate
    },

    collaboratorType(type) {
      switch (type) {
        case shareTypes.user:
          return this.$gettext('User')
        case shareTypes.group:
          return this.$gettext('Group')
        case shareTypes.guest:
          return this.$gettext('Guest')
        case shareTypes.remote:
          return this.$gettext('Remote user')
        default:
          return this.$gettext('Unknown type')
      }
    }
  }
}
