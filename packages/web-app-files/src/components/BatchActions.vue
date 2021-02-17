<template>
  <div>
    <template v-if="isTrashbinRoute">
      <oc-button
        v-if="selectedFiles.length > 0"
        key="restore-btn"
        class="oc-mr-s"
        @click="$_ocTrashbin_restoreFiles()"
      >
        <oc-icon name="restore" aria-hidden="true" />
        <translate>Restore</translate>
      </oc-button>
      <oc-button
        id="delete-selected-btn"
        key="delete-btn"
        @click="selectedFiles.length < 1 ? $_ocTrashbin_empty() : $_deleteResources_displayDialog()"
      >
        <oc-icon name="delete" aria-hidden="true" />
        {{ clearTrashbinButtonText }}
      </oc-button>
    </template>
    <oc-grid v-if="displayBulkActions" gutter="small">
      <div>
        <oc-button
          v-if="canCopy"
          id="copy-selected-btn"
          key="copy-selected-btn"
          @click="triggerLocationPicker('copy')"
        >
          <oc-icon name="file_copy" aria-hidden="true" />
          <translate>Copy</translate>
        </oc-button>
      </div>
      <div>
        <oc-button
          v-if="canMove"
          id="move-selected-btn"
          key="move-selected-btn"
          @click="triggerLocationPicker('move')"
        >
          <oc-icon name="folder-move" aria-hidden="true" />
          <translate>Move</translate>
        </oc-button>
      </div>
      <div>
        <oc-button
          v-if="canDelete"
          id="delete-selected-btn"
          key="delete-selected-btn"
          @click="$_deleteResources_displayDialog()"
        >
          <oc-icon name="delete" aria-hidden="true" />
          <translate>Delete</translate>
        </oc-button>
      </div>
    </oc-grid>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import Routes from '../mixins/routes'

export default {
  mixins: [Routes],

  computed: {
    ...mapGetters('Files', ['selectedFiles']),

    clearTrashbinButtonText() {
      return this.selectedFiles.length < 1 ? this.$gettext('Empty') : this.$gettext('Delete')
    }
  }
}
</script>
