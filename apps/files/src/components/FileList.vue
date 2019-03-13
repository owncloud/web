<template>
  <oc-table middle divider>
    <oc-table-group>
      <oc-table-row>
        <oc-table-cell shrink type="head">
          <oc-checkbox />
        </oc-table-cell>
        <oc-table-cell type="head" class="uk-text-truncate" v-text="'Name'"/>
        <oc-table-cell shrink type="head" v-text="'Size'"/>
        <oc-table-cell shrink type="head" class="uk-text-nowrap uk-visible@s" v-text="'Modification Time'"/>
        <oc-table-cell shrink type="head" v-text="'Actions'"/>
      </oc-table-row>
    </oc-table-group>
    <oc-table-group>
      <oc-table-row v-for="(i,o) in new Array(3)" :key="o">
        <oc-table-cell>
          <oc-checkbox />
        </oc-table-cell>
        <oc-table-cell>
          <oc-file mimeType="image/png" :name="'Picture ' + ++o"/>
        </oc-table-cell>
        <oc-table-cell class="uk-text-muted uk-text-nowrap" v-text=" (++o * 128) + ' Kb'" />
        <oc-table-cell class="uk-text-muted uk-text-nowrap uk-visible@s" v-text=" ++o + ' days ago'" />
        <oc-table-cell>
          <div class="uk-button-group">
            <oc-button icon="edit" aria-label="Edit Picture" />
            <oc-button icon="file_download" aria-label="Download Picture" />
            <oc-button icon="delete" aria-label="Delete Picture" />
          </div>
        </oc-table-cell>
      </oc-table-row>
    </oc-table-group>
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
      let translated = this.$gettext('Please confirm the deletion of %{file}')
      this.deleteConfirmation = this.$gettextInterpolate(translated, { file: file.name })
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
