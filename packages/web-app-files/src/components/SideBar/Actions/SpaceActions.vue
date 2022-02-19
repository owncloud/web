<template>
  <oc-list id="oc-spaces-actions-sidebar" class-name="oc-mt-s">
    <action-menu-item
      v-for="(action, index) in actions"
      :key="`action-${index}`"
      :action="action"
      :items="resources"
      class="oc-py-xs"
    />
  </oc-list>
</template>

<script>
import { mapGetters } from 'vuex'
import ActionMenuItem from '../../ActionMenuItem.vue'
import Rename from '../../../mixins/spaces/actions/rename'
import Delete from '../../../mixins/spaces/actions/delete'
import Disable from '../../../mixins/spaces/actions/disable'
import Restore from '../../../mixins/spaces/actions/restore'
import EditDescription from '../../../mixins/spaces/actions/editDescription'

export default {
  name: 'SpaceActions',
  title: ($gettext) => {
    return $gettext('Actions')
  },
  components: { ActionMenuItem },
  mixins: [Rename, Delete, EditDescription, Disable, Restore],
  computed: {
    ...mapGetters('Files', ['highlightedFile']),

    resources() {
      return [this.highlightedFile]
    },

    actions() {
      return [
        ...this.$_rename_items,
        ...this.$_editDescription_items,
        ...this.$_restore_items,
        ...this.$_delete_items,
        ...this.$_disable_items
      ].filter((item) => item.isEnabled({ resources: this.resources }))
    }
  }
}
</script>

<style lang="scss">
#oc-spaces-actions-sidebar {
  > li a,
  > li a:hover {
    color: var(--oc-color-swatch-passive-default);
    display: inline-flex;
    gap: 10px;
    vertical-align: top;
  }
}
</style>
