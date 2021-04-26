import MixinRoutes from '../routes'
import { mapGetters } from 'vuex'

export default {
  mixins: [MixinRoutes],
  computed: {
    ...mapGetters(['configuration']),
    $_fetch_items() {
      return [
        {
          icon: 'remove_red_eye',
          handler: file => this.$_fetch_trigger(file, 'application/pdf', this.isPublicFilesRoute),
          label: () => {
            return this.$gettext('Open in browser')
          },
          isEnabled: ({ resource }) => {
            if (this.isTrashbinRoute) {
              return false
            }

            return resource.extension === 'pdf'
          },
          canBeDefault: true,
          componentType: 'oc-button',
          class: 'oc-files-actions-sidebar-fetch-trigger',
          opensInNewWindow: true
        }
      ]
    }
  },
  methods: {
    $_fetch_trigger(file, mimetype, isPublicFile) {
      if (isPublicFile) {
        const url = file.downloadURL
        window.open(url, '_blank')
        return
      }

      const url = this.$client.helpers._webdavUrl + file.path
      const headers = new Headers()

      headers.append('Authorization', 'Bearer ' + this.getToken)
      headers.append('X-Requested-With', 'XMLHttpRequest')

      fetch(url, {
        method: 'GET',
        headers
      })
        .then(r => r.blob())
        .then(blob => this.$_fetch_openBlobInNewTab(blob, mimetype))
    },

    $_fetch_openBlobInNewTab(blob, mimetype) {
      // It is necessary to create a new blob object with mime-type explicitly set
      // otherwise only Chrome works like it should
      const newBlob = new Blob([blob], { type: mimetype })

      // Open the file in new tab
      const data = window.URL.createObjectURL(newBlob)
      window.open(data, '_blank')
    }
  }
}
