<template>
  <div class="uk-height-1-1">
    <div class="uk-flex uk-flex-column uk-height-1-1">
      <div id="files-list-container" class="uk-overflow-auto uk-flex-auto">
        <file-list :fileData="fileData" id="files-list" :loading="loadingFolder" :actions="actions" :compactMode="_sidebarOpen"
            :isActionEnabled="isActionEnabled">
          <template #headerColumns>
            <oc-table-cell shrink type="head" v-if="!publicPage()"><span class="oc-visually-hidden">{{favoritesHeaderText}}</span></oc-table-cell>
            <oc-table-cell type="head" class="uk-text-truncate" v-translate>Name</oc-table-cell>
            <oc-table-cell shrink type="head" :class="{ 'uk-visible@s' : !_sidebarOpen, 'uk-visible@m'  : _sidebarOpen }"><translate>Size</translate></oc-table-cell>
            <oc-table-cell shrink type="head" :class="{ 'uk-visible@s' : !_sidebarOpen, 'uk-visible@m'  : _sidebarOpen }" class="uk-text-nowrap" v-translate>Modification Time</oc-table-cell>
          </template>
          <template #rowColumns="{ item }">
            <oc-table-cell class="uk-padding-remove" v-if="!publicPage()">
              <oc-star class="uk-display-block" @click.native.stop="toggleFileFavorite(item)" :shining="item.starred" />
            </oc-table-cell>
            <oc-table-cell class="uk-text-truncate">
              <oc-file @click.native.stop="item.type === 'folder' ? navigateTo(item.path.substr(1)) : openFileActionBar(item)"
                :name="$_ocFileName(item)" :extension="item.extension" class="file-row-name" :icon="fileTypeIcon(item)"
                :filename="item.name" :key="item.id"/>
              <oc-spinner
                v-if="actionInProgress(item)"
                size="small"
                :uk-tooltip="disabledActionTooltip(item)"
                class="uk-margin-small-left"
              />
            </oc-table-cell>
            <oc-table-cell class="uk-text-meta uk-text-nowrap" :class="{ 'uk-visible@s' : !_sidebarOpen, 'uk-visible@m'  : _sidebarOpen }">
              {{ item.size | fileSize }}
            </oc-table-cell>
            <oc-table-cell class="uk-text-meta uk-text-nowrap" :class="{ 'uk-visible@s' : !_sidebarOpen, 'uk-visible@m'  : _sidebarOpen }">
              {{ formDateFromNow(item.mdate) }}
            </oc-table-cell>
          </template>
          <template #footer>
            <div v-if="activeFilesCount.folders > 0 || activeFilesCount.files > 0" class="uk-text-nowrap uk-text-meta">
              <template v-if="activeFilesCount.folders > 0">
                {{ activeFilesCount.folders }}
                <translate :translate-n="activeFilesCount.folders" translate-plural="folders">folder</translate>
              </template>
              <translate v-if="activeFilesCount.folders > 0 && activeFilesCount.files > 0">and</translate>
              <template v-if="activeFilesCount.files > 0">
                {{ activeFilesCount.files }}
                <translate :translate-n="activeFilesCount.files" translate-plural="files">file</translate>
              </template>
              <template v-if="activeFiles.length > 0">
                &dash; {{ filesTotalSize | fileSize }}
              </template>
            </div>
            <div v-if="!publicPage()" class="uk-visible@s uk-width-2-3 uk-width-1-2@xl uk-text-meta uk-flex" :class="{ 'uk-visible@xl' : _sidebarOpen  }">
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

import Mixins from '../mixins'
import FileActions from '../fileactions'

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
  mounted () {
    this.$_ocFilesFolder_getFolder()
  },
  methods: {
    ...mapActions('Files', ['loadFolder', 'setFilterTerm', 'markFavorite',
      'setHighlightedFile', 'setPublicLinkPassword']),

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
        routeName: this.$route.name
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
    ...mapGetters('Files', ['loadingFolder', 'activeFiles', 'quota', 'filesTotalSize', 'activeFilesCount']),
    ...mapGetters(['configuration']),

    item () {
      return this.$route.params.item
    }
  },
  watch: {
    $route () {
      this.$_ocFilesFolder_getFolder()
    }
  }
}
</script>
