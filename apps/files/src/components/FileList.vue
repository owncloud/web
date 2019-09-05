<template>
  <div class="uk-height-1-1">
    <div class="uk-flex uk-flex-column uk-height-1-1">
      <div id="files-list-container" class="uk-overflow-auto uk-flex-auto">
        <oc-table middle divider class="oc-filelist uk-margin-remove-bottom" id="files-list" v-show="!loadingFolder && !!fileData.length">
          <thead>
            <oc-table-row>
              <oc-table-cell shrink type="head">
                <oc-checkbox class="uk-margin-small-left" id="filelist-check-all" @click.native="toggleAll" :value="selectedAll" />
              </oc-table-cell>
              <oc-table-cell shrink type="head" v-if="!publicPage()" />
              <oc-table-cell type="head" class="uk-text-truncate" v-translate>Name</oc-table-cell>
              <oc-table-cell shrink type="head" :class="{ 'uk-visible@s' : !_sidebarOpen, 'uk-visible@m'  : _sidebarOpen }"><translate>Size</translate></oc-table-cell>
              <oc-table-cell shrink type="head" :class="{ 'uk-visible@s' : !_sidebarOpen, 'uk-visible@m'  : _sidebarOpen }" class="uk-text-nowrap" v-translate>Modification Time</oc-table-cell>
              <oc-table-cell shrink type="head" :class="{ 'uk-visible@s' : _sidebarOpen }" v-translate>Actions</oc-table-cell>
            </oc-table-row>
          </thead>
          <oc-table-group>
            <oc-table-row v-for="(item, index) in fileData" :key="index" :class="_rowClasses(item)" @click="selectRow(item, $event)" :id="'file-row-' + item.id">
              <oc-table-cell>
                <oc-checkbox class="uk-margin-small-left" @click.stop @change.native="$emit('toggle', item)" :value="selectedFiles.indexOf(item) >= 0" />
              </oc-table-cell>
              <oc-table-cell class="uk-padding-remove" v-if="!publicPage()">
                <oc-star class="uk-display-block" @click.native.stop="toggleFileFavorite(item)" :shining="item.starred" />
              </oc-table-cell>
              <oc-table-cell class="uk-text-truncate">
                <oc-file @click.native.stop="item.type === 'folder' ? navigateTo(item.path.substr(1)) : openFileActionBar(item)"
                        :name="$_ocFileName(item)" :extension="item.extension" class="file-row-name" :icon="fileTypeIcon(item)"
                        :filename="item.name" :key="item.id"/>
              </oc-table-cell>
              <oc-table-cell class="uk-text-meta uk-text-nowrap" :class="{ 'uk-visible@s' : !_sidebarOpen, 'uk-visible@m'  : _sidebarOpen }">
                {{ item.size | fileSize }}
              </oc-table-cell>
              <oc-table-cell class="uk-text-meta uk-text-nowrap" :class="{ 'uk-visible@s' : !_sidebarOpen, 'uk-visible@m'  : _sidebarOpen }">
                {{ formDateFromNow(item.mdate) }}
              </oc-table-cell>
              <oc-table-cell :class="{ 'uk-visible@s' : _sidebarOpen }" class="uk-position-relative">
                <div class="uk-button-group uk-margin-small-right" :class="{ 'uk-visible@m' : !_sidebarOpen, 'uk-visible@xl' : _sidebarOpen  }">
                  <oc-button
                    v-for="(action, index) in actions"
                   :key="index"
                   @click.stop="action.handler(item, action.handlerData)"
                   :disabled="!action.isEnabled(item) || $_actionInProgress(item)"
                   :icon="action.icon"
                   :ariaLabel="action.ariaLabel"
                   :uk-tooltip="$_disabledActionTooltip(item)"
                  />
                </div>
                <oc-button
                  :id="'files-file-list-action-button-small-resolution-' + index"
                  icon="menu"
                  :class="{ 'uk-hidden@m' : !_sidebarOpen, 'uk-visible@s uk-hidden@xl' : _sidebarOpen }"
                  :aria-label="'show-file-actions'"
                  @click.stop
                />
                <oc-drop
                  v-if="!$_ocDialog_isOpen"
                  :toggle="'#files-file-list-action-button-small-resolution-' + index"
                  :options="{ offset: 0 }"
                  position="bottom-right"
                >
                  <ul class="uk-list">
                    <li v-for="(action, index) in enabledActions(item)" :key="index">
                      <oc-button
                        class="uk-width-1-1"
                        @click.native.stop="action.handler(item, action.handlerData)"
                        :icon="action.icon"
                        :ariaLabel="action.ariaLabel"
                      >
                        {{ action.ariaLabel }}
                      </oc-button>
                    </li>
                  </ul>
                </oc-drop>
              </oc-table-cell>
            </oc-table-row>
          </oc-table-group>
        </oc-table>
        <oc-grid gutter="large" class="uk-width-1-1 uk-padding-small" v-if="!loadingFolder && !fileData.length">
          <div>{{ $_ocEmptyFolderText() }}</div>
        </oc-grid>
      </div>
      <oc-grid gutter="large" class="uk-width-1-1 uk-padding-small" v-if="!loadingFolder">
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
      </oc-grid>
    </div>
    <oc-dialog-prompt name="change-file-dialog" :oc-active="changeFileName" v-model="newName" :ocError="changeFileErrorMessage"
                      :ocTitle="_renameDialogTitle" ocConfirmId="oc-dialog-rename-confirm" @oc-confirm="changeName"
                      @oc-cancel="changeFileName = false; newName = ''" />
    <oc-dialog-prompt name="delete-file-confirmation-dialog" :oc-active="filesDeleteMessage !== ''"
                      :oc-content="filesDeleteMessage" :oc-has-input="false" :ocTitle="_deleteDialogTitle"
                      ocConfirmId="oc-dialog-delete-confirm" @oc-confirm="reallyDeleteFiles"
                      @oc-cancel="setFilesDeleteMessage('')"/>
  </div>
</template>
<script>
import OcDialogPrompt from './ocDialogPrompt.vue'
import { mapGetters, mapActions, mapState } from 'vuex'

import Mixins from '../mixins'

export default {
  components: {
    OcDialogPrompt
  },
  mixins: [
    Mixins
  ],
  name: 'FileList',
  props: ['fileData', 'starsEnabled', 'checkboxEnabled', 'dateEnabled'],
  mounted () {
    this.$_ocFilesFolder_getFolder()
  },
  methods: {
    ...mapActions('Files', ['loadFolder', 'setFilterTerm', 'markFavorite',
      'setFilesDeleteMessage', 'setHighlightedFile', 'setPublicLinkPassword']),

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

    $_ocEmptyFolderText () {
      if (this.$route.name === 'files-favorites') {
        return this.$gettext('No favorites defined')
      }
      return this.$gettext('This folder is empty')
    },

    enabledActions (item) {
      return this.actions.filter(action => action.isEnabled(item))
    },

    $_actionInProgress (item) {
      return this.inProgress.some(itemInProgress => itemInProgress.id === item.id)
    },

    $_disabledActionTooltip (item) {
      if (this.$_actionInProgress(item)) {
        const message = this.$gettext('Another action is currently in progress for this %{itemType}')
        return this.$gettextInterpolate(message, { itemType: item.type })
      }

      return null
    }
  },
  computed: {
    ...mapState(['route']),
    ...mapGetters('Files', ['selectedFiles', 'loadingFolder', 'filesDeleteMessage', 'highlightedFile', 'activeFiles', 'quota', 'filesTotalSize', 'activeFilesCount', 'inProgress']),
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
