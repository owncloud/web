import { checkRoute } from '../../helpers/route'

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
            if (checkRoute(['files-trashbin'], this.$route.name)) {
              return false
            }

            return resource.canDownload()
          },
          canBeDefault: true,
          componentType: 'oc-button',
          class: 'oc-files-actions-sidebar-download-trigger'
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
