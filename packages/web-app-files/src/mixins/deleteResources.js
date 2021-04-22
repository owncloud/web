import { mapGetters, mapActions, mapMutations } from 'vuex'
import { cloneStateObject } from '../helpers/store'
import { checkRoute } from '../helpers/route'
import PQueue from 'p-queue'

export default {
  data: () => ({
    deleteResources_queue: new PQueue({ concurrency: 4 }),
    deleteResources_deleteOps: [],
    resourcesToDelete: []
  }),

  computed: {
    ...mapGetters('Files', ['selectedFiles']),
    ...mapGetters(['user']),

    $_deleteResources_isInTrashbin() {
      return checkRoute(['files-trashbin'], this.$route.name)
    },

    $_deleteResources_resources() {
      return cloneStateObject(this.resourcesToDelete)
    },

    $_deleteResources_dialogTitle() {
      const resources = this.$_deleteResources_resources
      const isFolder = resources[0].type === 'folder'
      let title = null

      if (resources.length === 1) {
        if (isFolder) {
          title = this.$_deleteResources_isInTrashbin
            ? this.$gettext('Permanently delete folder %{name}')
            : this.$gettext('Delete folder %{name}')
        } else {
          title = this.$_deleteResources_isInTrashbin
            ? this.$gettext('Permanently delete file %{name}')
            : this.$gettext('Delete file %{name}')
        }
        return this.$gettextInterpolate(
          title,
          {
            name: resources[0].name
          },
          true
        )
      }

      title = this.$_deleteResources_isInTrashbin
        ? this.$ngettext(
            'Permanently delete selected resource?',
            'Permanently delete %{amount} selected resources?',
            resources.length
          )
        : this.$ngettext(
            'Delete selected resource?',
            'Delete %{amount} selected resources?',
            resources.length
          )

      return this.$gettextInterpolate(title, { amount: resources.length }, false)
    },

    $_deleteResources_dialogMessage() {
      const resources = this.$_deleteResources_resources
      const isFolder = resources[0].type === 'folder'

      if (resources.length === 1) {
        if (isFolder) {
          return this.$_deleteResources_isInTrashbin
            ? this.$gettext(
                'Are you sure you want to delete this folder? All it’s content will be permanently removed. This action cannot be undone.'
              )
            : this.$gettext('Are you sure you want to delete this folder?')
        }
        return this.$_deleteResources_isInTrashbin
          ? this.$gettext(
              'Are you sure you want to delete this file? All it’s content will be permanently removed. This action cannot be undone.'
            )
          : this.$gettext('Are you sure you want to delete this file?')
      }

      return this.$_deleteResources_isInTrashbin
        ? this.$gettext(
            'Are you sure you want to delete all selected resources? All their content will be permanently removed. This action cannot be undone.'
          )
        : this.$gettext('Are you sure you want to delete all selected resources?')
    }
  },

  methods: {
    ...mapActions('Files', [
      'pushResourcesToDeleteList',
      'removeFilesFromTrashbin',
      'setHighlightedFile',
      'resetFileSelection',
      'addFileSelection',
      'deleteFiles'
    ]),
    ...mapActions(['showMessage', 'toggleModalConfirmButton', 'hideModal', 'createModal']),
    ...mapMutations(['SET_QUOTA']),

    $_deleteResources_hideDialog() {
      this.resetFileSelection()
      this.setHighlightedFile(null)
      this.hideModal()
    },

    $_deleteResources_trashbin_deleteOp(resource) {
      return this.$client.fileTrash
        .clearTrashBin(resource.id)
        .then(() => {
          this.removeFilesFromTrashbin([resource])
          const translated = this.$gettext('%{file} was successfully deleted')
          this.showMessage({
            title: this.$gettextInterpolate(translated, { file: resource.name }, true),
            autoClose: {
              enabled: true
            }
          })
        })
        .catch(error => {
          if (error.statusCode === 423) {
            // TODO: we need a may retry option ....
            const p = this.deleteResources_queue.add(() => {
              return this.$_deleteResources_trashbin_deleteOp(resource)
            })
            this.deleteResources_deleteOps.push(p)
            return
          }

          const translated = this.$gettext('Deletion of %{file} failed')
          this.showMessage({
            title: this.$gettextInterpolate(translated, { file: resource.name }, true),
            desc: error.message,
            status: 'danger',
            autoClose: {
              enabled: true
            }
          })
        })
    },

    $_deleteResources_trashbin_delete() {
      // TODO: use clear all if all files are selected
      this.toggleModalConfirmButton()
      for (const file of this.$_deleteResources_resources) {
        const p = this.deleteResources_queue.add(() => {
          return this.$_deleteResources_trashbin_deleteOp(file)
        })
        this.deleteResources_deleteOps.push(p)
      }

      Promise.all(this.deleteResources_deleteOps).then(() => {
        this.$_deleteResources_hideDialog()
        this.toggleModalConfirmButton()
      })
    },

    $_deleteResources_filesList_delete() {
      this.deleteFiles({
        client: this.$client,
        files: this.$_deleteResources_resources,
        publicPage: this.publicPage(),
        $gettext: this.$gettext,
        $gettextInterpolate: this.$gettextInterpolate
      }).then(async () => {
        this.$_deleteResources_hideDialog()
        this.toggleModalConfirmButton()

        // Load quota
        const user = await this.$client.users.getUser(this.user.id)

        this.SET_QUOTA(user.quota)
      })
    },

    $_deleteResources_delete() {
      this.toggleModalConfirmButton()

      this.$_deleteResources_isInTrashbin
        ? this.$_deleteResources_trashbin_delete()
        : this.$_deleteResources_filesList_delete()
    },

    $_deleteResources_displayDialog(resources = null, direct = false) {
      // Deleting a resource via direct action
      if (direct) {
        this.resourcesToDelete = [resources]
      } else {
        this.resourcesToDelete = this.selectedFiles
      }

      const modal = {
        variation: 'danger',
        icon: 'warning',
        title: this.$_deleteResources_dialogTitle,
        message: this.$_deleteResources_dialogMessage,
        cancelText: this.$gettext('Cancel'),
        confirmText: this.$gettext('Delete'),
        onCancel: this.$_deleteResources_hideDialog,
        onConfirm: this.$_deleteResources_delete
      }

      this.createModal(modal)
    }
  }
}
