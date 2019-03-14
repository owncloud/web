<template>
  <v-list two-line id="files-list">
    <v-list-tile>
      <v-list-tile-action>
        <v-checkbox
          :input-value="all"
          primary
          hide-details
          @click.native="toggleAll"
        ></v-checkbox>
      </v-list-tile-action>
      <v-list-tile-action></v-list-tile-action>
      <v-list-tile-avatar></v-list-tile-avatar>
      <v-list-tile-content>
        <v-list-tile-title v-translate>Name</v-list-tile-title>
        <v-list-tile-sub-title class="text--primary" v-translate>Size</v-list-tile-sub-title>
        <v-list-tile-sub-title v-translate>Modification Time</v-list-tile-sub-title>
      </v-list-tile-content>
    </v-list-tile>
    <v-divider></v-divider>
    <template v-for="(item, index) in fileData">
      <v-list-tile
        :key="item.path"
        class="file-row"
        avatar
        ripple
      >
        <v-list-tile-action>
          <v-checkbox
            @change="$emit('toggle', item)"
            :input-value="selectedFiles.indexOf(item) >= 0"
            primary
            hide-details></v-checkbox>
        </v-list-tile-action>
        <v-list-tile-action>
          <v-checkbox
            @change="toggleFileFavorite(item)"
            :input-value="item.starred"
            primary
            hide-details
            color="yellow"
            on-icon="star" off-icon="star_border" large></v-checkbox>
        </v-list-tile-action>
        <v-list-tile-avatar>
          <v-icon>{{ fileTypeIcon(item) }}</v-icon>
        </v-list-tile-avatar>
        <v-list-tile-content
          v-if="!atSearchPage"
          @click="item.extension === false ? navigateTo('files-list', item.path.substr(1)) : openFileActionBar(item)"
          style="cursor: pointer"
        >
          <v-list-tile-title class="file-row-name">{{ item.name }}</v-list-tile-title>
          <v-list-tile-sub-title class="text--primary">{{ item.size | fileSize }}</v-list-tile-sub-title>
          <v-list-tile-sub-title>{{ item.mdate | formDateFromNow }}</v-list-tile-sub-title>
        </v-list-tile-content>
        <v-list-tile-content
          v-else
          @click="item.extension === false ? navigateTo('files-list', item.path.substr(1)) : openFileActionBar(item)"
          style="cursor: pointer"
        >
          <v-list-tile-title>{{ item.name }}</v-list-tile-title>
          <v-list-tile-sub-title class="text--primary">{{ getBaseDirectory(item.path) }}</v-list-tile-sub-title>
          <v-list-tile-sub-title>{{ item.mdate | formDateFromNow }} | {{ item.size | fileSize }}</v-list-tile-sub-title>
        </v-list-tile-content>
        <v-list-tile-action
          v-for="(action, index) in actions"
          :key="index">
          <v-btn icon :disabled="!action.isEnabled(item)"
            @click="action.handler(item, action.handlerData)">
            <v-icon>{{ action.icon }}</v-icon>
          </v-btn>
        </v-list-tile-action>

      </v-list-tile>
      <v-divider
        v-if="index + 1 < fileData.length"
        :key="index"
      ></v-divider>
    </template>
    <oc-dialog-prompt :oc-active="changeFileName" v-model="newName"
                      ocTitle="Rename File/Folder" @oc-confirm="changeName" @oc-cancel="changeFileName = false; newName = ''"></oc-dialog-prompt>
    <oc-dialog-prompt :oc-active="deleteConfirmation !== ''" :oc-content="deleteConfirmation" :oc-has-input="false"
                      ocTitle="Delete File/Folder" @oc-confirm="reallyDeleteFile" @oc-cancel="deleteConfirmation = ''"></oc-dialog-prompt>
  </v-list>
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
      if (this.selectedFiles.length) {
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
      this.deleteConfirmation = this.$gettextInterpolate('Please confirm the deletion of %{file}', { file: file.name })
    },
    openSideBar (file, sideBarName) {
      this.$emit('sideBarOpen', file, sideBarName)
    }
  },
  computed: {
    ...mapGetters('Files', ['selectedFiles', 'atSearchPage']),
    ...mapGetters(['getToken', 'fileSideBars']),
    all () {
      return this.selectedFiles.length === this.fileData.length
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
    }
  }
}

</script>
