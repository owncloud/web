import { isLocationSharesActive, isLocationSpacesActive } from '../../router'
import isFilesAppActive from './helpers/isFilesAppActive'
import isSearchActive from '../helpers/isSearchActive'
import { mapActions } from 'vuex'

export default {
  mixins: [isFilesAppActive, isSearchActive],
  computed: {
    $_openFileRemote() {
      return [
        {
          name: 'open-file-remote',
          icon: 'remote-control',
          handler: this.$_openFileRemote_trigger,
          label: () => {
            return this.$gettext('Open remotely')
          },
          isEnabled: ({ resources }) => {
            if (
              resources.length === 1 &&
              resources[0].isFolder === false &&
              resources[0].path?.split('/').filter(Boolean)?.[0] === 'sciencemesh' &&
              (isLocationSpacesActive(this.$router, 'files-spaces-generic') ||
                isLocationSharesActive(this.$router, 'files-shares-with-me'))
            ) {
              return true
            }
            return false
          },
          canBeDefault: true,
          componentType: 'button',
          class: 'oc-files-actions-open-file-remote'
        }
      ]
    }
  },
  methods: {
    ...mapActions(['showMessage']),
    $_openFileRemote_trigger({ resources }) {
      this.openInApp(resources[0])
    },
    async openInApp(resource) {
      const url = '/sciencemesh/open-in-app'
      const accessToken = this.$store.getters['runtime/auth/accessToken']
      const headers = new Headers()
      headers.append('Authorization', 'Bearer ' + accessToken)
      headers.append('X-Requested-With', 'XMLHttpRequest')
      headers.append('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')

      const formData = new URLSearchParams()
      formData.append('file', resource.path)

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData.toString()
      })
      if (!response.ok) {
        this.showMessage({
          title: this.$gettext('An error occurred'),
          desc: this.$gettext("Couldn't open remotely"),
          status: 'danger'
        })
      } else {
        const res = await response.json()
        if (res.app_url) {
          const win = window.open(res.app_url, '_blank')
          // in case popup is blocked win will be null
          if (win) {
            win.focus()
          } else {
            this.showMessage({
              title: this.$gettext('Blocked pop-ups and redirects'),
              timeout: 10,
              status: 'warning',
              desc: this.$gettext(
                'Some features might not work correctly. Please enable pop-ups and redirects in Settings > Privacy & Security > Site Settings > Permissions'
              )
            })
          }
        } else {
          this.showMessage({
            title: this.$gettext('An error occurred'),
            desc: this.$gettext("Couldn't open remotely"),
            status: 'danger'
          })
        }
      }
    }
  }
}
