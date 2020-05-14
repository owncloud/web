<template>
  <file-list
    id="files-list"
    :file-data="fileData"
    :loading="loadingFolder"
    :actions="actions"
    :compact-mode="_sidebarOpen"
    :is-action-enabled="isActionEnabled"
  >
    <template #headerColumns>
      <div ref="headerNameColumn" class="uk-text-truncate uk-text-meta uk-width-expand">
        <sortable-column-header
          :aria-label="$gettext('Sort files by name')"
          :is-active="fileSortField === 'name'"
          :is-desc="fileSortDirectionDesc"
          @click="toggleSort('name')"
        >
          <translate translate-context="Name column in files table">Name</translate>
        </sortable-column-header>
      </div>
      <div v-if="!$_isFavoritesList"><!-- indicators column --></div>
      <div
        :class="{ 'uk-visible@s': !_sidebarOpen, 'uk-hidden': _sidebarOpen }"
        class="uk-text-meta uk-width-small"
      >
        <sortable-column-header
          :aria-label="$gettext('Sort files by size')"
          :is-active="fileSortField === 'size'"
          :is-desc="fileSortDirectionDesc"
          class="uk-align-right"
          @click="toggleSort('size')"
        >
          <translate translate-context="Size column in files table">Size</translate>
        </sortable-column-header>
      </div>
      <div
        :class="{ 'uk-visible@s': !_sidebarOpen, 'uk-hidden': _sidebarOpen }"
        class="uk-text-nowrap uk-text-meta uk-width-small uk-margin-right"
      >
        <sortable-column-header
          :aria-label="$gettext('Sort files by updated time')"
          :is-active="fileSortField === 'mdateMoment'"
          :is-desc="fileSortDirectionDesc"
          class="uk-align-right"
          @click="toggleSort('mdateMoment')"
        >
          <translate
            translate-context="Short column label in files able for the time at which a file was modified"
            >Updated</translate
          >
        </sortable-column-header>
      </div>
    </template>
    <template #rowColumns="{ item: rowItem, index }">
      <div
        :ref="index === 0 ? 'firstRowNameColumn' : null"
        class="uk-text-truncate uk-width-expand"
      >
        <file-item
          :key="rowItem.viewId"
          :item="rowItem"
          :dav-url="davUrl"
          :show-path="$_isFavoritesList"
          class="file-row-name"
          @click.native.stop="
            rowItem.type === 'folder'
              ? navigateTo(rowItem.path.substr(1))
              : openFileActionBar(rowItem)
          "
        />
        <oc-spinner
          v-if="actionInProgress(rowItem)"
          size="small"
          :uk-tooltip="disabledActionTooltip(rowItem)"
          class="uk-margin-small-left"
        />
      </div>
      <div v-if="!$_isFavoritesList" class="uk-flex uk-flex-middle uk-flex-right">
        <Indicators :default-indicators="indicatorArray(rowItem)" :item="rowItem" />
      </div>
      <div
        class="uk-text-meta uk-text-nowrap uk-width-small uk-text-right"
        :class="{ 'uk-visible@s': !_sidebarOpen, 'uk-hidden': _sidebarOpen }"
      >
        {{ rowItem.size | fileSize }}
      </div>
      <div
        class="uk-text-meta uk-text-nowrap uk-width-small uk-text-right"
        :class="{ 'uk-visible@s': !_sidebarOpen, 'uk-hidden': _sidebarOpen }"
      >
        {{ formDateFromNow(rowItem.mdate) }}
      </div>
    </template>
    <template #noContentMessage>
      <no-content-message v-if="!$_isFavoritesList" icon="folder">
        <template #message
          ><span v-translate>There are no resources in this folder.</span></template
        >
        <template #callToAction
          ><span v-translate
            >Drag files and folders here or use the "+ New" button to upload.</span
          ></template
        >
      </no-content-message>
      <no-content-message v-else icon="star">
        <template #message
          ><span v-translate>There are no resources marked as favorite.</span></template
        >
        <template #callToAction
          ><span v-translate
            >You can mark some by clicking on the star icon in the file list.</span
          ></template
        >
      </no-content-message>
    </template>
    <template #footer>
      <div
        v-if="activeFilesCount.folders > 0 || activeFilesCount.files > 0"
        class="uk-text-nowrap uk-text-meta"
      >
        <span id="files-list-count-folders" v-text="activeFilesCount.folders" />
        <translate :translate-n="activeFilesCount.folders" translate-plural="folders"
          >folder</translate
        >
        <translate>and</translate>
        <span id="files-list-count-files" v-text="activeFilesCount.files" />
        <translate :translate-n="activeFilesCount.files" translate-plural="files">file</translate>
        <template v-if="activeFiles.length > 0">
          &ndash; {{ filesTotalSize | fileSize }}
        </template>
      </div>
      <div
        v-if="quotaVisible"
        class="uk-visible@s uk-width-2-3 uk-width-1-2@xl uk-text-meta uk-flex"
        :class="{ 'uk-visible@xl': _sidebarOpen }"
      >
        <span class="uk-margin-small-right">
          <translate>Used space:</translate> {{ quota.used | fileSize }}
          <template v-if="quota.definition !== 'default' && quota.definition !== 'none'">
            <translate>of</translate> {{ quota.definition }}
          </template>
        </span>
        <div
          v-if="quota.definition !== 'default' && quota.definition !== 'none'"
          class="uk-width-expand oc-align-self-center"
        >
          <oc-progress :value="parseInt(quota.relative)" :max="100" class="uk-margin-remove" />
        </div>
      </div>
    </template>
  </file-list>
</template>
<script>
import FileList from './FileList.vue'
import Indicators from './FilesLists/Indicators.vue'
import FileItem from './FileItem.vue'
import NoContentMessage from './NoContentMessage.vue'
import { mapGetters, mapActions, mapState } from 'vuex'

import Mixins from '../mixins'
import FileActions from '../fileactions'
import SortableColumnHeader from './FilesLists/SortableColumnHeader.vue'
import intersection from 'lodash/intersection'
import { shareTypes, userShareTypes } from '../helpers/shareTypes'
import { getParentPaths } from '../helpers/path'

export default {
  name: 'AllFilesList',
  components: {
    FileList,
    Indicators,
    FileItem,
    NoContentMessage,
    SortableColumnHeader
  },
  mixins: [Mixins, FileActions],
  props: {
    fileData: {
      type: Array,
      required: true
    },
    starsEnabled: {
      type: Boolean
    },
    checkboxEnabled: {
      type: Boolean
    },
    dateEnabled: {
      type: Boolean
    },
    parentFolder: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      favoritesHeaderText: this.$gettext('Favorites')
    }
  },
  computed: {
    ...mapState(['route']),
    ...mapGetters('Files', [
      'loadingFolder',
      'activeFiles',
      'quota',
      'filesTotalSize',
      'activeFilesCount',
      'currentFolder',
      'fileSortField',
      'fileSortDirectionDesc',
      'sharesTree'
    ]),
    ...mapGetters(['configuration']),

    item() {
      return this.$route.params.item
    },

    shareTypesIndirect() {
      const parentPath = this.currentFolder.path
      if (!parentPath) {
        return []
      }
      const parentPaths = getParentPaths(parentPath, true)
      if (parentPaths.length === 0) {
        return []
      }

      // remove root entry
      parentPaths.pop()

      const shareTypes = {}
      parentPaths.forEach(parentPath => {
        // TODO: optimize for performance by skipping once we got all known types
        const shares = this.sharesTree[parentPath]
        if (shares) {
          shares.forEach(share => {
            // note: no distinction between incoming and outgoing shares as we display the same
            // indirect indicator for them
            shareTypes[share.shareType] = true
          })
        }
      })

      return Object.keys(shareTypes).map(shareType => parseInt(shareType, 10))
    },

    davUrl() {
      let davUrl
      // FIXME: use SDK once it switches to DAV v2
      if (this.publicPage()) {
        davUrl = ['..', 'dav', 'public-files'].join('/')
      } else {
        davUrl = ['..', 'dav', 'files', this.$store.getters.user.id].join('/')
      }
      return this.$client.files.getFileUrl(davUrl)
    },

    $_isFavoritesList() {
      return this.$route.name === 'files-favorites'
    },

    quotaVisible() {
      return !this.publicPage() && this.currentFolder && !this.currentFolder.isMounted()
    }
  },
  watch: {
    $route() {
      this.$_ocFilesFolder_getFolder()
    }
  },
  beforeMount() {
    this.$_ocFilesFolder_getFolder()
  },
  methods: {
    ...mapActions('Files', ['loadFolder', 'markFavorite', 'setHighlightedFile']),

    $_openSideBar(item, sideBarName) {
      this.$emit('sideBarOpen', item, sideBarName)
    },

    $_ocFilesFolder_getFolder() {
      let absolutePath

      if (this.configuration.rootFolder) {
        absolutePath = !this.item ? this.configuration.rootFolder : this.item
      } else {
        absolutePath = !this.item ? this.configuration.rootFolder : this.item
      }

      this.loadFolder({
        client: this.$client,
        absolutePath: absolutePath,
        $gettext: this.$gettext,
        routeName: this.$route.name,
        loadSharesTree: !this.publicPage()
      })
        .then(() => {
          const scrollTo = this.$route.query.scrollTo
          if (scrollTo && this.activeFiles.length > 0) {
            this.$nextTick(() => {
              const file = this.activeFiles.find(item => item.name === scrollTo)
              this.setHighlightedFile(file)
              this.$scrollTo(`#file-row-${file.viewId}`, 500, {
                container: '#files-list-container'
              })
            })
          }
        })
        .catch(error => {
          // password for public link shares is missing -> this is handled on the caller side
          if (this.publicPage() && error.statusCode === 401) {
            this.$router.push({
              name: 'public-link',
              params: {
                token: this.$route.params.item
              }
            })
            return
          }
          this.showMessage({
            title: this.$gettext('Loading folder failed…'),
            desc: error.message,
            status: 'danger'
          })
        })
    },

    isActionEnabled(item, action) {
      return action.isEnabled(item, this.parentFolder)
    },

    indicatorArray(item) {
      const collaborators = {
        id: 'files-sharing',
        label: this.shareUserIconLabel(item),
        visible: this.isUserShare(item),
        icon: 'group',
        status: this.shareUserIconVariation(item),
        handler: this.indicatorHandler
      }
      const links = {
        id: 'file-link',
        label: this.shareLinkIconLabel(item),
        visible: this.isLinkShare(item),
        icon: 'link',
        status: this.shareLinkIconVariation(item),
        handler: this.indicatorHandler
      }
      const indicators = []

      if (collaborators.visible) {
        indicators.push(collaborators)
      }

      if (links.visible) {
        indicators.push(links)
      }

      return indicators
    },

    $_shareTypes(item) {
      if (typeof item.shareTypes !== 'undefined') {
        return item.shareTypes
      }

      if (item.shares) {
        return Array.from(new Set(item.shares.map(share => parseInt(share.type, 10))))
      }
      return []
    },

    isDirectUserShare(item) {
      return intersection(userShareTypes, this.$_shareTypes(item)).length > 0
    },

    isIndirectUserShare(item) {
      return (
        item.isReceivedShare() || intersection(userShareTypes, this.shareTypesIndirect).length > 0
      )
    },

    isDirectLinkShare(item) {
      return this.$_shareTypes(item).indexOf(shareTypes.link) >= 0
    },

    isIndirectLinkShare() {
      return this.shareTypesIndirect.indexOf(shareTypes.link) >= 0
    },

    isUserShare(item) {
      return this.isDirectUserShare(item) || this.isIndirectUserShare(item)
    },

    isLinkShare(item) {
      return this.isDirectLinkShare(item) || this.isIndirectLinkShare(item)
    },

    shareUserIconVariation(item) {
      return this.isDirectUserShare(item) ? 'active' : 'passive'
    },

    shareLinkIconVariation(item) {
      return this.isDirectLinkShare(item) ? 'active' : 'passive'
    },

    shareUserIconLabel(item) {
      return this.isDirectUserShare(item)
        ? this.$gettext('Directly shared with collaborators')
        : this.$gettext('Shared with collaborators through one of the parent folders')
    },

    shareLinkIconLabel(item) {
      return this.isDirectLinkShare(item)
        ? this.$gettext('Directly shared with links')
        : this.$gettext('Shared with links through one of the parent folders')
    },

    indicatorHandler(item, sideBarName) {
      this.$_openSideBar(item, sideBarName)
    }
  }
}
</script>

<style scoped>
/* FIXME */
#files-table-header-star {
  opacity: 0;
}
</style>
