<template>
  <oc-list v-if="displayBulkActions" class="oc-files-appbar-batch-actions oc-my-rm uk-width-1-1">
    <action-menu-item
      v-for="(action, i) in menuItemsBatchActions"
      :key="`batch-action-${i}`"
      :action="action"
      :items="selectedFiles"
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
import DownloadFile from '../../../mixins/actions/downloadFile'
import DownloadFolder from '../../../mixins/actions/downloadFolder'
import EmptyTrashBin from '../../../mixins/actions/emptyTrashBin'
import Move from '../../../mixins/actions/move'
import Restore from '../../../mixins/actions/restore'

export default {
  name: 'BatchActions',
  components: { ActionMenuItem },
  mixins: [
    AcceptShare,
    Copy,
    DeclineShare,
    Delete,
    DownloadFile,
    DownloadFolder,
    EmptyTrashBin,
    Move,
    Restore
  ],
  computed: {
    ...mapGetters('Files', ['selectedFiles']),
    ...mapGetters(['homeFolder']),

    displayBulkActions() {
      return this.$route.meta.hasBulkActions && this.selectedFiles.length > 0
    },

    filterParams() {
      return {
        resources: this.selectedFiles
      }
    },

    menuItemsBatchActions() {
      return [
        ...this.$_acceptShare_items,
        ...this.$_declineShare_items,
        ...this.$_downloadFile_items,
        ...this.$_downloadFolder_items,
        ...this.$_move_items,
        ...this.$_copy_items,
        ...this.$_emptyTrashBin_items,
        ...this.$_delete_items,
        ...this.$_restore_items
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
    margin-top: 10px;
    padding-right: 10px;
  }

  @media only screen and (min-width: 1200px) {
    align-items: center;
    display: flex;
    gap: 10px;
    li {
      margin-top: 0 !important;
    }
  }
}
</style>
