import {
  isLocationCommonActive,
  isLocationSharesActive,
  isLocationSpacesActive
} from '../../router'

export default {
  computed: {
    $_downloadFile_items() {
      return [
        {
          name: 'delete-file',
          icon: 'file_download',
          handler: this.$_downloadFile_trigger,
          label: () => {
            return this.$gettext('Download')
          },
          isEnabled: ({ resources }) => {
            if (
              !isLocationSpacesActive(this.$router) &&
              !isLocationSharesActive(this.$router, 'files-shares-public-files') &&
              !isLocationCommonActive(this.$router, 'files-common-favorites')
            ) {
              return false
            }
            if (resources.length !== 1) {
              return false
            }
            if (resources[0].isFolder) {
              return false
            }
            return resources[0].canDownload()
          },
          canBeDefault: true,
          componentType: 'oc-button',
          class: 'oc-files-actions-download-file-trigger'
        }
      ]
    }
  },
  methods: {
    $_downloadFile_trigger({ resources }) {
      this.downloadFile(resources[0])
    }
  }
}
