<template>
  <action-menu-item :action="emptyTrashBinAction" :items="selectedFiles" appearance="outline" />
</template>

<script>
import { mapGetters } from 'vuex'
import ActionMenuItem from '../ActionMenuItem.vue'

import EmptyTrashBin from '../../mixins/actions/emptyTrashBin'

export default {
  name: 'EmptyTrashbin',
  components: { ActionMenuItem },
  mixins: [EmptyTrashBin],
  computed: {
    ...mapGetters('Files', ['selectedFiles']),

    emptyTrashBinAction() {
      return this.$_emptyTrashBin_items[0]
    }
  }
}
</script>
