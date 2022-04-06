<template>
  <div>
    <div class="oc-background-highlight oc-p-m oc-mb-m">
      <space-members v-if="showSpaceMembers" />
      <file-shares v-else />
    </div>
    <div v-if="showLinks" class="oc-background-highlight oc-p-m">
      <file-links />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import FileLinks from './FileLinks.vue'
import FileShares from './FileShares.vue'
import SpaceMembers from './SpaceMembers.vue'

export default defineComponent({
  name: 'SharesPanel',
  components: {
    FileLinks,
    FileShares,
    SpaceMembers
  },
  props: {
    showSpaceMembers: { type: Boolean, default: false },
    showLinks: { type: Boolean, default: false }
  }
})
</script>
