import { isTrashbinRoute } from '../../helpers/route'

export default {
  computed: {
    $_download_items() {
      return [
        {
          icon: 'file_download',
          handler: this.$_download_trigger,
          label: () => {
            return this.$gettext('Download')
          },
          isEnabled: ({ resource }) => {
            if (isTrashbinRoute(this.$route)) {
              return false
            }

            return resource.canDownload()
          },
          canBeDefault: true,
          componentType: 'oc-button',
          class: 'oc-files-actions-download-trigger'
        }
      ]
    }
  },
  methods: {
    $_download_trigger(resource) {
      this.downloadFile(resource)
    }
  }
}
