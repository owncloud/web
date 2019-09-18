import { mapGetters, mapActions } from 'vuex'

export default {
  computed: {
    ...mapGetters(['getToken']),
    roles () {
      const roles = {
        viewer: {
          tag: 'viewer',
          name: this.$gettext('Viewer'),
          description: this.$gettext('Download and preview')
        },
        editor: {
          tag: 'editor',
          name: this.$gettext('Editor'),
          description: this.$gettext(
            'Upload, edit, delete, download and preview'
          )
        },
        custom: {
          tag: 'custom',
          name: this.$gettext('Custom role'),
          description: this.$gettext('Set detailed permissions')
        }
      }
      if (this.highlightedFile.type === 'file') {
        delete roles.custom
      }
      return roles
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
    }
  }
}
