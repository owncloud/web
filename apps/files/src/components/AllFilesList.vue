<template>
  <file-list :fileData="fileData" id="files-list" :loading="loadingFolder" :actions="actions" :compactMode="_sidebarOpen"
      :isActionEnabled="isActionEnabled">
    <template #headerColumns>
      <div v-if="!publicPage()">
        <span class="oc-visually-hidden" v-text="favoritesHeaderText" />
        <oc-star id="files-table-header-star" aria-hidden="true" class="uk-display-block uk-disabled" />
      </div>
      <div class="uk-text-truncate uk-text-meta uk-width-expand" ref="headerNameColumn" >
        <sortable-column-header
          @click="toggleSort('name')"
          :aria-label="$gettext('Sort files by name')"
          :is-active="fileSortField == 'name'"
          :is-desc="fileSortDirectionDesc"
        >
          <translate translate-context="Name column in files table">Name</translate>
        </sortable-column-header>
      </div>
      <div v-if="!$_isFavoritesList"><!-- indicators column --></div>
      <div :class="{ 'uk-visible@s' : !_sidebarOpen, 'uk-hidden'  : _sidebarOpen }" class="uk-text-meta uk-width-small">
        <sortable-column-header
          @click="toggleSort('size')"
          :aria-label="$gettext('Sort files by size')"
          :is-active="fileSortField == 'size'"
          :is-desc="fileSortDirectionDesc"
          class="uk-align-right"
        >
          <translate translate-context="Size column in files table">Size</translate>
        </sortable-column-header>
      </div>
      <div
        :class="{ 'uk-visible@s' : !_sidebarOpen, 'uk-hidden'  : _sidebarOpen }"
        class="uk-text-nowrap uk-text-meta uk-width-small uk-margin-right"
      >
        <sortable-column-header
          @click="toggleSort('mdateMoment')"
          :aria-label="$gettext('Sort files by updated time')"
          :is-active="fileSortField == 'mdateMoment'"
          :is-desc="fileSortDirectionDesc"
          class="uk-align-right"
        >
          <translate translate-context="Short column label in files able for the time at which a file was modified">Updated</translate>
        </sortable-column-header>
      </div>
    </template>
    <template #rowColumns="{ item, index }">
      <div v-if="!publicPage()">
        <oc-star class="uk-display-block" @click.native.stop="toggleFileFavorite(item)" :shining="item.starred" />
      </div>
      <div class="uk-text-truncate uk-width-expand" :ref="index === 0 ? 'firstRowNameColumn' : null">
        <oc-file @click.native.stop="item.type === 'folder' ? navigateTo(item.path.substr(1)) : openFileActionBar(item)"
          :name="$_ocFileName(item)" :extension="item.extension" class="file-row-name" :icon="fileTypeIcon(item)"
          :filename="item.name" :key="item.id"/>
        <oc-spinner
          v-if="actionInProgress(item)"
          size="small"
          :uk-tooltip="disabledActionTooltip(item)"
          class="uk-margin-small-left"
        />
      </div>
      <div v-if="!$_isFavoritesList" class="uk-flex uk-flex-middle uk-flex-right">
        <Indicators :defaultIndicators="indicatorArray(item)" :item="item" @click="$_openSideBar" />
      </div>
      <div
        class="uk-text-meta uk-text-nowrap uk-width-small uk-text-right"
        :class="{ 'uk-visible@s' : !_sidebarOpen, 'uk-hidden'  : _sidebarOpen }"
      >
        {{ item.size | fileSize }}
      </div>
      <div
        class="uk-text-meta uk-text-nowrap uk-width-small uk-text-right"
        :class="{ 'uk-visible@s' : !_sidebarOpen, 'uk-hidden'  : _sidebarOpen }"
      >
        {{ formDateFromNow(item.mdate) }}
      </div>
    </template>
    <template #noContentMessage>
      <no-content-message v-if="!$_isFavoritesList" icon="folder">
        <template #message><span v-translate>There are no resources in this folder.</span></template>
        <template #callToAction><span v-translate>Drag files and folders here or use the "+ New" button to upload.</span></template>
      </no-content-message>
      <no-content-message v-else icon="star">
        <template #message><span v-translate>There are no resources marked as favorite.</span></template>
        <template #callToAction><span v-translate>You can mark some by clicking on the star icon in the file list.</span></template>
      </no-content-message>
    </template>
    <template #footer>
      <div v-if="activeFilesCount.folders > 0 || activeFilesCount.files > 0" class="uk-text-nowrap uk-text-meta">
        <span id="files-list-count-folders" v-text="activeFilesCount.folders" />
        <translate :translate-n="activeFilesCount.folders" translate-plural="folders">folder</translate>
        <translate>and</translate>
        <span id="files-list-count-files" v-text="activeFilesCount.files" />
        <translate :translate-n="activeFilesCount.files" translate-plural="files">file</translate>
        <template v-if="activeFiles.length > 0">
          &dash; {{ filesTotalSize | fileSize }}
        </template>
      </div>
      <div v-if="quotaVisible" class="uk-visible@s uk-width-2-3 uk-width-1-2@xl uk-text-meta uk-flex" :class="{ 'uk-visible@xl' : _sidebarOpen  }">
        <span class="uk-margin-small-right">
          <translate>Used space:</translate> {{ quota.used | fileSize }}
          <template v-if="quota.definition !== 'default' && quota.definition !== 'none'">
            <translate>of</translate> {{ quota.definition }}
          </template>
        </span>
        <div class="uk-width-expand oc-align-self-center" v-if="quota.definition !== 'default' && quota.definition !== 'none'">
          <oc-progress :value="parseInt(quota.relative)" :max="100" class="uk-margin-remove" />
        </div>
      </div>
    </template>
  </file-list>
</template>
<script>
import FileList from './FileList.vue'
import Indicators from './FilesLists/Indicators.vue'
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
    NoContentMessage,
    SortableColumnHeader
  },
  mixins: [
    Mixins,
    FileActions
  ],
  props: ['fileData', 'starsEnabled', 'checkboxEnabled', 'dateEnabled', 'parentFolder'],
  data () {
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

    item () {
      return this.$route.params.item
    },

    shareTypesIndirect () {
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
      parentPaths.forEach((parentPath) => {
        // TODO: optimize for performance by skipping once we got all known types
        const shares = this.sharesTree[parentPath]
        if (shares) {
          shares.forEach((share) => {
            // note: no distinction between incoming and outgoing shares as we display the same
            // indirect indicator for them
            shareTypes[share.shareType] = true
          })
        }
      })

      return Object.keys(shareTypes).map(shareType => parseInt(shareType, 10))
    },

    $_isFavoritesList () {
      return (this.$route.name === 'files-favorites')
    },

    quotaVisible () {
      return (
        !this.publicPage() &&
          this.currentFolder &&
          !this.currentFolder.isMounted()
      )
    }
  },
  watch: {
    $route () {
      this.$_ocFilesFolder_getFolder()
    }
  },
  beforeMount () {
    this.$_ocFilesFolder_getFolder()
  },
  methods: {
    ...mapActions('Files', [
      'loadFolder',
      'markFavorite',
      'setHighlightedFile'
    ]),

    $_openSideBar (item, sideBarName) {
      this.$emit('sideBarOpen', item, sideBarName)
    },

    $_ocFilesFolder_getFolder () {
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
      }).then(() => {
        const scrollTo = this.$route.query.scrollTo
        if (scrollTo && this.activeFiles.length > 0) {
          this.$nextTick(() => {
            const file = this.activeFiles.find(item => item.name === scrollTo)
            this.setHighlightedFile(file)
            this.$scrollTo(`#file-row-${file.id}`, 500, {
              container: '#files-list-container'
            })
          })
        }
      }).catch((error) => {
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
    toggleFileFavorite (item) {
      this.markFavorite({
        client: this.$client,
        file: item
      })
    },
    $_ocFileName (item) {
      if (this.$_isFavoritesList) {
        const pathSplit = item.path.substr(1).split('/')
        if (pathSplit.length === 2) return `${pathSplit[pathSplit.length - 2]}/${item.basename}`
        if (pathSplit.length > 2) return `…/${pathSplit[pathSplit.length - 2]}/${item.basename}`
      }
      return item.basename
    },

    isActionEnabled (item, action) {
      return action.isEnabled(item, this.parentFolder)
    },

    indicatorArray (item) {
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

    $_shareTypes (item) {
      if (typeof item.shareTypes !== 'undefined') {
        return item.shareTypes
      }

      if (item.shares) {
        return Array.from(new Set(item.shares.map(share => parseInt(share.type, 10))))
      }
      return []
    },

    isDirectUserShare (item) {
      return (intersection(userShareTypes, this.$_shareTypes(item)).length > 0)
    },

    isIndirectUserShare (item) {
      return (item.isReceivedShare() || intersection(userShareTypes, this.shareTypesIndirect).length > 0)
    },

    isDirectLinkShare (item) {
      return (this.$_shareTypes(item).indexOf(shareTypes.link) >= 0)
    },

    isIndirectLinkShare () {
      return (this.shareTypesIndirect.indexOf(shareTypes.link) >= 0)
    },

    isUserShare (item) {
      return this.isDirectUserShare(item) || this.isIndirectUserShare(item)
    },

    isLinkShare (item) {
      return this.isDirectLinkShare(item) || this.isIndirectLinkShare(item)
    },

    shareUserIconVariation (item) {
      return this.isDirectUserShare(item) ? 'active' : 'passive'
    },

    shareLinkIconVariation (item) {
      return this.isDirectLinkShare(item) ? 'active' : 'passive'
    },

    shareUserIconLabel (item) {
      return this.isDirectUserShare(item) ? this.$gettext('Directly shared with collaborators') : this.$gettext('Shared with collaborators through one of the parent folders')
    },

    shareLinkIconLabel (item) {
      return this.isDirectLinkShare(item) ? this.$gettext('Directly shared with links') : this.$gettext('Shared with links through one of the parent folders')
    },

    indicatorHandler (item, sideBarName) {
      this.$emit('click', item, sideBarName)
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
