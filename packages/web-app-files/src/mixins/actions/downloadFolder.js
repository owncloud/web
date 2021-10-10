import { isFavoritesRoute, isPersonalRoute } from '../../helpers/route'
import {
  isDownloadAsArchiveAvailable,
  triggerDownloadAsArchive
} from '../../helpers/download/downloadAsArchive'

export default {
  computed: {
    $_downloadFolder_items() {
      return [
        {
          icon: 'archive',
          handler: this.$_downloadFolder_trigger,
          label: () => {
            return this.$gettext('Download folder')
          },
          isEnabled: ({ resource }) => {
            if (!isPersonalRoute(this.$route) && !isFavoritesRoute(this.$route)) {
              return false
            }
            if (!resource.isFolder) {
              return false
            }
            if (!isDownloadAsArchiveAvailable()) {
              return false
            }
            return resource.canDownload()
          },
          canBeDefault: true,
          componentType: 'oc-button',
          class: 'oc-files-actions-download-archive-trigger'
        }
      ]
    }
  },
  methods: {
    async $_downloadFolder_trigger(resource) {
      await triggerDownloadAsArchive({
        fileIds: [resource.fileId]
      }).catch(e => {
        console.error(e)
        this.showMessage({
          title: this.$gettext('Error downloading the selected folder.'),
          status: 'danger'
        })
      })
    }
  }
}
