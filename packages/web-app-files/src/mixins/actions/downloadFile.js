import { isTrashbinRoute } from '../../helpers/route'

export default {
  computed: {
    $_downloadFile_items() {
      return [
        {
          icon: 'file_download',
          handler: this.$_downloadFile_trigger,
          label: () => {
            return this.$gettext('Download')
          },
          isEnabled: ({ resource }) => {
            if (isTrashbinRoute(this.$route)) {
              return false
            }
            if (resource.isFolder) {
              return false
            }
            return resource.canDownload()
          },
          canBeDefault: true,
          componentType: 'oc-button',
          class: 'oc-files-actions-download-file-trigger'
        }
      ]
    }
  },
  methods: {
    $_downloadFile_trigger(resource) {
      this.downloadFile(resource)
    }
  }
}
