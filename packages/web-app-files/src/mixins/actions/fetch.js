import { isPublicFilesRoute } from '../../helpers/route'

export default {
  computed: {
    $_fetch_items() {
      return [
        {
          name: 'open-pdf',
          icon: 'remove_red_eye',
          handler: ({ resources }) =>
            this.$_fetch_trigger({
              resources,
              mimeType: 'application/pdf',
              isPublicFile: isPublicFilesRoute(this.$route)
            }),
          label: () => {
            return this.$gettext('Open in browser')
          },
          isEnabled: ({ resources }) => {
            if (this.isTrashbinRoute) {
              return false
            }
            if (resources.length !== 1) {
              return false
            }

            return resources[0].extension === 'pdf'
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
      if (isPublicFile) {
        const url = resources[0].downloadURL
        window.open(url, '_blank')
        return
      }

      // FIXME: use presigned URL instead
      const url = this.$client.helpers._webdavUrl + resources[0].path
      const headers = new Headers()

      headers.append('Authorization', 'Bearer ' + this.getToken)
      headers.append('X-Requested-With', 'XMLHttpRequest')

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
