<template>
  <div>
    <oc-table middle divider class="oc-filelist" id="files-list" v-show="!loadingFolder">
      <oc-table-group>
        <oc-table-row>
          <oc-table-cell shrink type="head">
            <oc-checkbox class="uk-margin-small-left" id="filelist-check-all" @click.native="$_ocTrashbin_toggleAll" :value="all" />
          </oc-table-cell>
          <oc-table-cell type="head" class="uk-text-truncate" v-translate>Name</oc-table-cell>
          <oc-table-cell shrink type="head" class="uk-text-nowrap" v-translate>Deletion Time</oc-table-cell>
          <oc-table-cell shrink type="head" v-translate>Actions</oc-table-cell>
        </oc-table-row>
      </oc-table-group>
      <oc-table-group>
        <oc-table-row v-for="(item, index) in fileData" :key="index" class="file-row">
          <oc-table-cell>
            <oc-checkbox class="uk-margin-small-left" @change.native="$_ocTrashbin_toggleFileSelect(item)" :value="selectedFiles.indexOf(item) >= 0" />
          </oc-table-cell>
          <oc-table-cell class="uk-text-truncate">
            <oc-file :name="item.basename" :extension="item.extension" class="file-row-name"
                    :filename="item.name" :icon="fileTypeIcon(item)" :key="item.path" />
          </oc-table-cell>
          <oc-table-cell class="uk-text-meta uk-text-nowrap">
            {{ formDateFromNow(item.deleteTimestamp) }}
          </oc-table-cell>
          <oc-table-cell class="uk-text-meta uk-text-nowrap">
            <oc-button icon="restore" @click="$_ocTrashbin_restoreFile(item)">
              <translate>Restore</translate>
            </oc-button>
            <oc-button icon="delete" @click="$_ocTrashbin_deleteFile(item)" ariaLabel="Delete">
              <translate>Delete immediately</translate>
            </oc-button>
          </oc-table-cell>
        </oc-table-row>
      </oc-table-group>
    </oc-table>
    <oc-dialog-prompt name="delete-file-confirmation-dialog" :oc-active="trashbinDeleteMessage !== ''"
                      :oc-content="trashbinDeleteMessage" :oc-has-input="false" :ocTitle="_deleteDialogTitle"
                      ocConfirmId="oc-dialog-delete-confirm" @oc-confirm="$_ocTrashbin_clearTrashbinConfirmation"
                      @oc-cancel="setTrashbinDeleteMessage('')"
    />
  </div>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'
import Mixins from '../mixins'
import OcDialogPrompt from './ocDialogPrompt.vue'

export default {
  name: 'Trashbin',
  props: ['fileData'],

  components: {
    OcDialogPrompt
  },

  mixins: [
    Mixins
  ],

  mounted () {
    this.$_ocTrashbin_getFiles()
  },

  computed: {
    ...mapGetters('Files', ['loadingFolder', 'selectedFiles', 'trashbinDeleteMessage']),

    _deleteDialogTitle () {
      let files = this.selectedFiles
      let translated

      if (files.length === 1) {
        translated = this.$gettext('Are you sure you want to delete "%{file}"?')
        return this.$gettextInterpolate(translated, { file: files[0].name }, true)
      }

      translated = this.$gettext('Are you sure you want delete %{numberOfFiles} selected items?')
      return this.$gettextInterpolate(translated, { numberOfFiles: files.length }, true)
    },

    all () {
      return this.selectedFiles.length === this.fileData.length && this.fileData.length !== 0
    }
  },

  methods: {
    ...mapActions('Files', ['loadTrashbin', 'addFileSelection', 'removeFileSelection', 'resetFileSelection', 'setTrashbinDeleteMessage', 'removeFilesFromTrashbin', 'setFilterTerm']),
    ...mapActions(['showMessage']),

    $_ocTrashbin_getFiles () {
      this.setFilterTerm('')
      this.loadTrashbin({
        client: this.$client,
        $gettext: this.$gettext
      })
    },
    $_ocTrashbin_deleteFile (item) {
      this.resetFileSelection()
      this.addFileSelection(item)

      this.setTrashbinDeleteMessage(this.$gettext('This item will be deleted immediately. You can’t undo this action.'))
    },

    $_ocTrashbin_toggleFileSelect (item) {
      if (this.selectedFiles.includes(item)) {
        this.removeFileSelection(item)
      } else {
        this.addFileSelection(item)
      }
    },

    $_ocTrashbin_toggleAll () {
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

    $_ocTrashbin_clearTrashbinConfirmation (files = this.selectedFiles) {
      for (let file of files) {
        this.$client.fileTrash.clearTrashBin(file.id)
          .then(() => {
            this.$_ocTrashbin_removeFileFromList([file])
            let translated = this.$gettext('%{file} was successfully deleted')
            this.showMessage({
              title: this.$gettextInterpolate(translated, { file: file.name }, true)
            })
          })
          .catch(error => {
            let translated = this.$gettext('Deletion of %{file} failed')
            this.showMessage({
              title: this.$gettextInterpolate(translated, { file: file.name }, true),
              desc: error.message,
              status: 'danger'
            })
          })
      }
      this.resetFileSelection()
      this.setTrashbinDeleteMessage('')
    },

    $_ocTrashbin_restoreFile (file) {
      this.resetFileSelection()
      this.addFileSelection(file)
      this.$client.fileTrash.restore(file.id, file.originalLocation)
        .then(() => {
          this.$_ocTrashbin_removeFileFromList([file])
          let translated = this.$gettext('%{file} was succesfully restored')
          this.showMessage({
            title: this.$gettextInterpolate(translated, { file: file.name }, true)
          })
        })
        .catch(error => {
          let translated = this.$gettext('Restoration of %{file} failed')
          this.showMessage({
            title: this.$gettextInterpolate(translated, { file: file.name }, true),
            desc: error.message,
            status: 'danger'
          })
        })
      this.resetFileSelection()
    },

    $_ocTrashbin_removeFileFromList (files) {
      this.removeFilesFromTrashbin(files)
    }
  }
}
</script>
