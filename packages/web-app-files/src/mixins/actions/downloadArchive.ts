import {
  isLocationCommonActive,
  isLocationPublicActive,
  isLocationSharesActive,
  isLocationSpacesActive
} from '../../router'
import isFilesAppActive from './helpers/isFilesAppActive'
import path from 'path'
import first from 'lodash-es/first'
import { archiverService } from '../../services'
import { isPublicSpaceResource, Resource } from 'web-client/src/helpers'

export default {
  mixins: [isFilesAppActive],
  computed: {
    $_downloadArchive_items() {
      return [
        {
          name: 'download-archive',
          icon: 'inbox-archive',
          handler: this.$_downloadArchive_trigger,
          label: () => {
            return this.$gettext('Download')
          },
          isEnabled: ({ resources }) => {
            if (
              this.$_isFilesAppActive &&
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
            if (isLocationSpacesActive(this.$router, 'files-spaces-projects')) {
              return false
            }
            if (resources.length === 0) {
              return false
            }
            if (resources.length === 1 && !resources[0].isFolder) {
              return false
            }
            if (!archiverService.available) {
              return false
            }
            if (
              !archiverService.fileIdsSupported &&
              isLocationCommonActive(this.$router, 'files-common-favorites')
            ) {
              return false
            }
            // CERNBox do not allow actions above home/project root
            const elems = resources[0].path?.split('/').filter(Boolean) || [] //"/eos/project/c/cernbox"
            if (isLocationSpacesActive(this.$router, 'files-spaces-generic') && elems.length < 5) {
              return false
            }
            const downloadDisabled = resources.some((resource) => {
              return !resource.canDownload()
            })
            return !downloadDisabled
          },
          canBeDefault: true,
          componentType: 'button',
          class: 'oc-files-actions-download-archive-trigger'
        }
      ]
    }
  },
  methods: {
    async $_downloadArchive_trigger({ resources }) {
      const fileOptions = archiverService.fileIdsSupported
        ? {
            fileIds: resources.map((resource) => resource.fileId)
          }
        : {
            dir: path.dirname(first<Resource>(resources).path) || '/',
            files: resources.map((resource) => resource.name)
          }
      await archiverService
        .triggerDownload({
          ...fileOptions,
          ...(isPublicSpaceResource(this.space) && {
            publicToken: this.space.id
          })
        })
        .catch((e) => {
          console.error(e)
          this.showMessage({
            title: this.$ngettext(
              'Failed to download the selected folder.', // on single selection only available for folders
              'Failed to download the selected files.', // on multi selection available for files+folders
              this.selectedFiles.length
            ),
            status: 'danger'
          })
        })
    }
  }
}
