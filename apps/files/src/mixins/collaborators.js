import { mapGetters, mapActions } from 'vuex'
import roles from '../helpers/collaboratorRolesDefinition'

export default {
  computed: {
    ...mapGetters(['getToken']),
    ...mapGetters('Files', ['highlightedFile']),

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
    $_ocCollaborators_loadAvatar (item) {
      if ((item.value && item.value.shareType !== 0) || (item.info && item.info.share_type !== '0')) return

      let name
      if (item.value) {
        name = item.value.shareWith
      } else if (item.info) {
        name = item.name
      }

      const dav = this.$client.helpers._davPath
      const headers = new Headers()
      const url = `${dav}/avatars/${name}/128.png`

      headers.append('Authorization', 'Bearer ' + this.getToken)
      headers.append('X-Requested-With', 'XMLHttpRequest')

      this.loading = true

      fetch(url, { headers })
        .then(response => {
          if (response.ok) {
            return response.blob()
          }
          throw new Error('Network response was not ok.')
        })
        .then(blob => {
          this.avatar = window.URL.createObjectURL(blob)
        })
        .catch(_ => {
          this.avatar = ''
        })
        .finally(_ => {
          this.loading = false
        })
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
