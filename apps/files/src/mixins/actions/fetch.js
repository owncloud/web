import { checkRoute } from '../../helpers/route'

export default {
  computed: {
    $_fetch_items() {
      return [
        {
          icon: 'remove_red_eye',
          handler: file => this.fetchFile(file.path, 'application/pdf'),
          ariaLabel: () => {
            return this.$gettext('Open in browser')
          },
          isEnabled: ({ resource }) => {
            if (checkRoute(['files-trashbin'], this.$route.name)) {
              return false
            }

            return resource.extension === 'pdf'
          },
          canBeDefault: true
        }
      ]
    }
  },
  methods: {
    $_fetch_trigger(filePath, mimetype) {
      const url = this.$client.helpers._webdavUrl + filePath
      const headers = new Headers()

      headers.append('Authorization', 'Bearer ' + this.getToken)
      headers.append('X-Requested-With', 'XMLHttpRequest')

      fetch(url, {
        method: 'GET',
        headers
      })
        .then(r => r.blob())
        .then(blob => this.$_fetchFile_openBlobInNewTab(blob, mimetype))
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
