<template>
  <div>
    <oc-loader v-if="sharesLoading" :aria-label="$gettext('Loading list of shares')" />
    <template v-else>
      <space-members v-if="showSpaceMembers" class="oc-background-highlight oc-p-m oc-mb-s" />
      <file-shares v-else class="oc-background-highlight oc-p-m oc-mb-s" />
      <file-links v-if="showLinks" class="oc-background-highlight oc-p-m" />
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import FileLinks from './FileLinks.vue'
import FileShares from './FileShares.vue'
import SpaceMembers from './SpaceMembers.vue'
import { useSharesStore } from '@ownclouders/web-pkg'
import { storeToRefs } from 'pinia'

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
  },
  setup() {
    const sharesStore = useSharesStore()
    const { loading: sharesLoading } = storeToRefs(sharesStore)

    return {
      sharesLoading
    }
  }
})
</script>
