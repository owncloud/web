  <template>
    <div id="files" class="uk-flex uk-flex-column">
      <files-app-bar @upload-start="onUploadStart" @upload-end="onUploadEnd" />
      <upload-progress v-show="inProgress.length" class="uk-padding-small uk-background-muted" :progressbarFocus="progressbarFocussed" />
      <oc-grid class="uk-height-1-1 uk-flex-1 uk-overflow-auto">
        <div ref="filesListWrapper" tabindex="-1" class="uk-width-expand uk-overflow-auto uk-height-1-1" @dragover="$_ocApp_dragOver" :class="{ 'uk-visible@m' : _sidebarOpen }">
          <oc-loader id="files-list-progress" v-if="loadingFolder"></oc-loader>
          <trash-bin v-if="$route.name === 'files-trashbin'" :fileData="activeFiles" />
          <shared-files-list v-else-if="sharedList" :fileData="activeFiles" @sideBarOpen="openSideBar" />
          <all-files-list v-else @FileAction="openFileActionBar" :fileData="activeFiles" :parentFolder="currentFolder" @sideBarOpen="openSideBar" />
        </div>
        <file-details
          v-if="_sidebarOpen && $route.name !== 'files-trashbin'"
          ref="fileDetails" class="uk-width-1-1 uk-width-1-2@m uk-width-1-3@xl uk-height-1-1"
          @reset="setHighlightedFile(null)"
        />
    </oc-grid>
    <file-open-actions/>
    {{ /* FIXME: hack to prevent conflict of dialog id with the trashbin deletion dialog */ }}
    <template v-if="$route.name !== 'files-trashbin'">
      <oc-dialog-prompt name="change-file-dialog" :oc-active="renameDialogOpen" :value="renameDialogNewName" :ocError="renameDialogErrorMessage"
                        :ocTitle="$_renameDialogTitle" ocConfirmId="oc-dialog-rename-confirm" @oc-confirm="doRenameFile"
                        @oc-cancel="cancelRenameFile" @input="$_validateFileName" />
      <oc-dialog-prompt name="delete-file-confirmation-dialog" class="deletionConfirmationDialog" :oc-active="deleteDialogOpen"
                        :oc-content="deleteDialogMessage" :oc-has-input="false" :ocTitle="$_deleteDialogTitle"
                        ocConfirmId="oc-dialog-delete-confirm" @oc-confirm="reallyDeleteFiles"
                        @oc-cancel="cancelDeleteFile"/>
    </template>
  </div>
</template>
<script>
import Mixins from '../mixins'
import FileActions from '../fileactions'
import FileDetails from './FileDetails.vue'
import FilesAppBar from './FilesAppBar.vue'
import AllFilesList from './AllFilesList.vue'
import TrashBin from './Trashbin.vue'
import SharedFilesList from './Collaborators/SharedFilesList.vue'
import { mapActions, mapGetters } from 'vuex'
import FileOpenActions from './FileOpenActions.vue'
import OcDialogPrompt from './ocDialogPrompt.vue'
const UploadProgress = () => import('./UploadProgress.vue')

export default {
  mixins: [
    Mixins,
    FileActions
  ],
  components: {
    FileDetails,
    AllFilesList,
    FilesAppBar,
    FileOpenActions,
    TrashBin,
    SharedFilesList,
    UploadProgress,
    OcDialogPrompt
  },
  data () {
    return {
      createFolder: false,
      fileUploadName: '',
      fileUploadProgress: 0,
      upload: false,
      fileName: '',
      selected: [],
      breadcrumbs: [],
      self: {},
      renameDialogErrorMessage: null,
      progressbarFocussed: false
    }
  },
  methods: {
    ...mapActions('Files', ['dragOver', 'setHighlightedFile']),
    ...mapActions(['openFile', 'showMessage']),

    trace () {
      console.info('trace', arguments)
    },

    onUploadStart () {
      this.progressbarFocussed = true
    },
    onUploadEnd () {
      this.progressbarFocussed = false
      this.$refs.filesListWrapper.focus()
    },

    openFileActionBar (file) {
      this.openFile({
        filePath: file.path
      })
      let actions = this.extensions(file.extension)
      actions = actions.map(action => {
        return {
          label: action.name,
          icon: action.icon,
          onClick: () => {
            this.openFileAction(action, file.path)
          }
        }
      })
      actions.push({
        label: this.$gettext('Download'),
        icon: 'file_download',
        onClick: () => {
          this.downloadFile(file)
        }
      })

      this.$root.$emit('oc-file-actions:open', {
        filename: file.name,
        actions: actions
      })
    },

    openSideBar (file, sideBarName) {
      this.setHighlightedFile(file)
      const self = this
      this.$nextTick().then(() => {
        self.$refs.fileDetails.showSidebar(sideBarName)
      })
    },

    $_ocApp_dragOver () {
      this.dragOver(true)
    },

    $_ocAppSideBar_onReload () {
      this.$refs.filesList.$_ocFilesFolder_getFolder()
    },

    $_validateFileName (value) {
      this.renameDialogErrorMessage = this.validateFileName(value)
    }
  },

  computed: {
    ...mapGetters('Files', [
      'selectedFiles', 'activeFiles', 'dropzone', 'loadingFolder', 'highlightedFile', 'currentFolder', 'inProgress',
      'renameDialogSelectedFile',
      'deleteDialogSelectedFiles', 'deleteDialogMessage'
    ]),
    ...mapGetters(['extensions']),

    _sidebarOpen () {
      return this.highlightedFile !== null
    },

    sharedList () {
      return this.$route.name === 'files-shared-with-me' || this.$route.name === 'files-shared-with-others'
    },

    $_renameDialogTitle () {
      let translated

      if (!this.renameDialogSelectedFile || !this.renameDialogSelectedFile.name) return null

      if (this.renameDialogSelectedFile.type === 'folder') {
        translated = this.$gettext('Rename folder %{name}')
      } else {
        translated = this.$gettext('Rename file %{name}')
      }
      return this.$gettextInterpolate(translated, { name: this.renameDialogSelectedFile.name }, true)
    },

    $_deleteDialogTitle () {
      // FIXME: differentiate between file, folder and multiple
      return this.$gettext('Delete File/Folder')
    }
  },
  watch: {
    $route () {
      this.setHighlightedFile(null)
    }
  }
}
</script>
