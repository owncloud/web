<template>
  <div class="uk-flex uk-flex-middle">
    <template v-if="isTrashbinRoute">
      <oc-button
        v-if="selectedFiles.length > 0"
        id="restore-selected-btn"
        key="restore-btn"
        variation="primary"
        class="oc-mr-s"
        @click="restoreFiles()"
      >
        <oc-icon name="restore" />
        <translate>Restore</translate>
      </oc-button>
      <oc-button
        v-if="!isEmpty"
        id="delete-selected-btn"
        key="delete-btn"
        variation="danger"
        @click="selectedFiles.length < 1 ? emptyTrashbin() : $_deleteResources_displayDialog()"
      >
        <oc-icon name="delete" />
        {{ emptyTrashbinButtonText }}
      </oc-button>
    </template>
    <oc-grid v-if="displayBulkActions" gutter="small">
      <div v-if="canCopy">
        <oc-button
          id="copy-selected-btn"
          key="copy-selected-btn"
          variation="primary"
          @click="triggerLocationPicker('copy')"
        >
          <oc-icon name="file_copy" />
          <translate>Copy</translate>
        </oc-button>
      </div>
      <div v-if="canMove">
        <oc-button
          id="move-selected-btn"
          key="move-selected-btn"
          variation="primary"
          @click="triggerLocationPicker('move')"
        >
          <oc-icon name="folder-move" />
          <translate>Move</translate>
        </oc-button>
      </div>
      <div v-if="canDelete">
        <oc-button
          id="delete-selected-btn"
          key="delete-selected-btn"
          variation="primary"
          @click="$_deleteResources_displayDialog"
        >
          <oc-icon name="delete" />
          <translate>Delete</translate>
        </oc-button>
      </div>
    </oc-grid>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import MixinRoutes from '../../../mixins/routes'
import MixinDeleteResources from '../../../mixins/deleteResources'
import { cloneStateObject } from '../../../helpers/store'
import { canBeMoved } from '../../../helpers/permissions'
import { checkRoute } from '../../../helpers/route'

export default {
  mixins: [MixinRoutes, MixinDeleteResources],

  computed: {
    ...mapGetters('Files', ['selectedFiles', 'currentFolder', 'activeFiles']),

    emptyTrashbinButtonText() {
      return this.selectedFiles.length < 1
        ? this.$gettext('Empty trash bin')
        : this.$gettext('Delete')
    },

    canMove() {
      if (
        !checkRoute(['files-personal', 'files-public-list', 'files-favorites'], this.$route.name)
      ) {
        return false
      }

      const insufficientPermissions = this.selectedFiles.some(resource => {
        return canBeMoved(resource, this.currentFolder.path) === false
      })

      return insufficientPermissions === false
    },

    canCopy() {
      if (
        !checkRoute(['files-personal', 'files-public-list', 'files-favorites'], this.$route.name)
      ) {
        return false
      }

      if (this.isPublicFilesRoute) {
        return this.currentFolder.canCreate()
      }

      return true
    },

    canDelete() {
      if (this.isPublicFilesRoute) {
        return this.currentFolder.canBeDeleted()
      }

      return true
    },

    displayBulkActions() {
      return this.$route.meta.hasBulkActions && this.selectedFiles.length > 0
    },

    isEmpty() {
      return this.activeFiles.length < 1
    }
  },

  methods: {
    ...mapActions('Files', ['removeFilesFromTrashbin', 'resetFileSelection', 'setHighlightedFile']),
    ...mapActions(['showMessage']),

    restoreFiles(resources = this.selectedFiles) {
      for (const resource of resources) {
        this.$client.fileTrash
          .restore(resource.id, resource.path)
          .then(() => {
            const translated = this.$gettext('%{resource} was restored successfully')
            this.showMessage({
              title: this.$gettextInterpolate(translated, { resource: resource.name }, true)
            })
            this.removeFilesFromTrashbin([resource])
          })
          .catch(error => {
            const translated = this.$gettext('Restoration of %{resource} failed')
            this.showMessage({
              title: this.$gettextInterpolate(translated, { resource: resource.name }, true),
              desc: error.message,
              status: 'danger'
            })
          })
      }
      this.resetFileSelection()
      this.setHighlightedFile(null)
    },

    emptyTrashbin() {
      this.$client.fileTrash
        .clearTrashBin()
        .then(() => {
          this.showMessage({
            title: this.$gettext('All deleted files were removed')
          })
          this.removeFilesFromTrashbin(this.activeFiles)
        })
        .catch(error => {
          this.showMessage({
            title: this.$gettext('Could not delete files'),
            desc: error.message,
            status: 'danger'
          })
        })
    },

    triggerLocationPicker(action) {
      const resources = cloneStateObject(this.selectedFiles)
      const context = this.isPublicPage ? 'public' : 'private'

      this.$router.push({
        name: 'files-location-picker',
        params: {
          context,
          item: this.currentFolder.path,
          action
        },
        query: {
          resource: resources.map(resource => {
            return resource.path
          })
        }
      })
    }
  }
}
</script>
