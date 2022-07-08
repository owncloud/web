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
import { mapActions, mapGetters } from 'vuex'
import { dirname } from 'path'
import { useGraphClient } from 'web-client/src/composables'

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
    return {
      ...useGraphClient()
    }
  },
  watch: {
    highlightedFile: {
      handler: function (newItem, oldItem) {
        if (oldItem !== newItem) {
          this.$_reloadShares()
        }
      },
      immediate: true
    }
  },
  computed: {
    ...mapGetters('Files', ['highlightedFile'])
  },
  methods: {
    ...mapActions('Files', [
      'loadCurrentFileOutgoingShares',
      'loadSharesTree',
      'loadIncomingShares'
    ]),
    $_reloadShares() {
      this.loadCurrentFileOutgoingShares({
        client: this.$client,
        graphClient: this.graphClient,
        path: this.highlightedFile.path,
        $gettext: this.$gettext,
        storageId: this.highlightedFile.fileId,
        resource: this.highlightedFile
      })
      this.loadIncomingShares({
        client: this.$client,
        path: this.highlightedFile.path,
        $gettext: this.$gettext,
        storageId: this.highlightedFile.fileId
      })
      this.loadSharesTree({
        client: this.$client,
        path: this.highlightedFile.path === '' ? '/' : dirname(this.highlightedFile.path),
        $gettext: this.$gettext,
        storageId: this.highlightedFile.fileId
      })
    }
  }
})
</script>
