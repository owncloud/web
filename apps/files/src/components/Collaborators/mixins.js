import { mapGetters, mapActions } from 'vuex'

export default {
  data () {
    return {
      roles: {
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
    }
  },
  computed: {
    ...mapGetters(['getToken'])
  },
  methods: {
    ...mapActions('Files', ['toggleCollaboratorsEdit']),

    $_ocCollaborators_collaboratorType (type) {
      if (type === '0' || type === 0) return this.$gettext('User')

      return this.$gettext('Group')
    },
    $_ocCollaborators_switchPermission (permission) {
      this.permissionsChanged = true
      this[permission] = !this[permission]
      this.editing = true
      this.toggleCollaboratorsEdit(true)
    },
    $_ocCollaborators_loadAvatar (item) {
      if (item.value.shareType === 1 || item.value.shareType === 3) return

      const dav = this.$client.helpers._davPath
      const headers = new Headers()
      const url = `${dav}/avatars/${item.value.shareWith}/128.png`

      headers.append('Authorization', 'Bearer ' + this.getToken)
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
