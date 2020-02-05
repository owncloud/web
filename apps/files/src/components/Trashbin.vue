<template>
  <div id="files-list-container" class="uk-height-1-1">
    <div class="uk-overflow-auto uk-height-1-1">
      <file-list
        id="files-list"
        :fileData="fileData"
        :loading="loadingFolder"
        :actions="actions"
        :isActionEnabled="isActionEnabled"
        :selectableRow="false"
      >
        <template #headerColumns>
          <div class="uk-text-truncate uk-text-meta uk-width-expand" v-translate>Name</div>
          <div
            type="head"
            :class="{ 'uk-visible@s' : !_sidebarOpen, 'uk-hidden'  : _sidebarOpen }"
            class="uk-text-nowrap uk-text-meta uk-width-small"
            v-translate
          >
            Deletion Time
          </div>
        </template>
        <template #rowColumns="{ item }">
          <div class="uk-text-truncate uk-width-expand">
            <oc-file
              :name="$_ocTrashbin_fileName(item)" :extension="item.extension" class="file-row-name" :icon="fileTypeIcon(item)"
              :filename="item.name" :key="item.id"/>
          </div>
          <div class="uk-text-meta uk-text-nowrap uk-width-small" :class="{ 'uk-visible@s' : !_sidebarOpen, 'uk-hidden'  : _sidebarOpen }">
            {{ formDateFromNow(item.deleteTimestamp) }}
          </div>
        </template>
      </file-list>
    </div>
    <oc-dialog-prompt name="delete-file-confirmation-dialog" :oc-active="trashbinDeleteMessage !== ''"
                      :oc-content="trashbinDeleteMessage" :oc-has-input="false" :ocTitle="_deleteDialogTitle"
                      ocConfirmId="oc-dialog-delete-confirm" @oc-confirm="$_ocTrashbin_clearTrashbinConfirmation"
                      @oc-cancel="$_ocTrashbin_cancelTrashbinConfirmation"
    />
  </div>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'
import Mixins from '../mixins'
import FileList from './FileList.vue'
import OcDialogPrompt from './ocDialogPrompt.vue'
const { default: PQueue } = require('p-queue')

export default {
  name: 'Trashbin',

  components: {
    OcDialogPrompt,
    FileList
  },

  mixins: [
    Mixins
  ],
  props: ['fileData'],

  data () {
    return {
      queue: new PQueue({ concurrency: 4 }),
      ocDialogIsOpen: false
    }
  },

  computed: {
    ...mapGetters('Files', ['loadingFolder', 'selectedFiles', 'trashbinDeleteMessage']),

    _deleteDialogTitle () {
      const files = this.selectedFiles
      let translated

      if (files.length === 1) {
        translated = this.$gettext('Are you sure you want to delete "%{file}"?')
        return this.$gettextInterpolate(translated, { file: files[0].name }, true)
      }

      translated = this.$gettext('Are you sure you want delete %{numberOfFiles} selected items?')
      return this.$gettextInterpolate(translated, { numberOfFiles: files.length }, true)
    },

    actions () {
      return [
        {
          icon: 'restore',
          ariaLabel: this.$gettext('Restore'),
          handler: this.$_ocTrashbin_restoreFile,
          isEnabled: () => true
        },
        {
          icon: 'delete',
          ariaLabel: this.$gettext('Delete'),
          handler: this.$_ocTrashbin_deleteFile,
          isEnabled: () => true
        }
      ]
    }
  },

  beforeMount () {
    this.$_ocTrashbin_getFiles()
  },

  methods: {
    ...mapActions('Files', ['loadTrashbin', 'addFileSelection', 'removeFileSelection', 'resetFileSelection', 'setTrashbinDeleteMessage', 'removeFilesFromTrashbin']),
    ...mapActions(['showMessage']),

    $_ocTrashbin_getFiles () {
      this.loadTrashbin({
        client: this.$client,
        $gettext: this.$gettext
      })
    },
    $_ocTrashbin_deleteFile (item) {
      this.ocDialogIsOpen = true
      this.resetFileSelection()
      this.addFileSelection(item)

      this.setTrashbinDeleteMessage(this.$gettext('This item will be deleted permanently. You can’t undo this action.'))
    },

    $_ocTrashbin_clearTrashbinConfirmation (files = this.selectedFiles) {
      // TODO: use clear all if all files are selected
      this.ocDialogIsOpen = false
      const deleteOps = []

      const self = this
      function deleteFile (file) {
        return () => {
          return self.$client.fileTrash.clearTrashBin(file.id)
            .then(() => {
              self.$_ocTrashbin_removeFileFromList([file])
              const translated = self.$gettext('%{file} was successfully deleted')
              self.showMessage({
                title: self.$gettextInterpolate(translated, { file: file.name }, true)
              })
            })
            .catch(error => {
              if (error.statusCode === 423) {
                // TODO: we need a may retry option ....
                const p = self.queue.add(deleteFile(file))
                deleteOps.push(p)
                return
              }

              const translated = self.$gettext('Deletion of %{file} failed')
              self.showMessage({
                title: self.$gettextInterpolate(translated, { file: file.name }, true),
                desc: error.message,
                status: 'danger'
              })
            })
        }
      }

      for (const file of files) {
        const p = this.queue.add(deleteFile(file))
        deleteOps.push(p)
      }
      Promise.all(deleteOps).then(() => {
        this.resetFileSelection()
        this.setTrashbinDeleteMessage('')
      })
    },

    $_ocTrashbin_cancelTrashbinConfirmation () {
      this.setTrashbinDeleteMessage('')
      this.ocDialogIsOpen = false
    },

    $_ocTrashbin_restoreFile (file) {
      this.resetFileSelection()
      this.addFileSelection(file)
      this.$client.fileTrash.restore(file.id, file.originalLocation)
        .then(() => {
          this.$_ocTrashbin_removeFileFromList([file])
          const translated = this.$gettext('%{file} was restored successfully')
          this.showMessage({
            title: this.$gettextInterpolate(translated, { file: file.name }, true)
          })
        })
        .catch(error => {
          const translated = this.$gettext('Restoration of %{file} failed')
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
    },

    $_ocTrashbin_fileName (item) {
      if (item && item.originalLocation) {
        const pathSplit = item.originalLocation.split('/')
        if (pathSplit.length === 2) return `${pathSplit[pathSplit.length - 2]}/${item.basename}`
        if (pathSplit.length > 2) return `…/${pathSplit[pathSplit.length - 2]}/${item.basename}`
      }
      return item.basename
    },

    isActionEnabled (item, action) {
      return action.isEnabled(item, this.parentFolder)
    }
  }
}
</script>
