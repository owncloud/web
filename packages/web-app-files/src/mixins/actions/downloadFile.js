import {
  isLocationCommonActive,
  isLocationPublicActive,
  isLocationSharesActive,
  isLocationSpacesActive
} from '../../router'
import isFilesAppActive from './helpers/isFilesAppActive'
import { mapGetters } from 'vuex'

export default {
  mixins: [isFilesAppActive],
  computed: {
    ...mapGetters(['homeFolder']),
    $_downloadFile_items() {
      return [
        {
          name: 'download-file',
          icon: 'file-download',
          handler: this.$_downloadFile_trigger,
          label: () => {
            return this.$gettext('Download')
          },
          isEnabled: ({ resources }) => {
            if (
              this.$_isFilesAppActive &&
              !isLocationSpacesActive(this.$router, 'files-spaces-personal') &&
              !isLocationSpacesActive(this.$router, 'files-spaces-project') &&
              !isLocationSpacesActive(this.$router, 'files-spaces-share') &&
              !isLocationPublicActive(this.$router, 'files-public-files') &&
              !isLocationCommonActive(this.$router, 'files-common-favorites') &&
              !isLocationSharesActive(this.$router, 'files-shares-with-me')
            ) {
              return false
            }
            if (resources.length !== 1) {
              return false
            }
            if (resources[0].isFolder) {
              return false
            }
            if (resources[0].path === this.homeFolder) {
              return false
            }
            return resources[0].canDownload()
          },
          canBeDefault: true,
          componentType: 'button',
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
