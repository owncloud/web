<template>
  <oc-table middle divider class="oc-filelist" id="files-list">
    <oc-table-group>
      <oc-table-row>
        <oc-table-cell shrink type="head">
          <oc-checkbox class="uk-margin-small-left" @click.native="toggleAll" :value="all" />
        </oc-table-cell>
        <oc-table-cell shrink />
        <oc-table-cell type="head" class="uk-text-truncate" v-text="'Name'"/>
        <oc-table-cell shrink type="head" v-text="'Size'"/>
        <oc-table-cell shrink type="head" class="uk-text-nowrap uk-visible@s" v-text="'Modification Time'"/>
        <oc-table-cell shrink type="head" v-text="'Actions'"/>
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
        <oc-table-cell>
          <oc-file @click.native="item.extension === false ? navigateTo('files-list', item.path.substr(1)) : openFileActionBar(item)"
                   :name="item.basename" :extension="item.extension ? item.extension : ''" class="file-row-name" :icon="fileTypeIcon(item)"
                   :filename="item.name"/>
        </oc-table-cell>
        <oc-table-cell class="uk-text-meta uk-text-nowrap">
          {{ item.size | fileSize }}
        </oc-table-cell>
        <oc-table-cell class="uk-text-meta uk-text-nowrap uk-visible@s">
          {{ formDateFromNow(item.mdate) }}
        </oc-table-cell>
        <oc-table-cell>
          <div class="uk-button-group uk-margin-small-right">
            <oc-button v-for="(action, index) in actions" :key="index" @click.native="action.handler(item, action.handlerData)" :disabled="!action.isEnabled(item)" :icon="action.icon" aria-label="Edit Picture" />
          </div>
        </oc-table-cell>
      </oc-table-row>
    </oc-table-group>
    <oc-dialog-prompt name="change-file-dialog" :oc-active="changeFileName" v-model="newName"
                      :ocTitle="_renameDialogTitle" @oc-confirm="changeName" @oc-cancel="changeFileName = false; newName = ''"></oc-dialog-prompt>
    <oc-dialog-prompt name="delete-file-confirmation-dialog" :oc-active="deleteConfirmation !== ''" :oc-content="deleteConfirmation" :oc-has-input="false"
                      :ocTitle="_deleteDialogTitle" @oc-confirm="reallyDeleteFile" @oc-cancel="deleteConfirmation = ''"></oc-dialog-prompt>
  </oc-table>
</template>
<script>
import OcDialogPrompt from './ocDialogPrompt.vue'
import { includes } from 'lodash'
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
          if (!includes(this.selectedFiles, item)) {
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
    deleteFile (file) {
      this.fileToBeDeleted = file
      let translated = this.$gettext('Please confirm the deletion of %{file}')
      this.deleteConfirmation = this.$gettextInterpolate(translated, { file: file.name })
    },
    /* shareFile (file) {
      this.deleteConfirmation = this.$gettextInterpolate(translated, { file: file.name })
    }, */
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
    actions () {
      let actions = [
        { icon: 'edit',
          handler: this.changeName,
          isEnabled: function (item) {
            return item.canRename()
          } },
        { icon: 'file_download',
          handler: this.downloadFile,
          isEnabled: function (item) {
            return item.canDownload()
          } },
        { icon: 'delete',
          handler: this.deleteFile,
          isEnabled: function (item) {
            return item.canBeDeleted()
          } }
      ]
      for (let sideBarName in this.fileSideBars) {
        let sideBar = this.fileSideBars[sideBarName]
        if (sideBar.quickAccess) {
          actions.push({ icon: sideBar.quickAccess.icon,
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
    }
  }
}

</script>
