import { checkRoute } from '../../helpers/route'

export default {
  computed: {
    $_download_items() {
      return [
        {
          icon: 'file_download',
          handler: this.$_download_trigger,
          ariaLabel: () => {
            return this.$gettext('Download')
          },
          isEnabled: ({ resource }) => {
            if (checkRoute(['files-trashbin'], this.$route.name)) {
              return false
            }

            return resource.canDownload()
          },
          canBeDefault: true
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
