<template>
  <oc-list class="oc-files-appbar-batch-actions oc-width-1-1">
    <action-menu-item
      v-for="(action, i) in menuItemsBatchActions"
      :key="`batch-action-${i}`"
      :action="action"
      :items="selectedFiles"
      appearance="outline"
      class="oc-mr-s"
    />
  </oc-list>
</template>

<script>
import { mapGetters } from 'vuex'
import ActionMenuItem from '../../ActionMenuItem.vue'
import AcceptShare from '../../../mixins/actions/acceptShare'
import Copy from '../../../mixins/actions/copy'
import DeclineShare from '../../../mixins/actions/declineShare'
import Delete from '../../../mixins/actions/delete'
import DownloadArchive from '../../../mixins/actions/downloadArchive'
import DownloadFile from '../../../mixins/actions/downloadFile'
import EmptyTrashBin from '../../../mixins/actions/emptyTrashBin'
import Move from '../../../mixins/actions/move'
import Restore from '../../../mixins/actions/restore'
import ProjectTrashin from '../../../mixins/actions/projectTrashbin'

export default {
  name: 'BatchActions',
  components: { ActionMenuItem },
  mixins: [
    AcceptShare,
    Copy,
    DeclineShare,
    Delete,
    DownloadArchive,
    DownloadFile,
    EmptyTrashBin,
    Move,
    Restore,
    ProjectTrashin
  ],
  computed: {
    ...mapGetters('Files', ['selectedFiles']),

    filterParams() {
      return {
        resources: this.selectedFiles
      }
    },

    menuItemsBatchActions() {
      return [
        ...this.$_acceptShare_items,
        ...this.$_declineShare_items,
        ...this.$_downloadArchive_items,
        ...this.$_downloadFile_items,
        ...this.$_move_items,
        ...this.$_copy_items,
        ...this.$_emptyTrashBin_items,
        ...this.$_delete_items,
        ...this.$_restore_items,
        ...this.$_project_trashbin
      ].filter((item) => item.isEnabled({ resources: this.selectedFiles }))
    }
  }
}
</script>

<style lang="scss">
.oc-files-appbar-batch-actions {
  display: block;
  li {
    float: left !important;
    margin-top: var(--oc-space-xsmall);
    margin-bottom: var(--oc-space-xsmall);
  }

  @media only screen and (min-width: 1200px) {
    li {
      margin-top: 0;
      margin-bottom: 0;
    }

    align-items: center;
    display: flex;
    gap: var(--oc-space-small);
  }
}
</style>
