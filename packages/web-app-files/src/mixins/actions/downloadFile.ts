import {
  isLocationCommonActive,
  isLocationPublicActive,
  isLocationSharesActive,
  isLocationSpacesActive
} from '../../router'
import isFilesAppActive from './helpers/isFilesAppActive'
import isSearchActive from '../helpers/isSearchActive'

export default {
  mixins: [isFilesAppActive, isSearchActive],
  computed: {
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
              !this.$_isSearchActive &&
              !isLocationSpacesActive(this.$router, 'files-spaces-generic') &&
              !isLocationPublicActive(this.$router, 'files-public-link') &&
              !isLocationCommonActive(this.$router, 'files-common-favorites') &&
              !isLocationCommonActive(this.$router, 'files-common-search') &&
              !isLocationSharesActive(this.$router, 'files-shares-with-me') &&
              !isLocationSharesActive(this.$router, 'files-shares-with-others') &&
              !isLocationSharesActive(this.$router, 'files-shares-via-link')
            ) {
              return false
            }
            if (resources.length !== 1) {
              return false
            }
            if (resources[0].isFolder) {
              return false
            }
            // CERNBox do not allow actions above home/project root
            const elems = resources[0].path?.split('/').filter(Boolean) || [] //"/eos/project/c/cernbox"
            if (isLocationSpacesActive(this.$router, 'files-spaces-generic') && elems.length < 5) {
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
