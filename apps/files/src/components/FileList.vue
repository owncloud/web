<template>
  <oc-table middle divider class="oc-filelist" id="files-list">
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
      <oc-table-row v-for="(item, index) in fileData" :key="index" class="file-row">
        <oc-table-cell>
          <oc-checkbox class="uk-margin-small-left" @change.native="$emit('toggle', item)" :value="selectedFiles.indexOf(item) >= 0" />
        </oc-table-cell>
        <oc-table-cell class="uk-padding-remove">
          <oc-star class="uk-display-block" @click.native="toggleFileFavorite(item)" :shining="item.starred" />
        </oc-table-cell>
        <oc-table-cell class="uk-text-truncate">
          <oc-file @click.native="item.type === 'folder' ? navigateTo('files-list', item.path.substr(1)) : openFileActionBar(item)"
                   :name="item.basename" :extension="item.extension" class="file-row-name" :icon="fileTypeIcon(item)"
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
            <oc-button v-for="(action, index) in actions" :key="index" @click.native="action.handler(item, action.handlerData)" :disabled="!action.isEnabled(item)" :icon="action.icon" :ariaLabel="action.ariaLabel" />
          </div>
          <oc-button
            :id="'files-file-list-action-button-small-resolution-' + index"
            icon="menu"
            :class="{ 'uk-hidden@m' : !_sidebarOpen, 'uk-visible@s uk-hidden@xl' : _sidebarOpen }"
          />
          <oc-drop
            :toggle="'#files-file-list-action-button-small-resolution-' + index"
            :options="{ 'pos': 'bottom-center' }"
            class="uk-width-auto"
          >
            <ul class="uk-list">
              <li v-for="(action, index) in actions" :key="index">
                <oc-button  @click.native="action.handler(item, action.handlerData)" :disabled="!action.isEnabled(item)" :icon="action.icon" :ariaLabel="action.ariaLabel" />
              </li>
            </ul>
          </oc-drop>
        </oc-table-cell>
      </oc-table-row>
    </oc-table-group>
    <oc-dialog-prompt name="change-file-dialog" :oc-active="changeFileName" v-model="newName" :ocError="changeFileErrorMessage"
                      :ocTitle="_renameDialogTitle" ocConfirmId="oc-dialog-rename-confirm" @oc-confirm="changeName" @oc-cancel="changeFileName = false; newName = ''"></oc-dialog-prompt>
    <oc-dialog-prompt name="delete-file-confirmation-dialog" :oc-active="deleteConfirmation !== ''" :oc-content="deleteConfirmation" :oc-has-input="false"
                      :ocTitle="_deleteDialogTitle" ocConfirmId="oc-dialog-delete-confirm" @oc-confirm="reallyDeleteFile" @oc-cancel="deleteConfirmation = ''"></oc-dialog-prompt>
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
    deleteConfirmation: '',
    fileToBeDeleted: '',
    newName: ''
  }),
  methods: {
    ...mapActions('Files', ['markFavorite', 'resetFileSelection', 'addFileSelection', 'removeFileSelection', 'deleteFiles', 'renameFile']),
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
    getBaseDirectory (filePath) {
      return filePath.match(/^(.*[/])/)[0].slice(0, -1)
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
      this.deleteConfirmation = this.$gettextInterpolate(translated, { fileName: file.name }, true)
    },
    openSideBar (file, sideBarName) {
      this.$emit('sideBarOpen', file, sideBarName)
    },
    dropExtension (name, extension) {
      if (!extension) {
        return name
      }
      return name.substring(0, name.length - extension.length - 1)
    }
  },
  computed: {
    ...mapGetters('Files', ['selectedFiles', 'atSearchPage']),
    ...mapGetters(['getToken', 'fileSideBars']),
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
          ariaLabel: 'Edit',
          isEnabled: function (item) {
            return item.canRename()
          } },
        { icon: 'file_download',
          handler: this.downloadFile,
          ariaLabel: 'Download',
          isEnabled: function (item) {
            return item.canDownload()
          } },
        { icon: 'delete',
          ariaLabel: 'Delete',
          handler: this.deleteFile,
          isEnabled: function (item) {
            return item.canBeDeleted()
          } }
      ]
      for (let sideBarName in this.fileSideBars) {
        let sideBar = this.fileSideBars[sideBarName]
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
      return this.selectedFiles.length > 0
    }
  }
}
</script>
