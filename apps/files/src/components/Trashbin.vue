<template>
  <file-list
    id="files-list"
    :file-data="fileData"
    :loading="loadingFolder"
    :selectable-row="false"
    :actions-enabled="true"
  >
    <template #headerColumns>
      <div class="uk-text-truncate uk-text-meta uk-width-expand">
        <sortable-column-header
          :aria-label="$gettext('Sort files by name')"
          :is-active="fileSortField === 'name'"
          :is-desc="fileSortDirectionDesc"
          @click="toggleSort('name')"
        >
          <translate translate-context="Name column in files table">Name</translate>
        </sortable-column-header>
      </div>
      <div
        :class="{ 'uk-visible@s': !_sidebarOpen, 'uk-hidden': _sidebarOpen }"
        class="uk-text-nowrap uk-text-meta uk-width-small"
      >
        <sortable-column-header
          class="uk-align-right"
          :aria-label="$gettext('Sort files by deletion time')"
          :is-active="fileSortField === 'deleteTimestampMoment'"
          :is-desc="fileSortDirectionDesc"
          @click="toggleSort('deleteTimestampMoment')"
        >
          <translate translate-context="Deletion time column in 'deleted files' table">
            Deletion Time
          </translate>
        </sortable-column-header>
      </div>
      <div class="oc-icon" />
    </template>
    <template #rowColumns="{ item }">
      <div class="uk-width-expand uk-flex uk-flex-middle">
        <file-item
          :key="item.viewId"
          :item="item"
          :name="$_ocTrashbin_fileName(item)"
          :display-preview="false"
        />
      </div>
      <div
        class="uk-text-meta uk-text-nowrap uk-width-small uk-text-right"
        :class="{ 'uk-visible@s': !_sidebarOpen, 'uk-hidden': _sidebarOpen }"
      >
        {{ formDateFromNow(item.deleteTimestamp) }}
      </div>
    </template>
    <template #loadingMessage>
      <translate>Loading deleted files</translate>
    </template>
    <template #noContentMessage>
      <no-content-message icon="delete">
        <template #message>
          <span v-translate>You have no deleted files.</span>
        </template>
      </no-content-message>
    </template>
  </file-list>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'
import Mixins from '../mixins'
import MixinDeleteResources from '../mixins/deleteResources'
import FileList from './FileList.vue'
import FileItem from './FileItem.vue'
import NoContentMessage from './NoContentMessage.vue'
import SortableColumnHeader from './FilesLists/SortableColumnHeader.vue'

export default {
  name: 'Trashbin',

  components: {
    FileList,
    FileItem,
    NoContentMessage,
    SortableColumnHeader
  },

  mixins: [Mixins, MixinDeleteResources],

  props: {
    fileData: {
      type: Array,
      required: true
    }
  },

  computed: {
    ...mapGetters('Files', ['loadingFolder']),

    actions() {
      return [
        {
          icon: 'restore',
          ariaLabel: () => this.$gettext('Restore'),
          handler: this.$_ocTrashbin_restoreFile,
          isEnabled: () => true
        },
        {
          icon: 'delete',
          ariaLabel: () => this.$gettext('Delete'),
          handler: this.deleteSingleResource,
          isEnabled: () => true
        }
      ]
    }
  },

  beforeMount() {
    this.$_ocTrashbin_getFiles()
  },

  methods: {
    ...mapActions('Files', [
      'loadTrashbin',
      'addFileSelection',
      'resetFileSelection',
      'removeFilesFromTrashbin'
    ]),
    ...mapActions(['showMessage']),

    $_ocTrashbin_getFiles() {
      this.loadTrashbin({
        client: this.$client,
        $gettext: this.$gettext
      })
    },

    $_ocTrashbin_restoreFile(file) {
      this.resetFileSelection()
      this.addFileSelection(file)
      this.$client.fileTrash
        .restore(file.id, file.originalLocation)
        .then(() => {
          this.removeFilesFromTrashbin([file])
          const translated = this.$gettext('%{file} was restored successfully')
          this.showMessage({
            title: this.$gettextInterpolate(translated, { file: file.name }, true),
            autoClose: {
              enabled: true
            }
          })
        })
        .catch(error => {
          const translated = this.$gettext('Restoration of %{file} failed')
          this.showMessage({
            title: this.$gettextInterpolate(translated, { file: file.name }, true),
            desc: error.message,
            status: 'danger',
            autoClose: {
              enabled: true
            }
          })
        })
      this.resetFileSelection()
    },

    $_ocTrashbin_fileName(item) {
      if (item && item.originalLocation) {
        const pathSplit = item.originalLocation.split('/')
        if (pathSplit.length === 2) return `${pathSplit[pathSplit.length - 2]}/${item.basename}`
        if (pathSplit.length > 2) return `…/${pathSplit[pathSplit.length - 2]}/${item.basename}`
      }
      return item.basename
    },

    isActionEnabled(item, action) {
      return action.isEnabled(item, this.parentFolder)
    },

    deleteSingleResource(resource) {
      this.$_deleteResources_displayDialog(resource, true)
    }
  }
}
</script>
