<template>
  <div class="uk-height-1-1">
    <div class="uk-flex uk-flex-column uk-height-1-1">
      <div class="uk-overflow-auto uk-flex-auto">
        <file-list :fileData="fileData" id="files-list" :loading="loadingFolder" :actions="actions" :compactMode="_sidebarOpen"
            :isActionEnabled="isActionEnabled">
          <template #headerColumns>
            <div v-if="!publicPage()">
              <span class="oc-visually-hidden" v-text="favoritesHeaderText" />
              <oc-star id="files-table-header-star" aria-hidden="true" class="uk-display-block uk-disabled" />
            </div>
            <div></div>
            <div class="uk-text-truncate uk-text-meta uk-width-expand" v-translate>Name</div>
            <div :class="{ 'uk-visible@s' : !_sidebarOpen, 'uk-hidden'  : _sidebarOpen }" class="uk-text-meta uk-width-small" v-translate>Size</div>
            <div type="head" :class="{ 'uk-visible@s' : !_sidebarOpen, 'uk-hidden'  : _sidebarOpen }" class="uk-text-nowrap uk-text-meta uk-width-small" v-translate>Updated</div>
          </template>
          <template #rowColumns="{ item }">
            <div v-if="!publicPage()">
              <oc-star class="uk-display-block" @click.native.stop="toggleFileFavorite(item)" :shining="item.starred" />
            </div>
            <div class="uk-text-truncate uk-width-expand">
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
            <div>
              <oc-button v-if="$_isUserShare(item)" class="file-row-share-indicator uk-text-middle" :aria-label="$_shareUserIconLabel(item)" @click="$_openSideBar(item, 'files-sharing')" variation="raw">
                <oc-icon name="group" class="uk-text-middle" size="small" :variation="$_shareUserIconVariation(item)"/>
              </oc-button>
              <oc-button v-if="$_isLinkShare(item)" class="file-row-share-indicator uk-text-middle" :aria-label="$_shareLinkIconLabel(item)" @click="$_openSideBar(item, 'file-link')" variation="raw">
                <oc-icon name="link" class="uk-text-middle" size="small" :variation="$_shareLinkIconVariation(item)"/>
              </oc-button>
            </div>
            <div class="uk-text-meta uk-text-nowrap uk-width-small" :class="{ 'uk-visible@s' : !_sidebarOpen, 'uk-hidden'  : _sidebarOpen }">
              {{ item.size | fileSize }}
            </div>
            <div class="uk-text-meta uk-text-nowrap uk-width-small" :class="{ 'uk-visible@s' : !_sidebarOpen, 'uk-hidden'  : _sidebarOpen }">
              {{ formDateFromNow(item.mdate) }}
            </div>
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
      </div>
    </div>
  </div>
</template>
<script>
import FileList from './FileList.vue'
import { mapGetters, mapActions, mapState } from 'vuex'
import { shareTypes } from '../helpers/shareTypes'
import { getParentPaths } from '../helpers/path'

import Mixins from '../mixins'
import FileActions from '../fileactions'
import intersection from 'lodash/intersection'

const userShareTypes = [shareTypes.user, shareTypes.group, shareTypes.guest, shareTypes.remote]

export default {
  components: {
    FileList
  },
  mixins: [
    Mixins,
    FileActions
  ],
  name: 'AllFilesList',
  props: ['fileData', 'starsEnabled', 'checkboxEnabled', 'dateEnabled', 'parentFolder'],
  data () {
    return {
      favoritesHeaderText: this.$gettext('Favorites')
    }
  },
  beforeMount () {
    this.$_ocFilesFolder_getFolder()
  },
  methods: {
    ...mapActions('Files', ['loadFolder', 'setFilterTerm', 'markFavorite',
      'setHighlightedFile', 'setPublicLinkPassword']),

    $_openSideBar (item, sideBarName) {
      this.$emit('sideBarOpen', item, sideBarName)
    },

    $_isDirectUserShare (item) {
      return (intersection(userShareTypes, item.shareTypes).length > 0)
    },

    $_isIndirectUserShare (item) {
      return (item.isReceivedShare() || intersection(userShareTypes, this.$_shareTypesIndirect).length > 0)
    },

    $_isDirectLinkShare (item) {
      return (item.shareTypes.indexOf(shareTypes.link) >= 0)
    },

    $_isIndirectLinkShare (item) {
      return (this.$_shareTypesIndirect.indexOf(shareTypes.link) >= 0)
    },

    $_isUserShare (item) {
      return this.$_isDirectUserShare(item) || this.$_isIndirectUserShare(item)
    },

    $_isLinkShare (item) {
      return this.$_isDirectLinkShare(item) || this.$_isIndirectLinkShare(item)
    },

    $_shareUserIconVariation (item) {
      return this.$_isDirectUserShare(item) ? 'active' : 'passive'
    },

    $_shareLinkIconVariation (item) {
      return this.$_isDirectLinkShare(item) ? 'active' : 'passive'
    },

    $_shareUserIconLabel (item) {
      return this.$_isDirectUserShare(item) ? this.$gettext('Directly shared with collaborators') : this.$gettext('Shared with collaborators through one of the parent folders')
    },

    $_shareLinkIconLabel (item) {
      return this.$_isDirectLinkShare(item) ? this.$gettext('Directly shared with links') : this.$gettext('Shared with links through one of the parent folders')
    },

    $_ocFilesFolder_getFolder () {
      this.setFilterTerm('')
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
      if (this.$route.name === 'files-favorites') {
        const pathSplit = item.path.substr(1).split('/')
        if (pathSplit.length === 2) return `${pathSplit[pathSplit.length - 2]}/${item.basename}`
        if (pathSplit.length > 2) return `…/${pathSplit[pathSplit.length - 2]}/${item.basename}`
      }
      return item.basename
    },

    isActionEnabled (item, action) {
      return action.isEnabled(item, this.parentFolder)
    }
  },
  computed: {
    ...mapState(['route']),
    ...mapGetters('Files', ['loadingFolder', 'activeFiles', 'quota', 'filesTotalSize', 'activeFilesCount', 'currentFolder', 'sharesTree']),
    ...mapGetters(['configuration']),

    item () {
      return this.$route.params.item
    },

    $_shareTypesIndirect () {
      const parentPaths = getParentPaths(this.currentFolder.path, true)
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
            shareTypes[share.info.share_type] = true
          })
        }
      })

      return Object.keys(shareTypes).map(shareType => parseInt(shareType, 10))
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
  }
}
</script>

<style scoped>
  /* FIXME */
  #files-table-header-star {
    opacity: 0;
  }
</style>
