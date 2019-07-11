<template>
  <oc-table middle divider class="oc-filelist" id="files-list" v-show="!loadingFolder">
    <oc-table-group>
      <oc-table-row>
        <oc-table-cell shrink type="head">
          <oc-checkbox class="uk-margin-small-left" @click.native="toggleAll" :value="all" />
        </oc-table-cell>
        <oc-table-cell shrink />
        <oc-table-cell type="head" class="uk-text-truncate" v-translate>Name</oc-table-cell>
        <oc-table-cell shrink type="head" :class="{ 'uk-visible@s' : !_sidebarOpen, 'uk-visible@m'  : _sidebarOpen }"><translate>Size</translate></oc-table-cell>
        <oc-table-cell shrink type="head" :class="{ 'uk-visible@s' : !_sidebarOpen, 'uk-visible@m'  : _sidebarOpen }" class="uk-text-nowrap" v-translate>Modification Time</oc-table-cell>
        <oc-table-cell shrink type="head" :class="{ 'uk-visible@s' : _sidebarOpen }" v-translate>Actions</oc-table-cell>
      </oc-table-row>
    </oc-table-group>
    <oc-table-group>
      <oc-table-row v-for="(item, index) in fileData" :key="index" :class="_rowClasses(item)" @click="selectRow(item)">
        <oc-table-cell>
          <oc-checkbox class="uk-margin-small-left" @click.stop @change.native="$emit('toggle', item)" :value="selectedFiles.indexOf(item) >= 0" />
        </oc-table-cell>
        <oc-table-cell class="uk-padding-remove">
          <oc-star class="uk-display-block" @click.native.stop="toggleFileFavorite(item)" :shining="item.starred" />
        </oc-table-cell>
        <oc-table-cell class="uk-text-truncate">
          <oc-file @click.native.stop="item.type === 'folder' ? navigateTo('files-list', item.path.substr(1)) : openFileActionBar(item)"
                   :name="$_ocFileName(item)" :extension="item.extension" class="file-row-name" :icon="fileTypeIcon(item)"
                   :filename="item.name" :key="item.id" />
        </oc-table-cell>
        <oc-table-cell class="uk-text-meta uk-text-nowrap" :class="{ 'uk-visible@s' : !_sidebarOpen, 'uk-visible@m'  : _sidebarOpen }">
          {{ item.size | fileSize }}
        </oc-table-cell>
        <oc-table-cell class="uk-text-meta uk-text-nowrap" :class="{ 'uk-visible@s' : !_sidebarOpen, 'uk-visible@m'  : _sidebarOpen }">
          {{ formDateFromNow(item.mdate) }}
        </oc-table-cell>
        <oc-table-cell :class="{ 'uk-visible@s' : _sidebarOpen }">
          <div class="uk-button-group uk-margin-small-right" :class="{ 'uk-visible@m' : !_sidebarOpen, 'uk-visible@xl' : _sidebarOpen  }">
            <oc-button v-for="(action, index) in actions" :key="index" @click.stop="action.handler(item, action.handlerData)" :disabled="!action.isEnabled(item)" :icon="action.icon" :ariaLabel="action.ariaLabel" />
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
            :options="{ 'pos': 'bottom-center' }"
            class="uk-width-auto"
          >
            <ul class="uk-list">
              <li v-for="(action, index) in actions" :key="index">
                <oc-button
                  class="uk-width-1-1"
                  @click.native.stop="action.handler(item, action.handlerData)"
                  :disabled="!action.isEnabled(item)"
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
    <oc-dialog-prompt name="change-file-dialog" :oc-active="changeFileName" v-model="newName" :ocError="changeFileErrorMessage"
                      :ocTitle="_renameDialogTitle" ocConfirmId="oc-dialog-rename-confirm" @oc-confirm="changeName" @oc-cancel="changeFileName = false; newName = ''"></oc-dialog-prompt>
    <oc-dialog-prompt name="delete-file-confirmation-dialog" :oc-active="filesDeleteMessage !== ''"
                      :oc-content="filesDeleteMessage" :oc-has-input="false" :ocTitle="_deleteDialogTitle"
                      ocConfirmId="oc-dialog-delete-confirm" @oc-confirm="reallyDeleteFiles"
                      @oc-cancel="setFilesDeleteMessage('')"
    />

  </oc-table>
</template>
<script>
import OcDialogPrompt from './ocDialogPrompt.vue'
import { mapGetters, mapActions } from 'vuex'

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
  data: () => ({
    changeFileName: false,
    fileToBeDeleted: '',
    newName: ''
  }),
  methods: {
    ...mapActions('Files', ['markFavorite', 'resetFileSelection', 'addFileSelection', 'removeFileSelection',
      'deleteFiles', 'renameFile', 'setFilesDeleteMessage', 'setHighlightedFile']),
    ...mapActions(['openFile']),

    toggleAll () {
      if (this.selectedFiles.length && this.selectedFiles.length === this.fileData.length) {
        this.resetFileSelection()
      } else {
        let selectedFiles = this.fileData.slice()
        for (let item of selectedFiles) {
          if (!this.selectedFiles.includes(item)) {
            this.addFileSelection(item)
          }
        }
      }
    },
    toggleFileFavorite (item) {
      this.markFavorite({
        client: this.$client,
        file: item
      })
    },
    openFileActionBar (file) {
      this.$emit('FileAction', file)
    },
    checkNewName (name) {
      if (/[/]/.test(name)) {
        return this.$gettext('Name cannot contain "/"')
      }
      return null
    },
    deleteFile (file) {
      this.fileToBeDeleted = file
      let translated = this.$gettext('Please confirm the deletion of %{ fileName }')
      this.setFilesDeleteMessage(this.$gettextInterpolate(translated, { fileName: file.name }, true))
    },
    openSideBar (file, sideBarName) {
      this.$emit('sideBarOpen', file, sideBarName)
    },
    $_ocFileName (item) {
      if (this.$route.name === 'files-favorites') {
        const pathSplit = item.path.substr(1).split('/')
        if (pathSplit.length === 2) return `${pathSplit[pathSplit.length - 2]}/${item.basename}`
        if (pathSplit.length > 2) return `…/${pathSplit[pathSplit.length - 2]}/${item.basename}`
      }
      return item.basename
    },
    reallyDeleteFiles () {
      const files = this.fileToBeDeleted ? [this.fileToBeDeleted] : this.selectedFiles
      this.deleteFiles({
        client: this.$client,
        files: files
      }).then(() => {
        this.fileToBeDeleted = ''
        this.setFilesDeleteMessage('')
      })
    },
    _rowClasses (item) {
      if (this.highlightedFile && item.id === this.highlightedFile.id) {
        return 'file-row uk-active'
      }
      return 'file-row'
    },
    selectRow (item) {
      this.setHighlightedFile(item)
    }
  },
  computed: {
    ...mapGetters('Files', ['selectedFiles', 'atSearchPage', 'loadingFolder', 'filesDeleteMessage', 'highlightedFile']),
    ...mapGetters(['getToken', 'fileSideBars', 'capabilities']),
    all () {
      return this.selectedFiles.length === this.fileData.length && this.fileData.length !== 0
    },
    changeFileErrorMessage () {
      return this.checkNewName(this.newName)
    },
    actions () {
      let actions = [
        { icon: 'edit',
          handler: this.changeName,
          ariaLabel: this.$gettext('Edit'),
          isEnabled: function (item) {
            return item.canRename()
          } },
        { icon: 'file_download',
          handler: this.downloadFile,
          ariaLabel: this.$gettext('Download'),
          isEnabled: function (item) {
            return item.canDownload()
          } },
        { icon: 'delete',
          ariaLabel: this.$gettext('Delete'),
          handler: this.deleteFile,
          isEnabled: function (item) {
            return item.canBeDeleted()
          } }
      ]
      for (let sideBarName in this.fileSideBars) {
        let sideBar = this.fileSideBars[sideBarName]
        if (sideBar.enabled !== undefined && !sideBar.enabled(this.capabilities)) {
          continue
        }
        if (sideBar.quickAccess) {
          actions.push({
            icon: sideBar.quickAccess.icon,
            ariaLabel: sideBar.quickAccess.ariaLabel,
            handler: this.openSideBar,
            handlerData: sideBarName,
            isEnabled: function (item) {
              return true
            }
          })
        }
      }

      return actions
    },
    _renameDialogTitle () {
      return this.$gettext('Rename File/Folder')
    },
    _deleteDialogTitle () {
      return this.$gettext('Delete File/Folder')
    },
    _sidebarOpen () {
      return this.highlightedFile !== null
    },
    $_ocDialog_isOpen () {
      return this.changeFileName
    }
  }
}
</script>
