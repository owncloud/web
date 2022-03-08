import { isLocationPublicActive, isLocationTrashActive } from '../../router'

export default {
  computed: {
    $_fetch_items() {
      return [
        {
          name: 'open-pdf',
          icon: 'eye',
          iconFillType: 'line',
          handler: ({ resources }) =>
            this.$_fetch_trigger({
              resources,
              mimeType: 'application/pdf',
              isPublicFile: isLocationPublicActive(this.$router, 'files-public-files')
            }),
          label: () => {
            return this.$gettext('Open in browser')
          },
          isEnabled: ({ resources }) => {
            if (
              isLocationTrashActive(this.$router, 'files-trash-personal') ||
              isLocationTrashActive(this.$router, 'files-trash-project')
            ) {
              return false
            }
            if (resources.length !== 1) {
              return false
            }

            return resources[0].extension.toLowerCase() === 'pdf'
          },
          canBeDefault: true,
          componentType: 'oc-button',
          class: 'oc-files-actions-fetch-trigger',
          opensInNewWindow: true
        }
      ]
    }
  },
  methods: {
    $_fetch_trigger({ resources, mimeType, isPublicFile }) {
      let url
      const headers = new Headers()
      if (isPublicFile) {
        url = resources[0].downloadURL
      } else {
        url = `${this.$client.helpers._davPath}${resources[0].webDavPath}`
        headers.append('Authorization', 'Bearer ' + this.getToken)
        headers.append('X-Requested-With', 'XMLHttpRequest')
      }

      fetch(url, {
        method: 'GET',
        headers
      })
        .then((r) => r.blob())
        .then((blob) => this.$_fetch_openBlobInNewTab(blob, mimeType))
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
