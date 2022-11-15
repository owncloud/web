<template>
  <oc-list id="oc-files-actions-sidebar" class="oc-mt-s">
    <action-menu-item
      v-for="(action, index) in actions"
      :key="`action-${index}`"
      :action="action"
      :items="resources"
      :space="space"
      class="oc-py-xs"
    />
  </oc-list>
</template>

<script lang="ts">
import { mapGetters } from 'vuex'
import ActionMenuItem from '../../ActionMenuItem.vue'

import FileActions from '../../../mixins/fileActions'
import { ComputedRef, defineComponent, inject } from 'vue'
import { Resource } from 'web-client'

export default defineComponent({
  name: 'FileActions',
  components: { ActionMenuItem },
  mixins: [FileActions],
  setup() {
    return {
      space: inject<ComputedRef<Resource>>('displayedSpace')
    }
  },
  computed: {
    ...mapGetters('Files', ['highlightedFile']),

    resources() {
      return [this.highlightedFile]
    },

    actions() {
      return this.$_fileActions_getAllAvailableActions({
        space: this.space,
        resources: this.resources
      })
    }
  }
})
</script>

<style lang="scss">
#oc-files-actions-sidebar {
  > li a,
  > li a:hover {
    color: var(--oc-color-swatch-passive-default);
    display: inline-flex;
    gap: 10px;
    vertical-align: top;
  }
}
</style>
