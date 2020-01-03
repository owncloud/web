<template>
  <div id="files-list-container">
    <oc-table middle divider class="oc-filelist" id="files-list" v-show="!loadingFolder">
      <oc-table-group>
        <oc-table-row>
          <oc-table-cell shrink type="head">
            <oc-checkbox :hideLabel="true" class="uk-margin-small-left" id="filelist-check-all" @click.stop @change.native="$_ocTrashbin_toggleAll" :value="all" />
          </oc-table-cell>
          <oc-table-cell type="head" class="uk-text-nowrap" v-translate>Name</oc-table-cell>
          <oc-table-cell shrink type="head" class="uk-text-nowrap uk-visible@m" v-translate>Deletion Time</oc-table-cell>
          <oc-table-cell shrink type="head" v-translate>Actions</oc-table-cell>
        </oc-table-row>
      </oc-table-group>
      <oc-table-group v-for="(item, index) in fileData" :key="index">
        <oc-table-row class="file-row" data-is-visible="true">
          <oc-table-cell>
            <oc-checkbox :hideLabel="true" class="uk-margin-small-left" @click.stop @change.native="$_ocTrashbin_toggleFileSelect(item)" :value="selectedFiles.indexOf(item) >= 0" />
          </oc-table-cell>
          <oc-table-cell class="uk-text-truncate">
            <div>
              <oc-file :name="$_ocTrashbin_fileName(item)" :extension="item.extension" class="file-row-name"
                    :filename="item.name" :icon="fileTypeIcon(item)" :key="item.originalLocation" />
            </div>
          </oc-table-cell>
          <oc-table-cell class="uk-text-meta uk-text-nowrap uk-visible@m">
            {{ formDateFromNow(item.deleteTimestamp) }}
          </oc-table-cell>
          <oc-table-cell class="uk-text-meta uk-text-nowrap">
            <oc-button icon="restore" class="uk-visible@m" @click="$_ocTrashbin_restoreFile(item)">
              <translate>Restore</translate>
            </oc-button>
            <oc-button icon="delete" class="uk-visible@m" @click="$_ocTrashbin_deleteFile(item)" ariaLabel="Delete">
              <translate>Delete immediately</translate>
            </oc-button>
            <oc-button
              :id="'files-trashbin-action-button-small-resolution-' + index"
              icon="more_vert"
              class="uk-hidden@m"
              :aria-label="'show-file-actions'"
              @click.stop
            />
            <oc-drop
              v-if="!ocDialogIsOpen"
              :toggle="'#files-trashbin-action-button-small-resolution-' + index"
              :options="{ offset: 0 }"
              position="bottom-right"
              :data-actions-dropdown-for-item="nameForDropdownData(item.name)"
            >
              <ul class="uk-list">
                <li>
                  <oc-button icon="restore" class="uk-width-1-1" @click="$_ocTrashbin_restoreFile(item)" ariaLabel="Restore">
                    <translate>Restore</translate>
                  </oc-button>
                </li>
                <li>
                  <oc-button icon="delete" class="uk-width-1-1" @click="$_ocTrashbin_deleteFile(item)" ariaLabel="Delete">
                    <translate>Delete immediately</translate>
                  </oc-button>
                </li>
              </ul>
            </oc-drop>
          </oc-table-cell>
        </oc-table-row>
      </oc-table-group>
    </oc-table>
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
import OcDialogPrompt from './ocDialogPrompt.vue'
// import PQueue from 'p-queue'
const { default: PQueue } = require('p-queue')

export default {
  name: 'Trashbin',
  props: ['fileData'],

  data () {
    return {
      queue: new PQueue({ concurrency: 4 }),
      ocDialogIsOpen: false
    }
  },

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
      const files = this.selectedFiles
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
      this.ocDialogIsOpen = true
      this.resetFileSelection()
      this.addFileSelection(item)

      this.setTrashbinDeleteMessage(this.$gettext('This item will be deleted permanently. You can’t undo this action.'))
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
        const selectedFiles = this.fileData.slice()
        for (const item of selectedFiles) {
          if (!this.selectedFiles.includes(item)) {
            this.addFileSelection(item)
          }
        }
      }
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
    // FIXME: Remove as soon as trashbin has virtual scroll
    nameForDropdownData (name) {
      // Escape double quotes inside of selector
      if (name.indexOf('"') > -1) {
        name = name.replace(/\\([\s\S])|(")/g, '&quot;')
      }

      return name
    }
  }
}
</script>
